import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './Users.entity';
import { Organization } from './Organizations.entity';

@Entity('user_organizations')
export class UserOrganization {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    organization: Organization;

    @Column({
        type: 'enum',
        enum: ['Admin', 'Member', 'Guest'],
        default: 'Member'
    })
    role: string;
}
