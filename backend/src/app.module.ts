import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './loggerMiddleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EZNotificationModule } from './ezNotification/ezNotification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EZNotification } from './ezNotification/entities/ezNotification.entity';

@Module({
    imports: [
        EZNotificationModule,
        ConfigModule.forRoot({
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host:     process.env.DB_HOST,
            port:     parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
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
