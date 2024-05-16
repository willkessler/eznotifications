// src/ezNotification/ezNotification.service.ts

import * as JSZip from 'jszip';

import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import { EZNotification } from './entities/EZNotification.entity';
import { User } from './entities/Users.entity';
import { Organization } from './entities/Organizations.entity';
import { PricingModel } from './entities/PricingModels.entity';
import { PermittedDomains } from './entities/PermittedDomains.entity';
import { UserOrganization } from './entities/UserOrganizations.entity';
import { ApiKey } from './entities/ApiKeys.entity';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';

interface QueryParamProps {
    userId? : string,
    clerkUserId? : string,
    pageId? : string,
    environments?: string[],
    domains?: string[],
    organization?: Organization,
}

interface OrganizationDataProps {
    organizationName?: string,
    clerkEmail?: string,
    clerkCreatorId: string,
    clerkOrganizationId: string,
    permittedDomains: string,
    environments: string,
}

@Injectable()
export class EZNotificationService {
    constructor(
        private connection: Connection,

        @InjectRepository(EZNotification)
        private ezNotificationRepository: Repository<EZNotification>,

        @InjectRepository(EndUser)
        private readonly endUserRepository: Repository<EndUser>,

        @InjectRepository(EndUsersServed)
        private readonly endUsersServedRepository: Repository<EndUsersServed>,

        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,

        @InjectRepository(UserOrganization)
        private userOrganizationRepository: Repository<UserOrganization>,

        @InjectRepository(PermittedDomains)
        private readonly permittedDomainsRepository: Repository<PermittedDomains>,

        @InjectRepository(PricingModel)
        private readonly pricingModelRepository: Repository<PricingModel>,
    ) {}

    async createNotification(ezNotificationData: Partial<EZNotification>, clerkCreatorId: string): Promise<EZNotification> {
        console.log(`createNotification: ezNotificationData -> ${ezNotificationData}`);
        if (ezNotificationData.uuid) {
            throw new NotFoundException('Do not pass an ID to create a new EZNotification.');
        }
        // Look up org for the given user, and the user record to set the creator
        const userOrganization = await this.findUserOrganizationByClerkId(clerkCreatorId);
        if (userOrganization.length > 0) {
            ezNotificationData.creator = userOrganization[0].user;
            ezNotificationData.organization = userOrganization[0].organization;
            const ezNotification = this.ezNotificationRepository.create(ezNotificationData);
            return this.ezNotificationRepository.save(ezNotification);
        } else {
            throw new NotFoundException(`Org not found for clerk creator id: ${clerkCreatorId}.`);
        }
    }

  async createSampleNotificationForNewOrganization(clerkUserId: string): Promise<EZNotification> {
    console.log(`createSampleNotificationForNewOrganization running.`);
    // Look up org for the given user, and the user record to set the creator
    const userOrganization = await this.findUserOrganizationByClerkId(clerkUserId);
    if (userOrganization.length > 0) {
      const organizationUuid = userOrganization[0].organization.uuid;
      // now check if this org already has some notifications. If it does do not create a sample notification.
      const oneExistingNotification = await this.ezNotificationRepository.findOne({
        where: {
          organizationUuid: organizationUuid
        }
      });
      if (oneExistingNotification === null) {
        const ezNotificationData:Partial<EZNotification> = {
          creator: userOrganization[0].user,
          organization:userOrganization[0].organization,
          createdAt: new Date(),
          updatedAt: null,
          live: true,
          deleted: false,
          pageId: '',
          mustBeDismissed: true,
          notificationType: 'info',
          environments: [ 'Development' ],
          content: '# Sample notification!\n(Edit or delete me when I\'m no longer needed.)',
        }
        const ezNotification = await this.ezNotificationRepository.create(ezNotificationData);
        return this.ezNotificationRepository.save(ezNotification);
      } else {
        console.log(`Not creating sample notification because notifications already exist for organization : ${organizationUuid}`);
        return null;
      }
    } else {
      throw new NotFoundException(`Org not found for clerk creator id: ${clerkUserId}.`);
      return null
    }
  }

    async updateNotification(uuid: string, updateData: Partial<EZNotification>, clerkCreatorId: string):
                             Promise<EZNotification> {
        const ezNotification = await this.ezNotificationRepository.findOneBy({ uuid: uuid });
        if (ezNotification) {
            const rightNow = new Date();
            const updateDataWithDate = { ...updateData, updatedAt: rightNow };
            console.log(updateDataWithDate);
            Object.assign(ezNotification, updateDataWithDate);
            return this.ezNotificationRepository.save(ezNotification);
        } else {
            throw new NotFoundException(`EZNotification with uuid: ${uuid} not found.`);
        }
        return null;
    }

    async dismissNotification(notificationUuid: string, endUserId: string): Promise<EZNotification> {
        const ezNotification = await this.ezNotificationRepository.findOneBy({ uuid: notificationUuid });
        // We must also try to find the end_user with the passed in userId to identify end_users_served records.
        const endUser = await this.endUserRepository.findOneBy({ endUserId: endUserId });
        if (ezNotification && endUser) {
            console.log(`Dismissing notification uuid: ${notificationUuid} for end user: ${endUserId}.`);
            try {
                const rightNow = new Date();
                const endUserUuid = endUser.uuid;
                const results =
                    await this.endUsersServedRepository
                        .createQueryBuilder()
                        .update(EndUsersServed)
                        .set({ dismissed: true, updatedAt: rightNow })
                        .where("notification_uuid = :notificationUuid", { notificationUuid })
                        .andWhere("end_user_uuid = :endUserUuid", { endUserUuid })
                        .andWhere("dismissed = FALSE")
                        .execute();
                console.log(`Set dismissed flag on: ${results.affected} end_users_served rows.`);
                return ezNotification;
            } catch(error) {
                throw new NotFoundException(`Cannot dismiss end_users_served row for Notification uuid ${notificationUuid}, error: ${error}.`);
            }
        } else {
            throw new NotFoundException(`Notification w/uuid ${notificationUuid} not found, ` +
                ` or endUser w/id ${endUserId} not found.`);
        }
        return null;
    }

    async resetNotificationViews(notificationUuid: string): Promise<EZNotification> {
        const ezNotification = await this.ezNotificationRepository.findOneBy({ uuid: notificationUuid });
        if (ezNotification) {
            console.log(`Resetting views for notification uuid: ${notificationUuid}.`);
            try {
                const rightNow = new Date();
                const results =
                    await this.endUsersServedRepository
                        .createQueryBuilder()
                        .update(EndUsersServed)
                        .set({
                            ignored: true,
                            dismissed: false,
                            updatedAt: rightNow
                        })
                        .where("notification_uuid = :notificationUuid", { notificationUuid })
                        .andWhere("ignored = :ignored", { ignored: false })
                        .execute();
                console.log(`Set ignored flag on: ${results.affected} end_users_served rows.`);
                return ezNotification;
            } catch (error) {
                throw new NotFoundException(`Cannot update end_users_served rows for notification uuid: ${notificationUuid}, error: ${error}.`);
            }
        } else {
            throw new NotFoundException(`Notification w/uuid ${notificationUuid} not found.`);
        }
        return null;
    }

    async resetNotificationViewsForSingleUser(endUserId: string): Promise<boolean> {
      console.log(`Resetting views for single end user, uuid: ${endUserId}.`);
      const endUser = await this.endUserRepository.findOneBy({ endUserId: endUserId });
      if (endUser) {
        try {
          const rightNow = new Date();
          const endUserUuid = endUser.uuid;
          const results = await this.endUsersServedRepository
                                    .createQueryBuilder()
                                    .update(EndUsersServed)
                                    .set({
                                      ignored: true,
                                      dismissed: false,
                                      updatedAt: rightNow
                                    })
                                    .where("end_user_uuid = :endUserUuid", { endUserUuid })
                                    .andWhere("ignored = :ignored", { ignored: false })
                                    .execute();
          console.log(`Set ignored flag on: ${results.affected} end_users_served rows.`);
          return true;
        } catch (error) {
          throw new NotFoundException(`Cannot update end_users_served rows for end user uuid: ${endUserId}, error: ${error}.`);
        }
      }
      return false;
    }

    async resetViewsForNonProductionNotifications(apiKeyString:string): Promise<boolean> {
        // Retrieve the organization UUID based on the API key
        const apiKeyDetails =
            await this.apiKeyRepository.findOne({
                    where: {
                        apiKey: apiKeyString,
                    },
                    relations: ['organization'],
                });

        if (!apiKeyDetails || !apiKeyDetails.organization) {
            throw new Error('API key is invalid or does not have an associated organization.');
        }

        const organizationUuid = apiKeyDetails.organization.uuid;

        // Update the EndUsersServed records
        const rightNow = new Date();
        try {
          const queryBuilder = this.endUsersServedRepository
            .createQueryBuilder()
                    .update(EndUsersServed)
                    .set({
                        ignored: true,
                        dismissed: false,
                        updatedAt: rightNow,
                    })
                    .where(`uuid IN (
                        SELECT eus.uuid
                        FROM end_users_served eus
                        INNER JOIN end_users eu ON eus.end_user_uuid = eu.uuid
                        INNER JOIN notifications n ON eus.notification_uuid = n.uuid
                        WHERE eu.organization_uuid = :organizationUuid
                        AND NOT ('production' = ANY(n.environments))
                        )`, { organizationUuid });
            console.log(`]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]] SQL Query: ${queryBuilder.getQuery()}`);
            const queryParams = queryBuilder.getParameters();
            console.log(`]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]] SQL Query Params: ${JSON.stringify(queryParams,null,2)}`);
            const results = await queryBuilder.execute();
            console.log(`Set ignored flag on: ${results.affected} end_users_served rows for organization id: ${organizationUuid}`);
            return true;
        } catch (error) {
            throw new Error(`Cannot update EndUsersServed records to reset all views, error: ${error}.`);
        }
      return false;
    }

    async findAllNotifications(queryParams: QueryParamProps): Promise<EZNotification[]> {
        //console.log('findAll queryParams:', queryParams);
        if (queryParams.clerkUserId) {
            // The dashboard will send a clerk user id, we can use this to find the org for that user
            // and then pull up notifs for that org.
            console.log(`Finding notifications for clerk id: ${queryParams.clerkUserId}`);
            const userOrganization = await this.findUserOrganizationByClerkId(queryParams.clerkUserId);
            if (userOrganization.length > 0) {
                const organizationUuid = userOrganization[0].organization.uuid;

                return this.ezNotificationRepository.createQueryBuilder('notification')
                    .leftJoinAndSelect('notification.creator', 'creator')
                    .select([
                        'notification.uuid',
                        'notification.content',
                        'notification.createdAt',
                        'notification.updatedAt',
                        'notification.deleted',
                        'notification.deletedAt',
                        'notification.live',
                        'notification.mustBeDismissed',
                        'notification.pageId',
                        'notification.startDate',
                        'notification.endDate',
                        'notification.notificationType',
                        'notification.notificationTypeOther',
                        'notification.environments',
                        'notification.domains',
                        'creator.primaryEmail',
                    ])
                    .where('notification.deleted = :deleted', { deleted: false })
                    .andWhere('notification.organizationUuid = :organizationUuid', { organizationUuid })
                    .getMany();

            } else {
                throw new NotFoundException(`Cannot find organization for clerk user id: ${queryParams.clerkUserId}`);
            }
        } else {
            // The userId must always be passed in. If a react-sdk user forgets to do this, the react-sdk will generate
            // a user id, and store it in a cookie for subsequent requests.
            const userId = queryParams.userId;
            const pageId = queryParams.pageId;
            const environments = queryParams.environments;
            const domains = queryParams.domains;
            const organization = queryParams.organization;
            const organizationUuid = organization.uuid;
            const alreadyViewedNotifications:string[] = [];
            const servedNotifications:EZNotification[] = [];
            // console.log('We found organization with uuid:', organization?.uuid);

          return this.connection.transaction(async transactionalEntityManager => {
            // Check if an EndUser record corresponding to the passed user id exists, and if not, create it.
            let endUser = await transactionalEntityManager.findOne(EndUser, { where: { endUserId: userId } });
            if (!endUser) {
              endUser = transactionalEntityManager.create(EndUser, {
                endUserId: userId,
                organization: organization,
              });
              await transactionalEntityManager.save(EndUser, endUser);
            }

            // Find all notifications not yet served to this user, and serve them
            const eligibleNotifications =
              await transactionalEntityManager.createQueryBuilder(EZNotification, 'notification')
                .andWhere(`(notification.live IS TRUE)`)
                .andWhere(`(notification.deleted IS FALSE)`)
                .andWhere(`((notification.startDate IS NULL  AND notification.endDate IS NULL) OR    -- no time frame set
                            (notification.startDate <= NOW() AND notification.endDate >= NOW() ) OR  -- current time within time frame window
                            (notification.startDate <= NOW() AND notification.endDate IS NULL) OR    -- current time past start time with no end time
                            (notification.startDate IS NULL  AND notification.endDate >= NOW() )     -- current time is before end time with no start time
                         )`)
                .andWhere(`(notification.pageId = :pageId OR notification.pageId = '')`, { pageId })
                .andWhere(`(notification.environments && :environments OR notification.environments = \'{}\')`, { environments })
                .andWhere(`(notification.domains && :domains OR notification.domains = \'{}\')`, { domains })
                .andWhere('notification.organizationUuid = :organizationUuid', { organizationUuid })
                .getMany();

            // Persist the served notifications as EndUsersServed
            // if (eligibleNotifications.length > 0) {
              // console.log(`Persisting potentially ${eligibleNotifications.length} endUserServed records.`);
              //console.log(`Eligible Notifications: ${JSON.stringify(eligibleNotifications,null,2)}`);
            //}

            const rightNow = new Date();
            for (const notification of eligibleNotifications) {
              // Check if there's an existing record for this notification and end user
              //console.log(`Checking notification ${notification.uuid} for existing end_users_served record, userId: ${userId}, notification.uuid: ${notification.uuid}`);
              const existingRecord = await transactionalEntityManager.findOne(EndUsersServed, {
                where: {
                  endUser: { endUserId: userId },
                  notification: { uuid: notification.uuid },
                  ignored: false,
                },
              });
              if (existingRecord) {
                // console.log(`Got existingRecord endUserServedRecord ${JSON.stringify(existingRecord)}`);
                if (existingRecord.dismissed) {
                  alreadyViewedNotifications.push(notification.uuid);
                } else {
                  // Any notif viewed, but not yet dismissed, can be returned to the end user.
                  servedNotifications.push(notification);
                }

                // Update existing end_users_served record.
                // console.log(`^^^^^^ Updating existing endUsersServed record, notification uuid: ${notification.uuid}`);
                existingRecord.latestAccessTime = rightNow;
                existingRecord.viewCount += 1;
                await transactionalEntityManager.save(existingRecord);
              } else {
                // Create a new EndUsersServed record as it doesn't exist
                // console.log(`^^^^^^ Creating new endUsersServed record, notification uuid: ${notification.uuid}`);
                const newRecordData =  {
                  notification: notification,
                  endUser: endUser,
                  firstAccessTime: rightNow,
                  latestAccessTime: rightNow,
                  viewCount: 1,
                  // notifs that don't need to be dismissed are "auto-dismissed" with their first (and only)
                  // viewing
                  dismissed: false,
                }
                //console.log(`newRecordData: ${JSON.stringify(newRecordData,null,2)}`);
                const newEndUsersServedRecord = transactionalEntityManager.create(EndUsersServed,newRecordData);
                await transactionalEntityManager.save(newEndUsersServedRecord);
                servedNotifications.push(notification);
              }
            }

            const filteredNotifications =
              servedNotifications.filter(notification => !alreadyViewedNotifications.includes(notification.uuid))
                .map(notification => ({
                  ...notification,
                  userId: userId,
                  organizationUuid: organization.uuid,
                }));
            //console.log(`filteredNotifications: ${JSON.stringify(filteredNotifications,null,2)}`);

            return filteredNotifications;
          });
        }
    }

    findOneNotification(uuid: string): Promise<EZNotification> {
        return this.ezNotificationRepository.findOneBy({ uuid: uuid });
    }

    async deleteNotification(id: string): Promise<void> {
        const rightNow = new Date();
        await this.ezNotificationRepository.update(id, {
            deleted: true,
            deletedAt: rightNow,
            updatedAt: rightNow,
        });
        return null;
    }

    generateRandomKey(length: number = 8): string {
        return randomBytes(length)
            .toString('base64') // Convert to base64 to ensure characters are printable
            .replace(/\+/g, '0') // Replace + with 0
            .replace(/\//g, '0') // Replace / with 0
            .substring(0, length); // Ensure the key is of the desired length
    }


    async findUserOrganizationByClerkId(clerkId: string): Promise<UserOrganization[]> {
        console.log(`findUserOrganizationByClerkId, clerkId: ${clerkId}`);
        return this.userOrganizationRepository
            .createQueryBuilder('userOrganization')
            .innerJoinAndSelect('userOrganization.organization', 'organization')
            .innerJoin('userOrganization.user', 'user')
            .where('user.clerkId = :clerkId', { clerkId })
            .addSelect('organization.uuid')
            .addSelect('organization.name')
            .addSelect('user.uuid')
            .getMany();
    }

    async createLocalUser(clerkUserId: string, primaryEmail: string) {
        console.log('-1-1-1- createLocalUser -1-1-1');
        console.log('--> createLocalUser, check for pre-existing User record.');
            // Check if the user already exists based on its userId
        const existingUser = await this.userRepository.findOne({
            where: [
                { clerkId: clerkUserId }
            ],
        });

        if (existingUser) {
            const errorMsg = `--> createLocalUser : local user with clerkUserId: ${clerkUserId} already exists.`;
            console.log(errorMsg);
            throw new NotFoundException(errorMsg);
        } else {
            try {
                console.log(`--> createLocalUser : trying to create user with ` +
                    `clerkUserId: ${clerkUserId} and primaryEmail: ${primaryEmail}.`);
                const newUser = await this.userRepository.create({
                    primaryEmail: primaryEmail,
                    clerkId: clerkUserId
                });
                const newUserRecord = await this.userRepository.save(newUser);
                return newUserRecord;
            } catch(error) {
                throw new NotFoundException(`--> createLocalUser : unable to create local user with clerkUserId: ` +
                    `${clerkUserId}, primaryEmail: ${primaryEmail}, error: ${error}`);
            }
        }
    }

    async attachUserToOrganization(clerkUserId: string, clerkOrganizationId: string) {
        console.log('-2-2-2- attachUserToOrganization -2-2-2');
        console.log(`--> clerkUserId: ${clerkUserId}, clerkOrganizationId: ${clerkOrganizationId}.`);
        console.log('-->  attachUserToOrganization, fetch the pre-existing User record.');
        const existingUser = await this.userRepository.findOne({
            where: [
                { clerkId: clerkUserId }
            ],
        });
        if (!existingUser) {
            throw new NotFoundException(`Error: cannot locate existing user record for clerk user id: ${clerkUserId}`);
        }
        console.log('-->  attachUserToOrganization, fetch the pre-existing Organization.');
        const existingOrganization = await this.organizationRepository.findOne({
            where: [
                { clerkOrganizationId: clerkOrganizationId }
            ],
        });

        if (!existingOrganization) {
            throw new NotFoundException(`Error: cannot locate existing organization record for clerk organization id:` +
                `${clerkOrganizationId}`);
        }

        console.log('-->  attachUserToOrganization, fetch the pre-existing UserOrganization.');
        const existingUserOrganization = await this.userOrganizationRepository.findOne({
            where: [
                {
                    user: { uuid: existingUser.uuid },
                    organization: { uuid: existingOrganization.uuid },
                }
            ],
        });

        const postfix = ` for user id: ${existingUser.uuid} / clerk id:${clerkUserId}, ` +
            `org id: ${existingOrganization.uuid} / clerk org id:${clerkOrganizationId}`;
        if (existingUserOrganization) {
            const errorMsg = 'Error: We already have a userOrganization' + postfix;
            console.log(errorMsg);
            throw new NotFoundException(errorMsg);
        } else {
            try {
                const newUserOrganization = this.userOrganizationRepository.create({
                    user: existingUser,
                    organization: existingOrganization
                });
                return this.userOrganizationRepository.save(newUserOrganization);
            } catch (error) {
                const errorMsg = 'Error: unable to create userOrganization ' + postfix + ` error: ${error}`;
                console.error(errorMsg);
                throw new NotFoundException(errorMsg);
            }
        }
    }

    // Create a local org on our side to mirror clerk's. This function is idempotent in that
    // if a local org already exists with the given clerkId for the clerk org, we do nothing.
    async createLocalOrganization(organizationData: OrganizationDataProps) : Promise<Organization> {
        console.log('-0-0-0- createLocalOrganization -0-0-0');
        let theOrganization = null;
        let existingUserOrganization = null;
        const basePricingModel = await this.pricingModelRepository.findOne({
            where: [
                { name: 'Starter' }
            ],
        });

        console.log('--> createLocalOrganization, fetch existing Organization');
        const existingOrganization = await this.organizationRepository.findOne({
            where: [
                { clerkOrganizationId: organizationData.clerkOrganizationId }
            ],
        });

        // check if an org already exists with the given clerkid. If not, create it.
        if (existingOrganization !== null) {
            const errorMsg = `We already have an existing organization for ` +
                `clerk org id: ${organizationData.clerkOrganizationId}.`;
            console.log(errorMsg);
            throw new NotFoundException(errorMsg);
        } else {
            // No organization exists with this clerk id, so we need to create a local organization.
            try {
                const newOrganization = await this.organizationRepository.create({
                    name: organizationData.organizationName,
                    clerkCreatorId: organizationData.clerkCreatorId,
                    clerkOrganizationId: organizationData.clerkOrganizationId,
                    pricingModel: basePricingModel,
                    environments: ["Development", "Staging", "UAT", "Production"],
                });
                console.log(`Created a new organization with id: ${newOrganization.uuid}`);
                return this.organizationRepository.save(newOrganization);
            } catch (error) {
                const errorMsg = `Unable to create an organization for ` +
                    `clerk org id: ${organizationData.clerkOrganizationId}, error: ${error}`;
                console.log(errorMsg);
                throw new NotFoundException(errorMsg);
            }
        }
    }

    async createApiKey(apiKeyType: string, clerkId: string, temporary: boolean): Promise<ApiKey> {
        const apiKeyValue = this.generateRandomKey(8);
        const userOrganization = await this.findUserOrganizationByClerkId(clerkId);
        console.log('createApiKey has apiKeyType:', apiKeyType, 'clerkId:', clerkId, 'userOrg:', userOrganization[0]);
        const organizationUuid = userOrganization[0].organization.uuid;
        const userUuid = userOrganization[0].user.uuid;

        if (apiKeyType === 'production') {
            // Production key generation is wrapped in a transaction
            // because we have to first retire whatever current prod
            // key exists first.  Deactivate any existing active
            // production API key.

            return this.apiKeyRepository.manager.transaction(async (transactionalEntityManager) => {
                console.log('creating a production key with a txn');
                // Deprecate old prod api key
                const userEntity = await transactionalEntityManager.findOneBy(User, { uuid: userUuid });
                if (!userEntity) {
                    throw new Error('User not found');
                }

                await transactionalEntityManager.update(
                    ApiKey,
                    {
                        apiKeyType: 'production',
                        organization: { uuid: organizationUuid },
                        isActive: true,
                    },
                    {
                        isActive: false,
                        updatedBy: userEntity,
                        updatedAt: new Date(),
                    }
                );

                // Create new prod API key
                const newApiKey = transactionalEntityManager.create(ApiKey, {
                    apiKey: apiKeyValue,
                    apiKeyType: 'production',
                    creator: { uuid: userUuid },
                    updatedBy: { uuid: userUuid },
                    organization: { uuid: organizationUuid },
                    isActive: true,
                });

                // Save new prod API key
                await transactionalEntityManager.save(newApiKey);

                return newApiKey;
            });
        } else {
            // Development api key generation. If temporary, set expiry to one hour from now.
            // Any api keys with expiration dates aren't shown in the dashboard and are just used
            // for sandbox testing.
            console.log('Generating dev api key');
            let expireISO = null;
            if (temporary) {
                const oneHourFromNow = DateTime.now().plus({ hours: 1});
                expireISO = oneHourFromNow.toISO();
            }
            const newApiKey = this.apiKeyRepository.create ({
                apiKey : apiKeyValue,
                apiKeyType: apiKeyType,
                creator: { uuid: userUuid },
                expiresAt: expireISO,
                updatedBy: { uuid: userUuid },
                organization: { uuid: organizationUuid },
                isActive: true,
            });

            return this.apiKeyRepository.save(newApiKey);
        }
    };

    // Fetch all API keys for any team associated with a given clerkId
    async findApiKeys(clerkId: string) : Promise<ApiKey[]> {
        const userOrganization = await this.findUserOrganizationByClerkId(clerkId);
        console.log('in service findApiKeys,', JSON.stringify(userOrganization, null, 2));
        if (userOrganization.length == 0) {
            console.log(`findApiKeys: Error: Could not find organization associated with user with clerk id: ${clerkId}`);
            return [];
        }

        const organizationUuid = userOrganization[0].organization.uuid;
        const userUuid = userOrganization[0].user.uuid;
        console.log('find api keys for org:', organizationUuid);

        const apiKeys = await this.apiKeyRepository
            .createQueryBuilder("apiKey")
            .leftJoinAndSelect("apiKey.creator", "user") // Include user details
            .leftJoinAndSelect("apiKey.organization", "organization") // Include organization details
            .where("organization.uuid = :organizationUuid", { organizationUuid }) // Filter by organization UUID
            .orderBy('apiKey.isActive', "DESC")
            .addOrderBy('apiKey.createdAt', "DESC")
            .getMany();

        return apiKeys;

    };

    async toggleApiKeyActive(clerkId: string, APIKeyUuid: string) : Promise<ApiKey> {
        console.log('toggleApiKeyActive');
        const userOrganization = await this.findUserOrganizationByClerkId(clerkId);
        if (userOrganization.length == 0) {
            console.log(`toggleApiKeyActive: Error: Could not find organization associated with user with clerk id: ${clerkId}`);
            return null;
        }

        console.log('In service findApiKeys,', JSON.stringify(userOrganization, null, 2));
        const organizationUuid = userOrganization[0].organization.uuid;
        const userUuid = userOrganization[0].user.uuid;

        return this.apiKeyRepository.manager.transaction(async (transactionalEntityManager) => {
            // Fetch the API key entity to update
            const apiKeyEntity = await this.apiKeyRepository.findOneBy({ uuid: APIKeyUuid });
            if (!apiKeyEntity) {
                throw new Error('API key not found');
            }

            // Update the entity's properties
            apiKeyEntity.isActive = (apiKeyEntity.isActive ? false : true );
            const userEntity = await transactionalEntityManager.findOneBy(User, { uuid: userUuid });
            if (!userEntity) {
                throw new Error('User not found');
            }
            apiKeyEntity.updatedBy = userEntity;
            apiKeyEntity.updatedAt = new Date();

            // Save the updated entity
            return transactionalEntityManager.save(ApiKey, apiKeyEntity);
        })
    }

    async getOrgConfiguration(clerkId: string): Promise<OrganizationDataProps | null> {
        console.log('getOrgConfiguration: calling findUserOrganizationByClerkId');
        const userOrganizations = await this.findUserOrganizationByClerkId(clerkId);

        if (userOrganizations.length == 0) {
            console.log(`getOrgConfiguration: Error: Could not find organization associated with user with clerk id: ${clerkId}`);
            throw new NotFoundException(`Organization not found for user with clerk id: ${clerkId}`);
        }

        console.log('getOrgConfiguration: getting org and orguuid');
        const theUserOrganization = userOrganizations[0];
        const organization = theUserOrganization.organization;
        const organizationUuid = organization.uuid;

        console.log('getOrgConfiguration: finding permittedDomains');

        const permittedDomains = await this.permittedDomainsRepository.find({ where: { organizationUuid } });
        // console.log(`Query for permitted domains returned: ${JSON.stringify(permittedDomains)}, organizationUuid: ${organizationUuid}, clerkId: ${clerkId}`);
        let permittedDomainsString;
        if (permittedDomains) {
          permittedDomainsString = permittedDomains.map(pd => pd.domain).join('\n');
        } else {
          permittedDomainsString = 'stackblitz.com';
        }
        const orgConfig:OrganizationDataProps = {
            organizationName:    organization.name,
            clerkCreatorId:      organization.clerkCreatorId,
            clerkOrganizationId: organization.clerkOrganizationId,
            permittedDomains:    permittedDomainsString,
            environments:        organization.environments ? organization.environments.join('\n') : '{"Development","Staging","UAT","Production"}',
        };
        console.log('orgConfig:', JSON.stringify(orgConfig,null,2));
        return orgConfig;
    }

    async saveOrgConfiguration(orgConfiguration: OrganizationDataProps) : Promise<Organization> {
        console.log(`saveOrgConfiguration: ${orgConfiguration}`);
        const userOrganization = await this.findUserOrganizationByClerkId(orgConfiguration.clerkCreatorId);
        if (userOrganization.length == 0) {
            console.log(`saveOrgConfiguration: Error: Could not find organization associated with user with clerk id: ${orgConfiguration.clerkCreatorId}`);
            return null;
        }

        const organization = userOrganization[0].organization;
        const userUuid = userOrganization[0].user.uuid;
        organization.name = orgConfiguration.organizationName;
        organization.environments = orgConfiguration.environments.split('\n');

        console.log(`Saving organization config for organization: ` +
            `${JSON.stringify(organization,null,2)}, ` +
            `with permittedDomains: ` +
            `${orgConfiguration.permittedDomains}`);

        await this.organizationRepository.save(organization);
        // Now split the permitted domains, and remove any previous ones before persisting this new set
        // into the permitted_domains table, each one with a foreign key back to this organization

        // Split permittedDomainsString into an array, removing empty strings
        if (orgConfiguration.permittedDomains) {
            const permittedDomains = orgConfiguration.permittedDomains.split(/[\s,]+/)
                .filter(domain => domain.trim().length > 0);

            console.log('saving organization:', organization);
            console.log('permittedDomains after splitting:', permittedDomains);

            // Remove any previous permitted domains
            await this.permittedDomainsRepository.delete({ organization: { uuid: organization.uuid } });

            // Create new permitted domain records
            const permittedDomainEntities = permittedDomains.map(domain => {
                const permittedDomain = new PermittedDomains();
                permittedDomain.domain = domain;
                permittedDomain.organization = organization;
                permittedDomain.creatorUuid = userUuid;
                return permittedDomain;
            });

            // Save new permitted domain records
            await this.permittedDomainsRepository.save(permittedDomainEntities);
        } else {
            // if no permitted domains passed in, then delete existing ones
            // Remove any previous permitted domains
            console.log('Deleting existing permitted domains.');
            await this.permittedDomainsRepository.delete({ organization: { uuid: organization.uuid } });
        }

        // Return the updated organization entity (optionally refresh it from the database if needed)
        return organization;
    }

    async fetchGithubCodeAsString(clerkUserId: string, githubUrl: string): Promise<Object> {
        console.log('fetchGithubCodeAsString');
        const userOrganization = await this.findUserOrganizationByClerkId(clerkUserId);
        if (userOrganization?.length == 0) {
            const errorMsg = `fetchGithubCodeAsString : org not found for clerkUserId: ${clerkUserId}.`;
            throw new NotFoundException(errorMsg);
        }

        try {
            const zipUrl = githubUrl + '/archive/refs/heads/main.zip';
            const response = await fetch(zipUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const zip = await JSZip.loadAsync(buffer);
            const files = {};

          await Promise.all(
            Object.keys(zip.files).map(async (filename) => {
              // Ignore directories
              if (zip.files[filename].dir) return;

              const fileContent = await zip.files[filename].async('string');
              // Prepare the file path to match Stackblitz's expectations
              const stackblitzFilePath = `${filename.replace('this-is-not-a-drill-examples-main/', '')}`;
              // skip  image files
              if (!(stackblitzFilePath.endsWith('.webp') || stackblitzFilePath.endsWith('.jpg') || stackblitzFilePath.endsWith('.png'))) {
                files[stackblitzFilePath] = fileContent;
              }
            })
          );

            return ({ files });
        } catch (error) {
            const errorMsg = `Error fetching or processing ZIP at ${githubUrl}: ${error}`;
            console.error(errorMsg);
            throw new NotFoundException(errorMsg);
        }
    }
  
    async fetchSigninTicket(userId: string): Promise<string | null> {
      try {
        const signinTicketUrl = 'https://api.clerk.com/v1/sign_in_tokens';
        const backendSecret = process.env.CLERK_DEMO_BACKEND_SECRET;
        const headers = {
            'Authorization': `Bearer ${backendSecret}`, 
            'Content-type': 'application/json' 
        };
/*
        const body = JSON.stringify({
            email_address: 'demo@this-is-not-a-drill.com',
            redirect_url: 'http://localhost:5173',
        });
*/
        const body = JSON.stringify({
          'user_id': 'user_2fHIpN82F9VZ2KTFOT1PHLBHyqh',
          'expires_in_seconds' : 3600,
        });
        console.log(`headers: ${JSON.stringify(headers,null,2)}`);
        console.log(`body: ${body}`);
        const response = await fetch(signinTicketUrl, {
          method:'POST',
          headers,
          body,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch signin ticket data from Clerk: ${response.statusText}`);
        } else {
          const data = await response.json();
          const ticket = data.token;
          console.log('Got ticket:', ticket);
          return ticket ? ticket : null;
        }
      } catch(error) {
        console.log(`Failed to fetch signin ticket from Clerk at all: ${error}`);
        return null;
      }
    }

}
