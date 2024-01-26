import { DataSource } from 'typeorm';
import { EndUser } from './EZNotification/entities/EndUsers.entity';
import { EndUsersServed } from './EZNotification/entities/EndUsersServed.entity';
import { EZNotification } from './EZNotification/entities/EZNotification.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'notifications_dev',
    entities: [EZNotification, EndUser, EndUsersServed],
    synchronize: false,
    migrations: ["migration/*.ts"],
    // other options
    logging: true,
});
