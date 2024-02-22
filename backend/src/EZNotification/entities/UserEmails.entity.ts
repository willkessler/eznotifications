import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './Users.entity';

@Entity('user_emails')
export class UserEmails {
    @PrimaryGeneratedColumn()
    uiid: number;

    @Column()
    email: string;

    @ManyToOne(() => User, User => User.emails, { onDelete: 'CASCADE' })
    user: User;
}
