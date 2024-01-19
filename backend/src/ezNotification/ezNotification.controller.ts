// src/ezNotification/ezNotification.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EZNotification } from './entities/ezNotification.entity';
import { EZNotificationService } from './ezNotification.service';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

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

 @Get(':id')
  findOne(@Param('id') id: string): Promise<EZNotification> {
    return this.ezNotificationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<EZNotification>): Promise<EZNotification> {
    return this.ezNotificationService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.ezNotificationService.delete(id);
  }
}


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request body:', req.body);
    next();
  }
}
