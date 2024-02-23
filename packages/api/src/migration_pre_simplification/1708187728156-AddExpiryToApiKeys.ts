import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddExpiryToApiKeys1708187728156 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'api_keys',
            new TableColumn({
                name: 'expires_at',
                type: 'timestamp',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('api_keys', 'expires_at');
    }

}
