import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UnauthorizedExceptionFilter } from './auth/unauthorized-exception.filter';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as heapdump from 'heapdump';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule, { bodyParser: false }); // Disable automatic body parsing

    app.use(cookieParser());

    // Middleware to capture raw body and make it available as a rawBody attribute on the request for
    // webhooks from clerk.
    /*
    app.use('/webhook/clerk', express.raw({ type: 'application/json' }), (req, res, next) => {
        req.rawBody = req.body; // Capture raw body
        //console.log('Raw body captured:', req.rawBody);
        next();
    });
    */
    
    // Re-enable body parsing for other routes
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // defeating CORS because we'll check domain access for API calls via SDKs, and check user-level access
    // via clerk JWKS instead of CORS. CORS doesn't work if the Origin header isn't passed, which is sometimes
    // the case if running the dashboard on port 80.
    /*
    const origin = process.env.INBOUND_PORT === '80' || process.env.INBOUND_PORT === '443' ?
        `http://${process.env.DASHBOARD_HOST}` :
        `http://${process.env.DASHBOARD_HOST}:${process.env.INBOUND_PORT}`;

    app.enableCors({
        origin: origin, // This now correctly handles default ports
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    console.log(`Enabling cors. process.env.DASHBOARD_HOST=${process.env.DASHBOARD_HOST} ` +
        `INBOUND_PORT=${process.env.INBOUND_PORT}`);

    app.enableCors({
        origin: (origin, callback) => {
            let allowedOrigin = origin;
            if (origin === undefined) {
                if (process.env.INBOUND_PORT === '80' || process.env.INBOUND_PORT === '443') {
                    allowedOrigin = `${process.env.PROTOCOL}://${process.env.DASHBOARD_HOST}`;
                } else {
                    allowedOrigin = `${process.env.PROTOCOL}://${process.env.DASHBOARD_HOST}:${process.env.INBOUND_PORT}`;
                }
            }
            console.log(`origin=${origin}`);
            console.log(`allowedOrigin=${allowedOrigin}`);
            callback(null, allowedOrigin);
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });
*/

    const config = new DocumentBuilder()
        .setTitle('This Is Not a Drill! API')
        .setDescription('Below you will find a list of all available endpoints that you can access either via REST calls with an API key, or by using the client SDK. Some of these endpoints are designed for use by the client dashboard only and are not for use with the SDK or direct REST access. See our documentation for more detail.')
        .setVersion('1.0')
        .addTag('All endpoints')
        .addServer('/', 'TINAD API Base Path')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Apply the filter globally
    app.useGlobalFilters(new UnauthorizedExceptionFilter());

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    console.log(`API listening on port ${port}`);

    await app.listen(port);

  if (process.env.ENABLE_HEAPDUMP) {
    heapdump.writeSnapshot((err, filename) => {
      if (err) console.error(err);
      else console.log('Heap dump written to', filename);
    });
  }

}
bootstrap();
