import { Controller, Get, Post, Query, Body, Param, Put, Delete } from '@nestjs/common';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, MoreThan } from 'typeorm';

import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EZNotificationWebhooks } from './EZNotification.webhooks';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';
import { ApiKey } from './entities/ApiKeys.entity';

@Controller()
export class EZNotificationController {
    constructor(
        private connection: Connection,
        private EZNotificationWebhooks: EZNotificationWebhooks,
        private readonly EZNotificationService: EZNotificationService,
        @InjectRepository(EZNotification)
        private readonly notificationRepository: Repository<EZNotification>,
        @InjectRepository(EndUser)
        private readonly endUserRepository: Repository<EndUser>,
        @InjectRepository(EndUsersServed)
        private readonly endUsersServedRepository: Repository<EndUsersServed>,

    ) {}

    //constructor(private readonly ezNotificationService: EZNotificationService) {}

    @Post('/new')
    async create(@Body() EZNotificationData: Partial<EZNotification>): Promise<EZNotification> {
        return this.EZNotificationService.create(EZNotificationData);
    }

    @Get()
    findAll(
        @Query('userId') userId: string,
        @Query('environments') environments: string,
        @Query('pageId') pageId: string,
    ) {
        const environmentsArray = environments ? environments.split(',') : [];
        const query = { userId, environments: environmentsArray, pageId };
        return this.EZNotificationService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<EZNotification> {
        return this.EZNotificationService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateData: Partial<EZNotification>): Promise<EZNotification> {
        return this.EZNotificationService.update(id, updateData);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<void> {
        return this.EZNotificationService.delete(id);
    }

    @Get('/check')
    doCheck() {
        console.log('check');
        return(1);
    }

    // Handle the clerk webhook callbacks in the service file
    @Post('/clerkWebhook')
    async handleClerkWebhook(@Body() body:any) {
        return this.EZNotificationWebhooks.handleClerkWebhook(body);
    }

    @Post('/api-keys/create')
    async createApiKey(
                       @Body('apiKeyType') apiKeyType: string,
                       @Body('clerkId') clerkId: string,
    ): Promise<ApiKey> {
        return this.EZNotificationService.createApiKey(apiKeyType, clerkId);
    }
    
}


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Request body:', req.body);
        next();
    }
}
