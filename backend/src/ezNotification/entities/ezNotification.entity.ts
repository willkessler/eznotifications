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
    
  @Column({ default: false })
  canceled: boolean;

  @Column({ name: 'page_id' })
  pageId: string;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;
}
