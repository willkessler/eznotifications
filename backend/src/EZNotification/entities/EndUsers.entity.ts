import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EndUsersServed } from './EndUsersServed.entity';

@Entity('end_users')
export class EndUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'varchar', length: '256', nullable: false })
  endUserId: string;

  // Relationship: One EndUser can have multiple EndUsersServed records
  @OneToMany(() => EndUsersServed, endUsersServed => endUsersServed.endUserId)
  endUsersServed: EndUsersServed[];
}
