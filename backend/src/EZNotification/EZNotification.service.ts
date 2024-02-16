// src/ezNotification/ezNotification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
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
}

interface OrganizationDataProps {
    organizationName?: string,
    clerkEmail?: string,
    clerkCreatorId: string,
    clerkOrganizationId: string,
    timezone: string,
    permittedDomains: string,
    refreshFrequency: number,
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
        if (ezNotificationData.id) {
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

    async updateNotification(id: string, updateData: Partial<EZNotification>, clerkCreatorId: string): Promise<EZNotification> {
        const ezNotification = await this.ezNotificationRepository.findOneBy({ id: id });
        if (ezNotification) {
            console.log(updateData);
            Object.assign(ezNotification, updateData);
            return this.ezNotificationRepository.save(ezNotification);
        } else {
            throw new NotFoundException(`EZNotification with ID ${id} not found.`);
        }
        return null;
    }

    async findAllNotifications(queryParams: QueryParamProps): Promise<EZNotification[]> {
        console.log('findAll queryParams:', queryParams);
        if (queryParams.clerkUserId !== null) {
            // The dashboard will send a clerk user id, we can use this to find the org for that user
            // and then pull up notifs for that org.
            console.log(`Finding notifications for clerk id: ${queryParams.clerkUserId}`);
            const userOrganization = await this.findUserOrganizationByClerkId(queryParams.clerkUserId);
            if (userOrganization.length > 0) {
                const organizationUuid = userOrganization[0].organization.uuid;
                return this.ezNotificationRepository.find({
                    where: {
                        deleted: false,
                        organization: {
                            uuid : organizationUuid
                        }
                    },
                });
            } else {
                throw new NotFoundException(`Cannot find organization for clerk user id: ${queryParams.clerkUserId}`);
            }
        } else {
            const userId = queryParams.userId;
            const pageId = queryParams.pageId;
            const environments = queryParams.environments;
            return this.connection.transaction(async transactionalEntityManager => {
                // Convert today's date to the user's local timezone
                const today = new Date();
                const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 1));
                const endOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getUTCDate(), 23, 59, 59));

                // Check if EndUser record corresponding to the passed user id exists, and if not, create it.
                let endUser = await transactionalEntityManager.findOne(EndUser, { where: { endUserId: userId } });
                if (!endUser) {
                    endUser = transactionalEntityManager.create(EndUser, { endUserId: userId });
                    await transactionalEntityManager.save(EndUser, endUser);
                }

                // Find all "not yet served to this user" (today) notifications and serve them
                //console.log('startOfDay:', startOfDay, ' endOfDay:', endOfDay);
                const query = this.ezNotificationRepository.createQueryBuilder('notifications')
                    .leftJoin('notifications.endUsersServed', 'endUsersServed')
                    .leftJoin('endUsersServed.endUser', 'endUser',`"endUser"."end_user_id" = :userId`, { userId })
                    .where('endUsersServed.id IS NULL') // exclude notifications already sent to the endUser
                    .andWhere(`(notifications.deleted IS FALSE)`)
                    .andWhere(`((notifications.startDate IS NULL OR notifications.endDate IS NULL) OR
                                (notifications.startDate <= :endOfDay AND notifications.endDate >= :startOfDay) OR
                                ((notifications.startDate BETWEEN :startOfDay AND :endOfDay) OR (notifications.endDate BETWEEN :startOfDay AND :endOfDay))
                              )`, { startOfDay, endOfDay })

                if (pageId) {
                    query.andWhere('notifications.pageId = :pageId', { pageId });
                }

                if (environments && environments.length > 0) {
                    query.andWhere('(notifications.environments && :environments OR notifications.environments = \'{}\' )',
                                   { environments });
                }

                //console.log('Final query:', query.getSql());
                const notifications = await query.getMany();

                // Persist the served notifications as EndUsersServed
                for (const notification of notifications) {
                    const endUsersServed = new EndUsersServed();
                    endUsersServed.notification = notification;
                    endUsersServed.endUser = await transactionalEntityManager.findOne(EndUser, { where: { id: endUser.id } });
                    endUsersServed.accessTime = new Date();
                    await transactionalEntityManager.save(endUsersServed);
                }

                return notifications;
            });
        }
    }

    findOneNotification(id: string): Promise<EZNotification> {
        return this.ezNotificationRepository.findOneBy({ id: id });
    }

    async deleteNotification(id: string): Promise<void> {
        await this.ezNotificationRepository.update(id, {
            deleted: true,
            deletedAt: new Date(),
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
            .addSelect('organization.preferred_timezone')
            .addSelect('organization.refresh_frequency')
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
            const errorMsg = `--> createLocalUser : not creating local user with clerkUserId: ${clerkUserId}, already exists.`;
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
                    `${clerkUserId}, primaryEmail: ${primaryEmail}`);
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
                const errorMsg = 'Error: unable to create userOrganization ' + postfix;
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
                    preferredTimezone: organizationData.timezone,
                    refreshFrequency: organizationData.refreshFrequency,
                    pricingModel: basePricingModel,
                });
                console.log(`Created a new organization with id: ${newOrganization.uuid}`);
                return this.organizationRepository.save(newOrganization);
            } catch (error) {
                const errorMsg = `Unable to create an organization for ` +
                    `clerk org id: ${organizationData.clerkOrganizationId}.`;
                console.log(errorMsg);
                throw new NotFoundException(errorMsg);
            }
        }
    }

    async createApiKey(apiKeyType: string, clerkId: string): Promise<ApiKey> {
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
            // development key generation
            const newApiKey = this.apiKeyRepository.create ({
                apiKey : apiKeyValue,
                apiKeyType: apiKeyType,
                creator: { uuid: userUuid },
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

    async toggleApiKeyActive(clerkId: string, APIKeyId: string) : Promise<ApiKey> {
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
            const apiKeyEntity = await this.apiKeyRepository.findOneBy({ id: APIKeyId });
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
        const permittedDomainsString = permittedDomains.map(pd => pd.domain).join('\n');
        const orgConfig:OrganizationDataProps = {
            organizationName:    organization.name,
            clerkCreatorId:      organization.clerkCreatorId,
            clerkOrganizationId: organization.clerkOrganizationId,
            timezone:            organization.preferredTimezone,
            permittedDomains:    permittedDomainsString,
            refreshFrequency:    organization.refreshFrequency
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
        organization.preferredTimezone = orgConfiguration.timezone;
        organization.refreshFrequency = orgConfiguration.refreshFrequency;

        console.log(`Saving organization config for organization: ` +
            `${JSON.stringify(organization,null,2)}, ` +
            `with permittedDomains: ` +
            `${orgConfiguration.permittedDomains}`);

        await this.organizationRepository.save(organization);
        // Now split the permitted domains, and remove any previous ones before persisting this new set
        // into the permitted_domains table, each one with a foreign key back to this organization

        // Split permittedDomainsString into an array, removing empty strings
        if (orgConfiguration.permittedDomains) {
            const permittedDomains = orgConfiguration.permittedDomains.split(/[\s,]+/).filter(domain => domain.trim().length > 0);

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
        }

        // Return the updated organization entity (optionally refresh it from the database if needed)
        return organization;
    }

}
