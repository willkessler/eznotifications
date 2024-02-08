import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from './Users.entity';
import { Organization } from './Organizations.entity';

@Entity('api_keys')
export class ApiKey {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_date: Date;

    @Column({ name: 'api_key', nullable: true })
    apiKey: string;

    @Column({
        name: 'api_key_type',
        type: 'enum',
        enum: ['development', 'production'],
        default: 'development'
    })
    apiKeyType: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, user => user.apiKeys)
    @JoinColumn({ name: 'creator_uuid' })
    creator: User;

    @ManyToOne(() => Organization, organization => organization.apiKeys)
    @JoinColumn({ name: 'organization_uuid' })
    organization: Organization;

}
