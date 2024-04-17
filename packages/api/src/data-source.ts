import 'dotenv/config';
import { DataSource } from 'typeorm';
import { EndUser } from './EZNotification/entities/EndUsers.entity';
import { EndUsersServed } from './EZNotification/entities/EndUsersServed.entity';
import { User } from './EZNotification/entities/Users.entity';
import { UserEmails } from './EZNotification/entities/UserEmails.entity';
import { Organization } from './EZNotification/entities/Organizations.entity';
import { ApiKey } from './EZNotification/entities/ApiKeys.entity';
import { PricingModel } from './EZNotification/entities/PricingModels.entity';
import { PermittedDomains } from './EZNotification/entities/PermittedDomains.entity';
import { EZNotification } from './EZNotification/entities/EZNotification.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    schema: 'public',
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'notifications_dev2',
    entities: [EZNotification, EndUser, EndUsersServed, Organization, User, UserEmails, ApiKey, PermittedDomains, PricingModel],
    synchronize: false,
    migrations: ["src/migration/*.ts"],
    migrationsRun: true,
    // other options
    logging: true,
});
