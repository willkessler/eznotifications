// src/ezNotification/ezNotification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EZNotification } from './entities/ezNotification.entity';

@Injectable()
export class EZNotificationService {
  constructor(
    @InjectRepository(EZNotification)
    private ezNotificationRepository: Repository<EZNotification>,
  ) {}

  async create(ezNotificationData: Partial<EZNotification>): Promise<EZNotification> {
    const ezNotification = this.ezNotificationRepository.create(ezNotificationData);
    return this.ezNotificationRepository.save(ezNotification);
  }

  async findAll(): Promise<EZNotification[]> {
    return this.ezNotificationRepository.find();
  }

  // Add other methods for update, delete, etc.
}
