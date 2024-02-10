import { Entity, PrimaryGeneratedColumn, Column,JoinColumn, ManyToOne } from 'typeorm';
import { Organization } from './Organizations.entity';
import { User } from './Users.entity';

@Entity('permitted_domains')
export class PermittedDomains {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ name:'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'text' })
    domain: string;

    @Column({name: 'creator_uuid', type: 'uuid' })
    creatorUuid: string;

    @Column({name: 'organization_uuid', type: 'uuid' })
    organizationUuid: string;
    
    @ManyToOne(() => Organization, (organization) => organization.permittedDomains)
    @JoinColumn({ name: 'organization_uuid'})
    organization: Organization;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_uuid'})
    creator: User;
}
