// src/ezNotification/ezNotification.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EZNotificationController, LoggerMiddleware } from './EZNotification.controller';
import { EndUser } from './entities/EndUsers.entity'; // Import the EndUser entity
import { EndUsersServed } from './entities/EndUsersServed.entity'; // Import the EndUsersServed entity


@Module({
    imports: [TypeOrmModule.forFeature([EZNotification, EndUser, EndUsersServed])],
    controllers: [EZNotificationController],
    providers: [EZNotificationService],
})
export class EZNotificationModule {}
