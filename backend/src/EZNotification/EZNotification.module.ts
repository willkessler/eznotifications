import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EZNotificationWebhooks } from './EZNotification.webhooks';
import { EZNotificationController, LoggerMiddleware } from './EZNotification.controller';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';
import { User } from './entities/Users.entity';
import { Organization } from './entities/Organizations.entity';
import { UserOrganization } from './entities/UserOrganizations.entity';
import { ApiKey } from './entities/ApiKeys.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EZNotification, EndUser, EndUsersServed, ApiKey, User, Organization, UserOrganization ])],
    controllers: [EZNotificationController],
    providers: [EZNotificationService, EZNotificationWebhooks],
})
export class EZNotificationModule {}
