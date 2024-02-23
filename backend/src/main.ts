import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UnauthorizedExceptionFilter } from './auth/unauthorized-exception.filter';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule, { bodyParser: false }); // Disable automatic body parsing

    app.use(cookieParser());

    /* Used only to debug cookie reception */
    /*
    app.use((req, res, next) => {
        if (Object.keys(req.cookies).length > 0) {
            console.log('Parsed cookies: ', req.cookies);
        } else {
            console.log('Raw Cookie Header: ', req.headers.cookie);
        }
        next();
    });
    */

    // Middleware to capture raw body and make it available as a rawBody attribute on the request
    app.use('/webhook/clerk', express.raw({ type: 'application/json' }), (req, res, next) => {
        req.rawBody = req.body; // Capture raw body
        //console.log('Raw body captured:', req.rawBody);
        next();
    });

    // Re-enable body parsing for other routes
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.enableCors({
        origin: 'http://' + process.env.HOST + ':' + process.env.INBOUND_PORT, // Allow only your front-end origin
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Adjust as needed
    });

    const config = new DocumentBuilder()
        .setTitle('EZNotifications API')
        .setDescription('This is Not A Drill (TINAD) API description')
        .setVersion('1.0')
        .addTag('notifications')
        .addServer('/', 'TINAD API Base Path')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Apply the filter globally
    app.useGlobalFilters(new UnauthorizedExceptionFilter());

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;

    await app.listen(port);
}
bootstrap();
