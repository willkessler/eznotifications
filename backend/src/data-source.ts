import { DataSource } from 'typeorm';
import { EZNotification } from './ezNotification/entities/ezNotification.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'notifications_dev',
    entities: [EZNotification],
    synchronize: true,
    migrations: ["migration/*.ts"],
    // other options
});
