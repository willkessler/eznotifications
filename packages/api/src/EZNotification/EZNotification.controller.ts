import { Controller, Get, Post, Query, Body, Param, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { EitherAuthGuard } from '../auth/either-auth.guard';
import { EitherJWTorDevApiKeyAuthGuard } from '../auth/either-jwt-or-dev-api-key-auth.guard';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, MoreThan } from 'typeorm';

import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EZNotificationDto } from './dto/EZNotification.dto';
import { Organization } from './entities/Organizations.entity';
import { User } from './entities/Users.entity';
import { UserOrganization } from './entities/UserOrganizations.entity';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';
import { ApiKey } from './entities/ApiKeys.entity';
import CustomRequest from '../auth/custom-request';


@Controller()
export class EZNotificationController {
    constructor(
        private connection: Connection,
        private readonly EZNotificationService: EZNotificationService,

    ) {}

    @Get('/status')
    @ApiOperation({summary: 'Run liveness check against API.'})
    @UseGuards(EitherAuthGuard)
    getStatus() {
        console.log('Status check executed.');
        return { status: 'ok' };
    }

    @Post('/user/create')
    @ApiOperation({summary: 'Create dashboard user. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    async createUser(
        @Body('clerkUserId') clerkUserId: string,
        @Body('primaryEmail') primaryEmail: string,
    ): Promise<User> {
        const newUser = await this.EZNotificationService.createLocalUser(clerkUserId, primaryEmail);
        return newUser;
    }
    
    @Post('/user/attach-to-organization')
    @ApiOperation({summary: 'Attach dashboard user to an organization. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    async attachUserToOrganization(
        @Body('clerkUserId') clerkUserId: string,
        @Body('clerkOrganizationId') clerkOrganizationId: string,
    ): Promise<UserOrganization> {
        const newUserOrganization = await this.EZNotificationService.attachUserToOrganization(clerkUserId, clerkOrganizationId);
        return newUserOrganization;
    }

    @Post('/organization/create')
    @ApiOperation({summary: 'Create an organization. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    async createOrganization(
        @Body('organizationName') organizationName: string,
        @Body('clerkCreatorId') clerkCreatorId: string,
        @Body('clerkOrganizationId') clerkOrganizationId: string,
        @Body('clerkEmail') clerkEmail: string,
        @Body('permittedDomains') permittedDomains: string,
    ): Promise<Organization> {
        const organizationData = {
            organizationName,
            clerkCreatorId,
            clerkOrganizationId,
            clerkEmail,
            permittedDomains,
        };
        console.log('controller: create team.')
        const newOrganization = await this.EZNotificationService.createLocalOrganization(organizationData);
        // If we could make a local org, then go ahead and create some permitted domains to start with.
        if (newOrganization) {
            await this.EZNotificationService.saveOrgConfiguration(organizationData);
        }
        return newOrganization;
    }

    @Get('/organization/configure')
    @ApiOperation({summary: 'Fetch organization settings. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    getAppConfiguration(
        @Query('clerkId') clerkId: string
    ) {
        console.log('controller get app configuration');
        return this.EZNotificationService.getOrgConfiguration(clerkId);
    };

    @Post('/organization/configure')
    @ApiOperation({summary: 'Save organization settings. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    async saveOrgConfiguration(
        @Body('organizationName') organizationName: string,
        @Body('clerkCreatorId') clerkCreatorId: string,
        @Body('clerkOrganizationId') clerkOrganizationId: string,
        @Body('permittedDomains') permittedDomains: string,
    ): Promise<Organization> {
        console.log('Configure saving settings.');
        return this.EZNotificationService.saveOrgConfiguration({
            organizationName,
            clerkCreatorId,
            clerkOrganizationId, 
            permittedDomains, 
        });
    }

    @Get('/api-keys')
    @ApiOperation({summary: 'Fetch all available api keys. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    findApiKeys(
        @Query('clerkId') clerkId: string
    ) {
        console.log('controller api-keys');
        return this.EZNotificationService.findApiKeys(clerkId);
    }

    @Post('/api-keys/create')
    @ApiOperation({summary: 'Create an api key. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    async createApiKey(
        @Body('apiKeyType') apiKeyType: string,
        @Body('clerkId') clerkId: string,
        @Body('temporary') temporary: boolean,
    ): Promise<ApiKey> {
        return this.EZNotificationService.createApiKey(apiKeyType, clerkId, temporary);
    }

    @Post('/api-keys/toggle-active')
    @ApiOperation({summary: 'Change liveness of an api key. (Not for direct client use)'})
    @UseGuards(JwtAuthGuard)
    async toggleApiKeyStatus(
        @Body('clerkId') clerkId: string,
        @Body('APIKeyId') APIKeyId: string,
    ): Promise<ApiKey> {
        console.log('Controller: api-keys toggle, clerkId:', clerkId, 'APIKeyId:', APIKeyId);
        return this.EZNotificationService.toggleApiKeyActive(clerkId, APIKeyId);
    }

    @Get('/notifications')
    @ApiOperation({summary: 'Fetch all current notifications, with filters applied. Filters required for SDK use.'})
    @ApiResponse({ status: 200, description: 'Return all current notifications for given filters.' })
    @UseGuards(EitherAuthGuard)
    findAllNotifications(
        @Req() request: CustomRequest,
        @Query('userId') userId: string,
        @Query('environments') environments: string,
        @Query('pageId') pageId: string,
        @Query('clerkUserId') clerkUserId: string,
    ) {
        const environmentsArray = environments ? environments.split(',') : [];
        const organization = request.organization;
        const query = { userId, environments: environmentsArray, pageId, clerkUserId, organization };
        return this.EZNotificationService.findAllNotifications(query);
    }

    @Get('/notifications/:id')
    @ApiOperation({summary: 'Fetch a single notification by its id.'})
    @ApiResponse({ status: 200, description: 'Return a single notification\'s data.' })
    @ApiResponse({ status: 404, description: 'Notification with given id not found.' })
    @UseGuards(EitherAuthGuard)
    findOneNotification(@Param('id') id: string): Promise<EZNotification> {
        return this.EZNotificationService.findOneNotification(id);
    }

    @Post('/notifications/new')
    @ApiOperation({summary: 'Create a new notification. (Not for direct client use)'})
    @ApiResponse({ status: 200, description: 'Returns the new notification\'s data.' })
    @UseGuards(JwtAuthGuard)
    async createNotification(@Body() ezNotificationDto: EZNotificationDto): Promise<EZNotification> {
        console.log(`ezNotificationDto: ${JSON.stringify(ezNotificationDto,null,2)}`);
        return this.EZNotificationService.createNotification(ezNotificationDto.EZNotificationData, 
                                                             ezNotificationDto.clerkCreatorId);
    }

    @Put('/notifications/:id')
    @ApiOperation({summary: 'Update a single notification. (Not for direct client use)'})
    @ApiResponse({ status: 200, description: 'Returns the notification\'s updated data.' })
    @UseGuards(JwtAuthGuard)
    updateNotification(@Param('id') id: string, @Body() ezNotificationDto: EZNotificationDto): Promise<EZNotification> {
        return this.EZNotificationService.updateNotification(id,
                                                             ezNotificationDto.EZNotificationData, 
                                                             ezNotificationDto.clerkCreatorId);
    }

    @Post('/notifications/dismiss')
    @ApiOperation({summary: 'Dismiss a notification, so it is never served again to a specific user (API only).'})
    @ApiResponse({ status: 200, description: 'Returns success.' })
    @UseGuards(ApiKeyAuthGuard)
    async dismissNotification(
        @Body('notificationUuid') notificationUuid: string,
        @Body('userId') endUserId: string,
    ): Promise<EZNotification> {
        console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Controller: dismissing notificationUuid ${notificationUuid} for user ${endUserId}.`);
        return this.EZNotificationService.dismissNotification(notificationUuid, endUserId);
    }

    // This should use the dto so we know who deleted the notification
    @Delete('/notifications/:id')
    @ApiOperation({summary: 'Delete a single notification. (Not for direct client use)'})
    @ApiResponse({ status: 200, description: 'Returns success.' })
    @UseGuards(JwtAuthGuard)
    deleteNotification(@Param('id') id: string): Promise<void> {
        return this.EZNotificationService.deleteNotification(id);
    }

    // This function can only be called by the dashboard OR a development API key
    @Put('/notifications/reset-views/:id')
    @ApiOperation({summary: 'Reset views on a single notification. (Not for direct client use)'})
    @ApiResponse({ status: 200, description: 'Returns success.' })
    @UseGuards(EitherJWTorDevApiKeyAuthGuard)
    resetNotificationViews(@Param('id') id: string): Promise<EZNotification> {
        return this.EZNotificationService.resetNotificationViews(id);
    }

}


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Request body:', req.body);
        next();
    }
}
