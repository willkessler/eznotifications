import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from './Users.entity';
import { Organization } from './Organizations.entity';

@Entity('api_keys')
export class ApiKey {
    @PrimaryGeneratedColumn({name: 'uuid'})
    id: string;

    @Column({ name:'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name:'updated_at', type: 'timestamp' })
    updatedAt: Date;
    
    @Column({ name: 'api_key', nullable: true })
    apiKey: string;

    @Column({
        name: 'api_key_type',
        type: 'enum',
        enum: ['development', 'production'],
        default: 'development'
    })
    apiKeyType: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToOne(() => User, user => user.apiKeys)
    @JoinColumn({ name: 'creator_uuid' })
    creator: User;

    @ManyToOne(() => User, user => user.apiKeys)
    @JoinColumn({ name: 'updated_by_uuid' })
    updatedBy: User;

    @ManyToOne(() => Organization, organization => organization.apiKeys)
    @JoinColumn({ name: 'organization_uuid' })
    organization: Organization;

}
