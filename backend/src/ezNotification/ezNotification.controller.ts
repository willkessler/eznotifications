// src/ezNotification/ezNotification.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EZNotification } from './entities/ezNotification.entity';
import { EZNotificationService } from './ezNotification.service';

@Controller('ezNotifications')
export class EZNotificationController {
  constructor(private readonly ezNotificationService: EZNotificationService) {}

  @Post()
  async create(@Body() ezNotificationData: Partial<EZNotification>): Promise<EZNotification> {
    return this.ezNotificationService.create(ezNotificationData);
  }

  @Get()
  async findAll(): Promise<EZNotification[]> {
    return this.ezNotificationService.findAll();
  }

  // Add other endpoints for update, delete, etc.
}
