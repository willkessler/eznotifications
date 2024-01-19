// src/ezNotification/entities/ezNotification.entity.ts

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class EZNotification {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  content: string;

  @Column({ default: false })
  scheduled: boolean;

  @Column({ name: 'start_time', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', nullable: true })
  endTime: Date;

  @Column({ default: false })
  canceled: boolean;

  @Column({ name: 'page_id' })
  pageId: string;
}
