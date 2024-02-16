import { Controller, Get, Post, Query, Body, Param, Put, Delete } from '@nestjs/common';
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

@Controller()
export class EZNotificationController {
    constructor(
        private connection: Connection,
        private readonly EZNotificationService: EZNotificationService,

    ) {}

    @Post('/user/create')
    async createUser(
        @Body('clerkUserId') clerkUserId: string,
        @Body('primaryEmail') primaryEmail: string,
    ): Promise<User> {
        const newUser = await this.EZNotificationService.createLocalUser(clerkUserId, primaryEmail);
        return newUser;
    }
    
    @Post('/user/attach-to-organization')
    async attachUserToOrganization(
        @Body('clerkUserId') clerkUserId: string,
        @Body('clerkOrganizationId') clerkOrganizationId: string,
    ): Promise<UserOrganization> {
        const newUserOrganization = await this.EZNotificationService.attachUserToOrganization(clerkUserId, clerkOrganizationId);
        return newUserOrganization;
    }


    @Post('/organization/create')
    async createOrganization(
        @Body('organizationName') organizationName: string,
        @Body('clerkCreatorId') clerkCreatorId: string,
        @Body('clerkOrganizationId') clerkOrganizationId: string,
        @Body('clerkEmail') clerkEmail: string,
        @Body('timezone') timezone: string,
        @Body('permittedDomains') permittedDomains: string,
        @Body('refreshFrequency') refreshFrequency: number,
    ): Promise<Organization> {
        const organizationData = {
            organizationName,
            clerkCreatorId,
            clerkOrganizationId,
            clerkEmail,
            timezone,
            permittedDomains,
            refreshFrequency
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
    getAppConfiguration(
        @Query('clerkId') clerkId: string
    ) {
        console.log('controller get app configuration');
        return this.EZNotificationService.getOrgConfiguration(clerkId);
    };

    @Post('/organization/configure')
    async saveOrgConfiguration(
        @Body('organizationName') organizationName: string,
        @Body('clerkCreatorId') clerkCreatorId: string,
        @Body('clerkOrganizationId') clerkOrganizationId: string,
        @Body('timezone') timezone: string,
        @Body('permittedDomains') permittedDomains: string,
        @Body('refreshFrequency') refreshFrequency: number,
    ): Promise<Organization> {
        console.log('Configure saving settings.');
        return this.EZNotificationService.saveOrgConfiguration({
            organizationName,
            clerkCreatorId,
            clerkOrganizationId, 
            timezone, 
            permittedDomains, 
            refreshFrequency
        });
    }

    @Get('/api-keys')
    findApiKeys(
        @Query('clerkId') clerkId: string
    ) {
        console.log('controller api-keys');
        return this.EZNotificationService.findApiKeys(clerkId);
    }

    @Post('/api-keys/create')
    async createApiKey(
                       @Body('apiKeyType') apiKeyType: string,
                       @Body('clerkId') clerkId: string,
    ): Promise<ApiKey> {
        return this.EZNotificationService.createApiKey(apiKeyType, clerkId);
    }

    @Post('/api-keys/toggle-active')
    async toggleApiKeyStatus(
        @Body('clerkId') clerkId: string,
        @Body('APIKeyId') APIKeyId: string,
    ): Promise<ApiKey> {
        console.log('controller: api-keys toggle, clerkId:', clerkId, 'APIKeyId:', APIKeyId);
        return this.EZNotificationService.toggleApiKeyActive(clerkId, APIKeyId);
    }

    @Get('/notifications')
    findAllNotifications(
        @Query('userId') userId: string,
        @Query('environments') environments: string,
        @Query('pageId') pageId: string,
        @Query('clerkUserId') clerkUserId: string,
    ) {
        const environmentsArray = environments ? environments.split(',') : [];
        const query = { userId, environments: environmentsArray, pageId, clerkUserId };
        return this.EZNotificationService.findAllNotifications(query);
    }

    @Get('/notifications/:id')
    findOneNotification(@Param('id') id: string): Promise<EZNotification> {
        return this.EZNotificationService.findOneNotification(id);
    }

    @Post('/notifications/new')
    async createNotification(@Body() ezNotificationDto: EZNotificationDto): Promise<EZNotification> {
        console.log(`ezNotificationDto: ${JSON.stringify(ezNotificationDto,null,2)}`);
        return this.EZNotificationService.createNotification(ezNotificationDto.EZNotificationData, ezNotificationDto.clerkCreatorId);
    }

    @Put('/notifications/:id')
    updateNotification(@Param('id') id: string, @Body() ezNotificationDto: EZNotificationDto): Promise<EZNotification> {
        return this.EZNotificationService.updateNotification(id, ezNotificationDto.EZNotificationData, ezNotificationDto.clerkCreatorId);
    }

    @Delete('/notifications/:id')
    deleteNotification(@Param('id') id: string): Promise<void> {
        return this.EZNotificationService.deleteNotification(id);
    }

}


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Request body:', req.body);
        next();
    }
}
