import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreatePricingModels1708543929409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.pricing_models (
            "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NULL,
            "name" varchar(255) NOT NULL,
            "is_active" bool NOT NULL DEFAULT false,
            "price_per_month" numeric NOT NULL,
            "price_per_year" numeric NOT NULL,
            "max_notifications_per_month" int NOT NULL,
            "overage_cost_per_notification" numeric NOT NULL,
            "notes" text,
            CONSTRAINT "PK_pricing_models" PRIMARY KEY ("uuid")
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.pricing_models;
            `);
    }

}
