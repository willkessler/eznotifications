import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIndexes1707449814496 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add an index on the 'primary_email' column
        await queryRunner.query(`
            CREATE INDEX "IDX_users_primary_email" ON "users" ("primary_email");
        `);

        // Add an index on the 'clerk_id' column
        await queryRunner.query(`
            CREATE INDEX "IDX_users_clerk_id" ON "users" ("clerk_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index on the 'primary_email' column
        await queryRunner.query(`
            DROP INDEX "IDX_users_primary_email";
        `);

        // Drop the index on the 'clerk_id' column
        await queryRunner.query(`
            DROP INDEX "IDX_users_clerk_id";
        `);
    }

}
