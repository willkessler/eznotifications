import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateEndUsersServed1708544144533 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.end_users_served (
            "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NULL,
            "first_access_time" timestamptz NOT NULL,
            "latest_access_time" timestamptz NOT NULL,
            "view_count" integer DEFAULT 1,
            "ignored" bool NOT NULL DEFAULT false,
            "dismissed" bool NOT NULL DEFAULT false,
            "notification_uuid" uuid NOT NULL,
            "end_user_uuid" uuid NOT NULL,
            CONSTRAINT "PK_end_users_served" PRIMARY KEY ("uuid")
            );
        `);

        await queryRunner.query(`CREATE INDEX "idx_end_users_served_by_first_access_time" ON public.end_users_served USING btree ("end_user_uuid", "first_access_time");`);

        // Foreign key to the notifications table
        await queryRunner.query(`ALTER TABLE public.end_users_served ADD CONSTRAINT "FK_end_users_served_to_notifications" FOREIGN KEY ("notification_uuid") REFERENCES public.notifications("uuid") ON DELETE CASCADE;`);

        // Foreign key to the end_users table
        await queryRunner.query(`ALTER TABLE public.end_users_served ADD CONSTRAINT "FK_end_users_served_to_end_users" FOREIGN KEY ("end_user_uuid") REFERENCES public.end_users("uuid") ON DELETE CASCADE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.query(`ALTER TABLE public.end_users_served DROP CONSTRAINT IF EXISTS "FK_end_users_served_to_notifications";`);

        await queryRunner.query(`ALTER TABLE public.end_users_served DROP CONSTRAINT IF EXISTS "FK_end_users_served_to_end_users";`);

        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS public."idx_end_users_served_by_first_access_time";`);

        // Then drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS public.end_users_served;`);
    }


}
