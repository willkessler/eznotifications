import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateOrganizations1708543936412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.organizations (
            "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NULL,
            "clerk_creator_id" varchar(255),
            "clerk_organization_id" varchar(255),
            "name" varchar(1000),
            "pricing_model_uuid" uuid,
            CONSTRAINT "PK_organizations" PRIMARY KEY ("uuid")
        );
        `);

        await queryRunner.query(`
            ALTER TABLE public.organizations ADD CONSTRAINT "FK_organizations_to_pricing_models" FOREIGN KEY ("pricing_model_uuid") REFERENCES public.pricing_models("uuid") ON DELETE SET NULL;
        `);
}

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS "FK_organizations_to_pricing_models";`);

        await queryRunner.query(`DROP TABLE IF EXISTS public.organizations;`);
    }
}

