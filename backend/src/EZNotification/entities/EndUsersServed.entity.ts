import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { EndUser } from './EndUsers.entity';
import { EZNotification } from './EZNotification.entity';

@Entity('end_users_served')
export class EndUsersServed {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ name: 'created_at', type: 'timestamp with time zone', nullable: false })
  createdAt: Date;

  @Column({ name:'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'access_time', type: 'timestamp with time zone', nullable: false })
  accessTime: Date;

  @Column({ type: 'boolean', default: false })
  ignored: boolean;

  @ManyToOne(() => EZNotification, notification => notification.endUsersServed)
  @JoinColumn({ name: 'notification_uuid' })
  notification: EZNotification;

  // Relationship: Many EndUsersServed records correspond to one EndUser
  @ManyToOne(() => EndUser, endUser => endUser.endUsersServed)
  @JoinColumn({ name: 'end_user_uuid' })
  endUser: EndUser;
}
