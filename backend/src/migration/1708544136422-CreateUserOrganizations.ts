import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateUserOrganizations1708544136422 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create the enum type for user organization roles
        await queryRunner.query(`CREATE TYPE "user_organizations_role_enum" AS ENUM('Admin', 'Member', 'Guest');`);

        // Then, create the table with the enum type for the 'role' column
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.user_organizations (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamptz NULL,
                "user_uuid" uuid NOT NULL,
                "organization_uuid" uuid NOT NULL,
                "role" "user_organizations_role_enum" NOT NULL DEFAULT 'Member',
                CONSTRAINT "PK_user_organizations" PRIMARY KEY ("uuid")
                );
       `);

        await queryRunner.query(`ALTER TABLE public.user_organizations ADD CONSTRAINT "FK_user_organizations_to_users" FOREIGN KEY ("user_uuid") REFERENCES public.users("uuid") ON DELETE CASCADE;`);

        await queryRunner.query(`ALTER TABLE public.user_organizations ADD CONSTRAINT "FK_user_organizations_to_organizations" FOREIGN KEY ("organization_uuid") REFERENCES public.organizations("uuid") ON DELETE CASCADE;`);

}

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first to maintain integrity
        await queryRunner.query(`ALTER TABLE public.user_organizations DROP CONSTRAINT IF EXISTS "FK_user_organizations_to_users";`);

        await queryRunner.query(`ALTER TABLE public.user_organizations DROP CONSTRAINT IF EXISTS "FK_user_organizations_to_organizations";`);

        // Then drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS public.user_organizations;`);

        // Finallly, drop the enum type for role
        await queryRunner.query(`DROP TYPE IF EXISTS "user_organizations_role_enum";`);
    }


}
