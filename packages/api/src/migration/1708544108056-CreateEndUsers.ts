import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateEndUsers1708544108056 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.end_users (
            "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NULL,
            "end_user_id" varchar(256) NOT NULL,
            "organization_uuid" uuid NOT NULL,
            CONSTRAINT "PK_end_users" PRIMARY KEY ("uuid")
            );
        `);

        // Foreign key to the organizations table
        await queryRunner.query(`ALTER TABLE public.end_users ADD CONSTRAINT "fk_end_users_organization_uuid" FOREIGN KEY ("organization_uuid") REFERENCES public.organizations("uuid") ON DELETE CASCADE;`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.end_users DROP CONSTRAINT IF EXISTS "fk_end_users_organization_uuid";`);

        await queryRunner.query(`DROP TABLE IF EXISTS public.end_users;`);
    }

}
