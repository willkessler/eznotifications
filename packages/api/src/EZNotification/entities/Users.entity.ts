import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserEmails } from './UserEmails.entity';
import { Organization } from './Organizations.entity';
import { UserOrganization } from './UserOrganizations.entity';
import { ApiKey } from './ApiKeys.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true, name:'primary_email' })
    primaryEmail: string;

    @Column({ name: 'clerk_id'})
    clerkId: string;

    @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    
    @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
    lastLoginAt: Date;

    @Column({ name: 'payment_subscription_id', nullable: true })
    paymentSubscriptionId: string;

    @Column({ name: 'is_banned', default: false })
    isBanned: boolean;

    @OneToMany(() => UserEmails, userEmails => userEmails.user)
    emails: UserEmails[];

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

    @OneToMany(() => ApiKey, apiKey => apiKey.creator)
    apiKeys: ApiKey[];
}
