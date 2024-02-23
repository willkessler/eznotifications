import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { LoggerMiddleware } from './loggerMiddleware';
import { AppController } from './app.controller';
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
            logging: ["query"], // disable when we no longer need to track all queries
        }),
    ],
    controllers: [AppController],

})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Apply for all routes or specify certain routes
  }
}
