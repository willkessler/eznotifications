import { inspect } from 'util';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EZNotification } from './entities/EZNotification.entity';
import { ApiKey } from './entities/ApiKeys.entity';
import { User } from './entities/Users.entity';

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
    
    async handleClerkWebhook(body: any): Promise<EZNotification> {
        // create user records if the webhook message is user.create.
        // if it's user.update, then update existing user records 
        // Example of safely accessing nested properties
        console.log('*** CLERK WEBHOOK in webhook handlers ***');
        console.log(inspect(body, { showHidden: false, depth: null, colors: true }));

        const emailAddresses = body?.data?.email_addresses;
        console.log('This users email is:', emailAddresses);

        // Determine the event type
        const eventType = body?.type; // Assuming the event type is specified in `body.event`

        switch (eventType) {
            case 'user.created':
                // Handle user creation
                await this.createUserFromWebhook(body.data);
                break;

            case 'user.update':
                // Handle user update
                console.log('Handling user update');
                // Your logic here, e.g., updating an existing user record
                break;

            default:
                console.log('Unhandled event type:', eventType);
                // Handle unknown event type or ignore
        }

        // Return something meaningful or null if nothing to return
        return null;

    }
}
