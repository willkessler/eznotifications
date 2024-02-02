import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialPricingModels1706852940090 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.createQueryBuilder()
            .insert()
            .into('pricing_models', [
                'name',
                'price_per_month',
                'price_per_year',
                'max_notifications_per_month',
                'overage_cost_per_notification',
                'is_active'])
            .values([
                {
                    name: 'Starter',
                    price_per_month: 5,
                    price_per_year: 60,
                    max_notifications_per_month: 1000,
                    overage_cost_per_notification: 0.05,
                    is_active: true,
                },
                {
                    name: 'Pro',
                    price_per_month: 20,
                    price_per_year: 240,
                    max_notifications_per_month: 10000,
                    overage_cost_per_notification: 0.01,
                    is_active: true,
                },
                {
                    name: 'Enterprise',
                    price_per_month: 50,
                    price_per_year: 600,
                    max_notifications_per_month: 100000,
                    overage_cost_per_notification: 0.005,
                    is_active: true,
                }
            ])
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.createQueryBuilder()
            .delete()
            .from('pricing_models')
            .where("name IN (:...names)", { names: ['Beginner', 'Pro', 'Enterprise'] })
            .execute();
    }
}
