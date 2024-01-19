import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EZNotificationModule } from './ezNotification/ezNotification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './ezNotification/entities/ezNotification.entity';

@Module({
//    imports: [EZNotificationModule],
    imports: [
        EZNotificationModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'notifications_dev',
            entities: [EZNotification],
            synchronize: false,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
