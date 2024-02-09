import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from './Users.entity';
import { PricingModel } from './PricingModels.entity';
import { ApiKey } from './ApiKeys.entity';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_date: Date;

    @ManyToMany(() => User)
    users: User[];

    @OneToOne(() => PricingModel)
    @JoinColumn({ name: 'pricing_model_uuid' })
    pricingModel: PricingModel;

    @OneToMany(() => ApiKey, apiKey => apiKey.organization)
    apiKeys: ApiKey[];
}
