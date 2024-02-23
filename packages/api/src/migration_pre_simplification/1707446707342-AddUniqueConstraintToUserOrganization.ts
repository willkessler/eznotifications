import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToUserOrganization1707446707342 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_organizations"
            ADD CONSTRAINT "UQ_user_organization" UNIQUE ("user_uuid", "organization_uuid");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_organizations"
            DROP CONSTRAINT "UQ_user_organization";
        `);
    }

}
