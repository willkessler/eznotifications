import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from "typeorm";

export class AddUpdatedAtAndByFieldsToAPIKeys1707528854580 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'api_keys',
            new TableColumn({
                name: 'updated_at',
                type: 'timestamp with time zone',
                isNullable: true,
            })
        );
        await queryRunner.addColumn('api_keys', new TableColumn({
            name: 'updated_by_uuid',
            type: 'uuid',
            isNullable: false
        }));

        await queryRunner.createForeignKey('api_keys', new TableForeignKey({
            columnNames: ['updated_by_uuid'],
            referencedColumnNames: ['uuid'],
            referencedTableName: 'users',
            onDelete: 'CASCADE'
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('api_keys');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('updated_by_uuid') !== -1);
        await queryRunner.dropForeignKey('api_keys', foreignKey);
        await queryRunner.dropColumn('api_keys', 'updated_at');
    }

}
