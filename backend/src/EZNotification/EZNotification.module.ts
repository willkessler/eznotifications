// src/ezNotification/ezNotification.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EZNotificationController, LoggerMiddleware } from './EZNotification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EZNotification])],
  providers: [EZNotificationService],
  controllers: [EZNotificationController],
})
export class EZNotificationModule {}
