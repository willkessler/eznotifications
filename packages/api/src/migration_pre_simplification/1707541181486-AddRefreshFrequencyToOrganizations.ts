import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddRefreshFrequencyToOrganizations1707541181486 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'organizations',
            new TableColumn({
                name: 'refresh_frequency',
                type: 'int',
                isNullable: false,
                default: 300,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('organizations', 'refresh_frequency');
    }
}
