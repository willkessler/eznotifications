// src/ezNotification/entities/ezNotification.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Organization } from './Organizations.entity';
import { User } from './Users.entity';
import { EndUsersServed } from './EndUsersServed.entity';

@Entity('notifications')
export class EZNotification {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ name: 'created_at', type: 'timestamp with time zone', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;
    
  @Column({ name: 'deleted', default: false })
  deleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
    
  @Column({ default: false })
  live: boolean;

  @Column({ name: 'must_be_dismissed',  default: true })
  mustBeDismissed: boolean;

  @Column()
  content: string;

  @Column({ name: 'page_id' })
  pageId: string;

  @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date',  type: 'timestamp with time zone', nullable: true })
  endDate: Date;

  @Column({ name: 'notification_type', nullable: true })
  notificationType: string;

  @Column({ name: 'notification_type_other', nullable: true })
  notificationTypeOther: string;
    
  @Column( { type: 'text', name: 'environments', array: true, nullable: true })
  environments: string[];
    
  @OneToMany(() => EndUsersServed, endUsersServed => endUsersServed.notification)
  endUsersServed: EndUsersServed[];
    
  @Column({ name: 'creator_uuid', type: 'uuid', nullable: true })
  creatorUuid: string;

  @Column({ name: 'organization_uuid', type: 'uuid', nullable: true })
  organizationUuid: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'creator_uuid' })
  creator: User;

  @OneToOne(() => Organization)
  @JoinColumn({ name: 'organization_uuid' })
  organization: Organization;

}
