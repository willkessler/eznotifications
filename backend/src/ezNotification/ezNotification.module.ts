// src/ezNotification/ezNotification.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './entities/ezNotification.entity';
import { EZNotificationService } from './ezNotification.service';
import { EZNotificationController, LoggerMiddleware } from './ezNotification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EZNotification])],
  providers: [EZNotificationService],
  controllers: [EZNotificationController],
})
export class EZNotificationModule {}
