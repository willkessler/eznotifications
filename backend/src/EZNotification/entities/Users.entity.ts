import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserEmail } from './UserEmails.entity';
import { Organization } from './Organizations.entity';
import { UserOrganization } from './UserOrganizations.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true, name:'primary_email' })
    primaryEmail: string;

    @Column({ name: 'clerk_id'})
    clerkId: string;

    @Column({ name: 'signup_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    signupDate: Date;

    @Column({ name: 'last_login', type: 'timestamp', nullable: true })
    lastLogin: Date;

    @Column({ name: 'payment_subscription_id', nullable: true })
    paymentSubscriptionId: string;

    @OneToMany(() => UserEmail, userEmail => userEmail.user)
    emails: UserEmail[];

    @ManyToMany(() => Organization)
    @JoinTable({
        name: 'user_organizations', // The table name for the relation
        joinColumn: {
            name: 'user_uuid',
            referencedColumnName: 'uuid'
        },
        inverseJoinColumn: {
            name: 'organization_uuid',
            referencedColumnName: 'uuid'
        }
    })
    organizations: Organization[];
}
