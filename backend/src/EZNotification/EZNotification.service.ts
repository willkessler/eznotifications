// src/ezNotification/ezNotification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EZNotification } from './entities/EZNotification.entity';

@Injectable()
export class EZNotificationService {
    constructor(
        @InjectRepository(EZNotification)
        private ezNotificationRepository: Repository<EZNotification>,
    ) {}

    async create(ezNotificationData: Partial<EZNotification>): Promise<EZNotification> {
        if (ezNotificationData.id) {
            throw new NotFoundException('Do not pass an ID to create a new EZNotification.');
        }
        const ezNotification = this.ezNotificationRepository.create(ezNotificationData);
        return this.ezNotificationRepository.save(ezNotification);
    }

    async findAll(): Promise<EZNotification[]> {
        return this.ezNotificationRepository.find();
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
            Object.assign(ezNotification, updateData);
            return this.ezNotificationRepository.save(ezNotification);
        } else {
            throw new NotFoundException(`EZNotification with ID ${id} not found.`);
        }
        return null;
    }

    delete(id: string): Promise<void> {
        return this.ezNotificationRepository.delete(id).then(() => undefined);
    }
}
