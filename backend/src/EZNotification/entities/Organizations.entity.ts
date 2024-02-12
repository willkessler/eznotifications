import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from './Users.entity';
import { PricingModel } from './PricingModels.entity';
import { PermittedDomains } from './PermittedDomains.entity';
import { ApiKey } from './ApiKeys.entity';

// Getting all permitted domains for an org:
// const organization = await organizationRepository.findOne({
//    where: { uuid: 'the-organization-uuid' },
//    relations: ['permittedDomains'],
// });

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ nullable: true })
    name: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'preferred_timezone', type: 'text' })
    preferredTimezone: string;

    @Column({ name: 'refresh_frequency', type: 'int' })
    refreshFrequency: number;
    
    @Column({ name: 'clerk_id', type: 'varchar', length: '256', nullable: true })
    clerkId: string;

    @Column({ name: 'creator_clerk_id', type: 'varchar', length: '256', nullable: true })
    creatorClerkId: string;

    @ManyToMany(() => User)
    users: User[];

    @OneToOne(() => PricingModel)
    @JoinColumn({ name: 'pricing_model_uuid' })
    pricingModel: PricingModel;

    @OneToMany(() => ApiKey, apiKey => apiKey.organization)
    apiKeys: ApiKey[];

    @OneToMany(() => PermittedDomains, (permittedDomains) => permittedDomains.organization)
    permittedDomains: PermittedDomains[];    
}
