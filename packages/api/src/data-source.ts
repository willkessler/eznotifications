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
    host: 'localhost',
    port: 5432,
    schema: 'public',
    username: 'postgres',
    password: 'postgres',
    database: 'notifications_dev2',
    entities: [EZNotification, EndUser, EndUsersServed, Organization, User, UserEmails, ApiKey, PermittedDomains, PricingModel],
    synchronize: false,
    migrations: ["src/migration/*.ts"],
    // other options
    logging: true,
});
