// src/ezNotification/ezNotification.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, MoreThan } from 'typeorm';

import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';

@Controller('ezNotifications')
export class EZNotificationController {
    constructor(
        private connection: Connection, 
        private readonly EZNotificationService: EZNotificationService,
        @InjectRepository(EZNotification)
        private readonly notificationRepository: Repository<EZNotification>,
        @InjectRepository(EndUser)
        private readonly endUserRepository: Repository<EndUser>,
        @InjectRepository(EndUsersServed)
        private readonly endUsersServedRepository: Repository<EndUsersServed>,
    ) {}

    //constructor(private readonly ezNotificationService: EZNotificationService) {}

    @Post()
    async create(@Body() EZNotificationData: Partial<EZNotification>): Promise<EZNotification> {
        return this.EZNotificationService.create(EZNotificationData);
    }

    @Get()
    async findAll(): Promise<EZNotification[]> {
        return this.EZNotificationService.findAll();
    }

    @Get('/user/:userId')
    async findAllForUserId(@Param('userId') userId: string): Promise<EZNotification[]> {
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
            const query = this.notificationRepository.createQueryBuilder('notification')
                .leftJoin('notification.endUsersServed', 'endUsersServed')
                .leftJoin('endUsersServed.endUser', 'endUser',`"endUser"."end_user_id" = :userId`, { userId })
                .where('endUsersServed.id IS NULL') // exclude notifications already sent to the endUser
                .andWhere(`
                   ((notification.startDate IS NULL OR notification.endDate IS NULL) OR 
                    (notification.startDate <= :endOfDay AND notification.endDate >= :startOfDay) OR
                    ((notification.startDate BETWEEN :startOfDay AND :endOfDay) OR (notification.endDate BETWEEN :startOfDay AND :endOfDay))
                )`, { startOfDay, endOfDay });

            //console.log(query.getSql());
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
}


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Request body:', req.body);
        next();
    }
}
