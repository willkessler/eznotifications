import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './entities/EZNotification.entity';
import { EZNotificationService } from './EZNotification.service';
import { EZNotificationController, LoggerMiddleware } from './EZNotification.controller';
//import { WebhookController } from '../webhook/webhook.controller';
import { EndUser } from './entities/EndUsers.entity';
import { EndUsersServed } from './entities/EndUsersServed.entity';
import { User } from './entities/Users.entity';
import { Organization } from './entities/Organizations.entity';
import { PermittedDomains } from '../EZNotification/entities/PermittedDomains.entity';
import { UserOrganization } from './entities/UserOrganizations.entity';
import { PricingModel } from './entities/PricingModels.entity';
import { ApiKey } from './entities/ApiKeys.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';

@Module({
    imports: [TypeOrmModule.forFeature([EZNotification, EndUser, EndUsersServed, ApiKey, User, Organization, PricingModel, PermittedDomains, UserOrganization ])],
    //controllers: [EZNotificationController, WebhookController],
    //providers: [EZNotificationService, WebhookController, JwtAuthGuard, ApiKeyAuthGuard],
    controllers: [EZNotificationController],
    providers: [EZNotificationService, JwtAuthGuard, ApiKeyAuthGuard],
})
export class EZNotificationModule {}
