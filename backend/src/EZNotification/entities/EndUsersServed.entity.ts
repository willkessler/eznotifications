import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { EndUser } from './EndUsers.entity';

@Entity('end_users_served')
export class EndUsersServed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'uuid', nullable: false })
  notificationId: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  access_time: Date;

  // Relationship: Many EndUsersServed records correspond to one EndUser
  @ManyToOne(() => EndUser, endUser => endUser.endUsersServed)
  @Column({ type: 'uuid', nullable: false })
  endUserId: string;

  @Column({ type: 'boolean', default: false })
  ignored: boolean;
}
