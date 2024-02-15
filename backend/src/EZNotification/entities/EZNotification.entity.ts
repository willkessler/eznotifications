// src/ezNotification/entities/ezNotification.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Organization } from './Organizations.entity';
import { User } from './Users.entity';
import { EndUsersServed } from './EndUsersServed.entity';

@Entity('notifications')
export class EZNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
    
  @Column({ name: 'deleted', default: false })
  deleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
    
  @Column()
  content: string;

  @Column({ name: 'notification_type', nullable: true })
  notificationType: string;

  @Column({ name: 'notification_type_other', nullable: true })
  notificationTypeOther: string;
    
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
    
  @OneToOne(() => User)
  @JoinColumn({ name: 'creator_uuid' })
  creator: User;

  @OneToOne(() => Organization)
  @JoinColumn({ name: 'organization_uuid' })
  organization: Organization;

}
