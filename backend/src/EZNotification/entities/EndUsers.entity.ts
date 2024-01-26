import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EndUsersServed } from './EndUsersServed.entity';

@Entity('end_users')
export class EndUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'end_user_id', type: 'varchar', length: '256', nullable: false })
  endUserId: string;

  // Relationship: One EndUser can have multiple EndUsersServed records
  @OneToMany(() => EndUsersServed, endUsersServed => endUsersServed.endUser)
  endUsersServed: EndUsersServed[];
}
