import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './loggerMiddleware';
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

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Apply for all routes or specify certain routes
  }
}
