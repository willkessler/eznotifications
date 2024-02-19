import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pricing_models')
export class PricingModel {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', name: 'created_date' })
    createdDate: Date;

    @Column()
    name: string;

    @Column({ type: 'decimal', name: 'price_per_month' })
    pricePerMonth: number;

    @Column({ type: 'decimal', name: 'price_per_year' })
    pricePerYear: number;

    @Column({ type: 'int', name: 'max_notifications_per_month' })
    maxNotificationsPerMonth: number;

    @Column({ type: 'decimal', name: 'overage_cost_per_notification' })
    overageCostPerNotification: number;
}
