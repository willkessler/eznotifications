import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeEnvironmentsToArray1706506290053 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE notifications
            ALTER COLUMN environments TYPE text[] USING string_to_array(environments, ',');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE notifications
            ALTER COLUMN environments TYPE text USING array_to_string(environments, ',');
        `);
    }

}
