// src/webhook/webhook.controller.ts
import { Controller, Req, Res, Post, Body, Headers, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express'; // Import Response from Express
import { WebhookVerificationError, Webhook } from 'svix';
import { inspect } from 'util';
import { Connection, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EZNotification } from '../EZNotification/entities/EZNotification.entity';
import { Organization } from '../EZNotification/entities/Organizations.entity';
import { UserOrganization } from '../EZNotification/entities/UserOrganizations.entity';
import { User } from '../EZNotification/entities/Users.entity';
import { PricingModel } from '../EZNotification/entities/PricingModels.entity';
import { ApiKey } from '../EZNotification/entities/ApiKeys.entity';

interface RawBodyRequest extends Request {
  rawBody: Buffer;
}


@Controller('webhook')
export class WebhookController {
    private readonly svix: Webhook;

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


    ) {
        // Initialize the Svix webhook verification with the clerk secret
        this.svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    }

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

     @Post('/clerk')
    async handleClerkWebhook(@Req() req: Request, @Res() res: Response): Promise<Response> {
        console.log('*** CLERK WEBHOOK received ***');
        console.log(process.env.CLERK_WEBHOOK_SECRET);
        
         // Extract the raw body as Buffer and convert it to string for verification
        const rawBody = ((req as unknown) as RawBodyRequest).rawBody.toString();
        //const rawBody = req.rawBody.toString();  // this gives a compile time error

        // Construct the headers object required by Svix
        const headers: Record<string, string> = {
            'svix-id': req.headers['svix-id'] as string,
            'svix-timestamp': req.headers['svix-timestamp'] as string,
            'svix-signature': req.headers['svix-signature'] as string,
        };

        try {
            // Verify the signature using the raw body
            this.svix.verify(rawBody, headers);
            console.log('Svix: verification passed.');
        } catch (error) {
            console.error('Svix: verification failed:', error);
            return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: 'Verification failed' });
        }

        // Parse the raw body to an object for further processing
        const body = JSON.parse(rawBody);

        // Here you can use bodyObject for your application logic
        //console.log('Webhook payload:', body);

        // console.log('here is the webhook body');
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

        return res.status(HttpStatus.OK).json({ success: true });

    } catch (error) {
        if (error instanceof WebhookVerificationError) {
            throw new HttpException('Failed to verify webhook signature.', HttpStatus.UNAUTHORIZED);
        } else {
            throw new HttpException('Internal server error.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
