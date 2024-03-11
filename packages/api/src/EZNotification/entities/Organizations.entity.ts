import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from './Users.entity';
import { PricingModel } from './PricingModels.entity';
import { PermittedDomains } from './PermittedDomains.entity';
import { ApiKey } from './ApiKeys.entity';
import { EndUser } from './EndUsers.entity';

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

    @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    // The clerk id of the clerk organization that this local org mirrors.
    @Column({ name: 'clerk_organization_id', type: 'varchar', length: '256', nullable: true })
    clerkOrganizationId: string;

    // The clerk id of the user that created this local org when onboarding.
    @Column({ name: 'clerk_creator_id', type: 'varchar', length: '256', nullable: true })
    clerkCreatorId: string;

    @ManyToMany(() => User)
    users: User[];

    @OneToOne(() => PricingModel)
    @JoinColumn({ name: 'pricing_model_uuid' })
    pricingModel: PricingModel;

    @OneToMany(() => ApiKey, apiKey => apiKey.organization)
    apiKeys: ApiKey[];

    @OneToMany(() => PermittedDomains, (permittedDomains) => permittedDomains.organization)
    permittedDomains: PermittedDomains[];    

    @OneToMany(() => EndUser, EndUser => EndUser.organization)
    endUsers: EndUser[];
}
