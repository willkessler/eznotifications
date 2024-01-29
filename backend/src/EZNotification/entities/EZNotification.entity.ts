// src/ezNotification/entities/ezNotification.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EndUsersServed } from './EndUsersServed.entity';

@Entity('notifications')
export class EZNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column()
  content: string;

  @Column({ name: 'notification_type', nullable: true })
  notificationType: string;

  @Column({ default: false })
  live: boolean;

  @Column({ name: 'page_id' })
  pageId: string;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column( { type: 'text', name: 'environments', array: true, nullable: true })
  environments: string[];
    
  @OneToMany(() => EndUsersServed, endUsersServed => endUsersServed.notification)
  endUsersServed: EndUsersServed[];
    
}
