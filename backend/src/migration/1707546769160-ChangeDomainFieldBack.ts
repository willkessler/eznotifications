import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDomainFieldBack1707546769160 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'permitted_domains',
            'domains',
            'domain');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'permitted_domains',
            'domain',
            'domains');
    }

}
