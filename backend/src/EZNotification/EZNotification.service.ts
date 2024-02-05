// src/ezNotification/ezNotification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { EZNotification } from './entities/EZNotification.entity';
import { Connection, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';

interface QueryParamProps {
    userId? : string,
    pageId? : string,
    environments?: string[],
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
                    query.andWhere('(notifications.environments && :environments OR notifications.environments = \'{}\' )', { environments });
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

    async handleClerkWebhook(object: Body): Promise<EZNotification> {
        // create user records if the webhook message is user.create.
        // if it's user.update, then update existing user records 
        return null;
    }

}
