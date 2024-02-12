import { inspect } from 'util';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EZNotification } from './entities/EZNotification.entity';
import { Organization } from './entities/Organizations.entity';
import { UserOrganization } from './entities/UserOrganizations.entity';
import { User } from './entities/Users.entity';
import { PricingModel } from './entities/PricingModels.entity';
import { ApiKey } from './entities/ApiKeys.entity';

@Injectable()
export class EZNotificationWebhooks {
    constructor(
        private connection: Connection, 

        @InjectRepository(EZNotification)
        private ezNotificationRepository: Repository<EZNotification>,

        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,

        @InjectRepository(User)
        private UserRepository: Repository<User>,

        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,

        @InjectRepository(UserOrganization)
        private userOrganizationRepository: Repository<UserOrganization>,

        @InjectRepository(PricingModel)
        private pricingModelsRepository: Repository<PricingModel>,

    ) {}

    async createUserFromWebhook(bodyData: any) : Promise<User> {
        const primaryEmail = bodyData.email_addresses[0].email_address;
        const clerkId = bodyData.id;

        // First, check if the user already exists based on a unique identifier, e.g., clerkId
        const existingUser = await this.UserRepository.findOne({
            where: [
                { primaryEmail: primaryEmail },
                { clerkId: clerkId }
            ],
        });

        if (existingUser) {
            console.log(`User already exists with clerkId ${clerkId}, no new record created.`);
            return existingUser; // Return the existing user record
        } else {
            // User does not exist, create a new one
            const userData = {
                primaryEmail: primaryEmail,
                clerkId: clerkId,
            };
            console.log('Creating new user from webhook:', userData);
            // next, create a working organization for them (team), unless they joined by an invite from another org.
            return this.UserRepository.save(userData);
        }
    };
    
    // We should get this webhook back when a new member joins the service and creates an org.
    // The clerk user will already exist, but we'll need to create a user record on our side.
    // We will also get this call when a user is invited to a team, but in that case the
    // org should already exist in clerk and on our side.
    async createUserOrganizationFromWebhook(bodyData: any) : Promise<Organization> {
        const clerkOrganization = bodyData.organization;
        const clerkOrganizationId = clerkOrganization.id;
        const clerkOrganizationName = clerkOrganization.name;
        const clerkUserId = bodyData.public_user_data.user_id;
        let existingUser, existingOrganization, existingUserOrganization;

        // Check if the user already exists based on its clerk id
        existingUser = await this.UserRepository.findOne({
            where: [
                { clerkId: clerkUserId }
            ],
        });

        // Check if the org already exists based on its clerk id
        existingOrganization = await this.organizationRepository.findOne({
            where: [
                { clerkId: clerkOrganizationId }
            ],
        });

        if (existingUser !== null && existingOrganization !== null) {
            console.log(`Looking up UserOrganization record for user id: ${existingUser.uuid}, org: ${existingOrganization.uuid}.`);
            existingUserOrganization = await this.userOrganizationRepository.findOne({
                where: [
                    { 
                        user: { uuid: existingUser.uuid },
                        organization: { uuid: existingOrganization.uuid },
                    }
                ],
            });
        }

        const basePricingModel = await this.pricingModelsRepository.findOne({
            where: [
                { name: 'Starter' }
            ],
        });
        

        return this.organizationRepository.manager.transaction(async (transactionalEntityManager) => {
            let theOrganization = null;
            if (existingOrganization) {
                console.log(`Organization already exists with clerk Id: ${clerkOrganizationId}. No new record created.`);
                theOrganization = existingOrganization;
            } else {
                // Create an organization, as well as a user record tied to that organization, in a txn
                const newOrganization = transactionalEntityManager.create(Organization, {
                    name: clerkOrganizationName,
                    clerkId: clerkOrganizationId,
                    creatorClerkId: clerkUserId,
                    pricingModel: basePricingModel,
                    preferredTimezone: 'America/Los_Angeles', // west coast ftw!
                    refreshFrequency: 300,
                });
                await transactionalEntityManager.save(newOrganization);
                theOrganization = newOrganization;
                console.log(`Created a new organization with id: ${newOrganization.uuid}`);
            }


            if (existingUserOrganization) {
                console.log(`UserOrganization record already exists for clerk user: ${clerkUserId}, org: ${clerkOrganizationId}.`);
            } else {
                // Now tie the user to the org
                const newUserOrganization = transactionalEntityManager.create(UserOrganization, {
                    user: existingUser,
                    organization: theOrganization,
                    type: 'Admin',
                });
                await transactionalEntityManager.save(newUserOrganization);
                console.log(`Created a new user_organization with id: ${newUserOrganization.id}`);
            }

            return theOrganization;
        });
    }

    async handleClerkWebhook(body: any): Promise<EZNotification> {
        // create user records if the webhook message is user.create.
        // if it's user.update, then update existing user records 
        // Example of safely accessing nested properties
        console.log('*** CLERK WEBHOOK in webhook handlers ***');
        //console.log(inspect(body, { showHidden: false, depth: null, colors: true }));

        const emailAddresses = body?.data?.email_addresses;
        //console.log('This users email is:', emailAddresses);

        // Determine the event type
        const eventType = body?.type; // Assuming the event type is specified in `body.event`

        console.log(`Webhook: ${eventType}`);

        switch (eventType) {
            case 'user.created':
                await this.createUserFromWebhook(body.data);
                break;
            case 'user.update':
                break;
            case 'organizationMembership.created':
                console.log('Skipping creating userOrg and Org webhook since both handled by organizationMembership.created.');
                break;
            case 'organization.created':
                // Handle new org creation during onboarding
                // Your logic here, e.g., updating an existing user record
                console.log('Skipping creating org webhook since handled by organizationMembership.created.');
                break;
            default:
                console.log('Unhandled event type:', eventType);
                // Handle unknown event type or ignore
        }

        // Return something meaningful or null if nothing to return
        return null;

    }
}
