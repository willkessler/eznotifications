import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as express from 'express';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule, { bodyParser: false }); // Disable automatic body parsing

    // Middleware to capture raw body and make it available as a rawBody attribute on the request
    app.use('/eznotifications/webhook/clerk', express.raw({ type: 'application/json' }), (req, res, next) => {
        req.rawBody = req.body; // Capture raw body
        //console.log('Raw body captured:', req.rawBody);
        next();
    });

    // Re-enable body parsing for other routes
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.setGlobalPrefix('eznotifications'); // all API paths must start with 'eznotifications'

    app.enableCors({
        origin: 'http://' + process.env.HOST + ':' + process.env.INBOUND_PORT, // Allow only your front-end origin
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Adjust as needed
    });

    const config = new DocumentBuilder()
        .setTitle('EZNotifications API')
        .setDescription('The EZNotifications API description')
        .setVersion('1.0')
        .addTag('notifications')
        .addServer('/eznotifications', 'EZNotifications API Base Path')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}
bootstrap();
