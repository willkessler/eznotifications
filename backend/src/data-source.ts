import { DataSource } from 'typeorm';
import { EZNotification } from './EZNotification/entities/EZNotification.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'notifications_dev',
    entities: [EZNotification],
    synchronize: false,
    migrations: ["migration/*.ts"],
    // other options
});
