import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterDomainFieldNameInPermittedDomains1707533153109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'permitted_domains',
            'domain',
            'domains');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'permitted_domains',
            'domains',
            'domain');
    }

}
