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
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    schema: 'public',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'notifications_dev2',
    entities: [EZNotification, EndUser, EndUsersServed, Organization, User, UserEmails, ApiKey, PermittedDomains, PricingModel],
    synchronize: false,
    migrations: ["src/migration/*.ts"],
    // other options
    logging: true,
});
