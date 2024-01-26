import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://' + process.env.HOST + ':' + process.env.INBOUND_PORT, // Allow only your front-end origin
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Adjust as needed
    });

    const config = new DocumentBuilder()
        .setTitle('EZNotifications API')
        .setDescription('The EZNotifications API description')
        .setVersion('1.0')
        .addTag('notifications')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}
bootstrap();
