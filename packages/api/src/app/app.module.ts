import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CorsOverrideMiddleware } from './cors-override.middleware';
import { LoggerMiddleware } from './logger.middleware';
import { AuthModule } from '../auth/auth.module';

import { ApiKey } from '../EZNotification/entities/ApiKeys.entity';
import { User } from '../EZNotification/entities/Users.entity';
import { Organization } from '../EZNotification/entities/Organizations.entity';
import { PermittedDomains } from '../EZNotification/entities/PermittedDomains.entity';
import { PricingModel } from '../EZNotification/entities/PricingModels.entity';
import { UserEmails } from '../EZNotification/entities/UserEmails.entity';
import { UserOrganization } from '../EZNotification/entities/UserOrganizations.entity';
import { EndUser } from '../EZNotification/entities/EndUsers.entity';
import { EndUsersServed } from '../EZNotification/entities/EndUsersServed.entity';
import { EZNotificationModule } from '../EZNotification/EZNotification.module';
import { EZNotification } from '../EZNotification/entities/EZNotification.entity';

@Module({
    imports: [
        AuthModule,
        EZNotificationModule,
        ConfigModule.forRoot({
        }),
        TypeOrmModule.forRoot({
            type:     'postgres',
            host:     process.env.DB_HOST,
            port:     parseInt(process.env.DB_PORT,10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [EZNotification, EndUser, EndUsersServed, 
                       User, Organization, PricingModel,
                       UserEmails, UserOrganization,
                       ApiKey, PermittedDomains],
            synchronize: false,
            migrationsRun: true,
            migrations: ["dist/migration/*.js"],
            logging: process.env.NODE_ENV === 'production' ? ["query", "error"] : ["query", "error"],
        }),
    ],
    controllers: [],

})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(LoggerMiddleware, CorsOverrideMiddleware)
        .forRoutes('*'); // Apply for all routes or specify certain routes
  }
}
