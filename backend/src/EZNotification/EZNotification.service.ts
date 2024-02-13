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
    pageId? : string,
    environments?: string[],
}

interface OrganizationDataProps {
    name?: string,
    clerkId: string,
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

    async create(ezNotificationData: Partial<EZNotification>): Promise<EZNotification> {
        if (ezNotificationData.id) {
            throw new NotFoundException('Do not pass an ID to create a new EZNotification.');
        }
        const ezNotification = this.ezNotificationRepository.create(ezNotificationData);
        return this.ezNotificationRepository.save(ezNotification);
    }

    async findAll(queryParams: QueryParamProps): Promise<EZNotification[]> {
        //console.log('findAll queryParams:', queryParams);
        if (!queryParams.userId) {
            // no userId provided. If the dashboard auth check passed then, return all notifications.
            return this.ezNotificationRepository.find({
                where: {
                    deleted: false
                }
            });
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

    async findAllForUserId(userId: string): Promise<EZNotification[]> {
        return this.ezNotificationRepository.find();
    }

    findOne(id: string): Promise<EZNotification> {
        return this.ezNotificationRepository.findOneBy({ id: id });
    }

    async update(id: string, updateData: Partial<EZNotification>): Promise<EZNotification> {
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

    async delete(id: string): Promise<void> {
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

    async createLocalOrganization(organizationData: OrganizationDataProps) : Promise<Organization> {
        let theOrganization = null;
        let existingUserOrganization = null;
        const basePricingModel = await this.pricingModelRepository.findOne({
            where: [
                { name: 'Starter' }
            ],
        });

        const existingOrganization = await this.organizationRepository.findOneBy({ clerkId: organizationData.clerkId });

        // Check if the user already exists based on its clerk id
        const existingUser = await this.userRepository.findOne({
            where: [
                { clerkId: organizationData.clerkId }
            ],
        });

        if (existingUser && existingOrganization) {
            existingUserOrganization = await this.userOrganizationRepository.findOne({
                where: [
                    { 
                        user: { uuid: existingUser.uuid },
                        organization: { uuid: existingOrganization.uuid },
                    }
                ],
            });
        }

        // check if an org already exists with the given clerkid. If not, create it and bind this user to it.
        if (existingOrganization === null) {
            // no org exists with this clerk id, so we need to create a local org according to the passed in data,
            return this.organizationRepository.manager.transaction(async (transactionalEntityManager) => {
                const newOrganization = await transactionalEntityManager.create(Organization, {
                    name: organizationData.name,
                    clerkId: organizationData.clerkOrganizationId,
                    creatorClerkId: organizationData.clerkId,
                    preferredTimezone: organizationData.timezone,
                    refreshFrequency: organizationData.refreshFrequency,
                    pricingModel: basePricingModel,
                });

                await transactionalEntityManager.save(newOrganization);
                theOrganization = newOrganization;
                console.log(`Created a new organization with id: ${newOrganization.uuid}`);

                let theUser;
                if (existingUser) {
                    theUser = existingUser;
                } else {
                    // create a user record if we don't have one for that clerk id
                    const newUser = transactionalEntityManager.create(User, {});
                    await transactionalEntityManager.save(newUser);
                    theUser = newUser;
                }

                if (existingUserOrganization) {
                    // set the existingUserOrganization to point to theOrganization
                    await transactionalEntityManager.update(
                        UserOrganization,
                        {
                            organization: { uuid: existingOrganization.uuid },
                            user: { uuid: existingUser.uuid },
                        },
                        {
                            organization: { uuid: theOrganization.uuid },
                            user: { uuid: theUser.uuid },
                            role: existingUserOrganization.role,
                        });
                } else {
                    const newUserOrganization = transactionalEntityManager.create(UserOrganization, {
                        user: existingUser,
                        organization: theOrganization,
                        type: 'Admin',
                    });
                    await transactionalEntityManager.save(newUserOrganization);
                    console.log(`Created a new user_organization with id: ${newUserOrganization.uuid}`);
                }
                return theOrganization;
            });
        }
        return null;
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
            console.log(`toggleApiKeyActive: Error, could not find organization associated with user with clerk id: ${clerkId}`);
            return null;
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
            console.log(`toggleApiKeyActive: Error, could not find organization associated with user with clerk id: ${clerkId}`);
            return null;
        }

        console.log('in service findApiKeys,', JSON.stringify(userOrganization, null, 2));
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

    async getOrgConfiguration(clerkId: string) : Promise<{}> {
        const userOrganization = await this.findUserOrganizationByClerkId(clerkId);

        if (userOrganization.length == 0) {
            console.log(`getOrgConfiguration: Error, could not find organization associated with user with clerk id: ${clerkId}`);
            return null;
        }

        const organization = userOrganization[0].organization;
        const organizationUuid = userOrganization[0].organization.uuid;

        const permittedDomains = await this.permittedDomainsRepository.find({ where: { organizationUuid } });
        const appConfig = {
            timezone:         organization.preferredTimezone,
            permittedDomains: permittedDomains,
            refreshFrequency: organization.refreshFrequency
        };
        console.log('appconfig:', appConfig)
        return appConfig;
    }

    async saveOrgConfiguration(appConfiguration: OrganizationDataProps) : Promise<Organization> {
        console.log(`saveAppConfiguration: ${appConfiguration}`);
        const userOrganization = await this.findUserOrganizationByClerkId(appConfiguration.clerkId);
        if (userOrganization.length == 0) {
            console.log(`saveOrgConfiguration: Error, could not find organization associated with user with clerk id: ${appConfiguration.clerkId}`);
            return null;
        }

        const organization = userOrganization[0].organization;
        const userUuid = userOrganization[0].user.uuid;
        organization.preferredTimezone = appConfiguration.timezone;
        organization.refreshFrequency = appConfiguration.refreshFrequency;

        console.log('Saving organization config for organization:',
                    organization, 'with permittedDomains:', appConfiguration.permittedDomains);

        await this.organizationRepository.save(organization);
        // Now split the permitted domains, and remove any previous ones before persisting this new set
        // into the permitted_domains table, each one with a foreign key back to this organization
        
        // Split permittedDomainsString into an array, removing empty strings
        if (appConfiguration.permittedDomains) {
            const permittedDomains = appConfiguration.permittedDomains.split(/[\s,]+/).filter(domain => domain.trim().length > 0);

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
