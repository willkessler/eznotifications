import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateNotifications1708544099795 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.notifications (
            "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz,
            "deleted" bool NOT NULL DEFAULT false,
            "deleted_at" timestamptz,
            "live" bool NOT NULL DEFAULT false,
            "must_be_dismissed" bool NOT NULL default true,
            "content" text NOT NULL,
            "page_id" text NOT NULL,
            "start_date" timestamptz,
            "end_date" timestamptz,
            "notification_type" text,
            "notification_type_other" text,
            "environments" _text,
            "domains" _text,
            "creator_uuid" uuid,
            "organization_uuid" uuid,
            CONSTRAINT "PK_notifications_uuid" PRIMARY KEY ("uuid")
            );
    `);

        await queryRunner.query(`CREATE INDEX "idx_notifications_deleted" ON public.notifications USING btree ("deleted");`);

        // Foreign key to the users table
        await queryRunner.query(`ALTER TABLE public.notifications ADD CONSTRAINT "fk_notifications_creator_uuid" FOREIGN KEY ("creator_uuid") REFERENCES public.users("uuid") ON DELETE CASCADE;`);

        // Foreign key to the organizations table
        await queryRunner.query(`ALTER TABLE public.notifications ADD CONSTRAINT "fk_notifications_organization_uuid" FOREIGN KEY ("organization_uuid") REFERENCES public.organizations("uuid") ON DELETE CASCADE;`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
        await queryRunner.query(`ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS "fk_notifications_creator_uuid";`);

        await queryRunner.query(`ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS "fk_notifications_organization_uuid";`);

        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS public."idx_notifications_deleted";`);

        // Then drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS public.notifications;`);
    }

}
