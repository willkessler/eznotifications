import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateAPIKeys1708543942850 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "api_key_role_enum" AS ENUM('development', 'production');`);

        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.api_keys (
            "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz,
            "expires_at" timestamptz NULL,
            "api_key" text,
            "api_key_type" "api_key_role_enum" NOT NULL DEFAULT 'development',
            "is_active" bool NOT NULL DEFAULT true,
            "creator_uuid" uuid NOT NULL,
            "organization_uuid" uuid NOT NULL,
            "updated_by_uuid" uuid NOT NULL,
            CONSTRAINT "PK_api_keys" PRIMARY KEY ("uuid")
            );
     `);

        await queryRunner.query(`ALTER TABLE public.api_keys ADD CONSTRAINT "FK_api_keys_to_users_creator" FOREIGN KEY ("creator_uuid") REFERENCES public.users("uuid") ON DELETE SET NULL;`);

    await queryRunner.query(`ALTER TABLE public.api_keys ADD CONSTRAINT "FK_api_keys_to_organizations" FOREIGN KEY ("organization_uuid") REFERENCES public.organizations("uuid") ON DELETE SET NULL;`);

    await queryRunner.query(`ALTER TABLE public.api_keys ADD CONSTRAINT "FK_api_keys_to_users_updated_by" FOREIGN KEY ("updated_by_uuid") REFERENCES public.users("uuid") ON DELETE CASCADE;`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS "FK_api_keys_to_users_updated_by";`);
        await queryRunner.query(`ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS "FK_api_keys_to_organizations";`);
        await queryRunner.query(`ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS "FK_api_keys_to_users_creator";`);
        await queryRunner.query(`DROP TABLE IF EXISTS public.api_keys;`);
    }
}
