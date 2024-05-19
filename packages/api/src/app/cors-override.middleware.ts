import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors';

@Injectable()
export class CorsOverrideMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        /*
        if (req.baseUrl == '/notifications') {
            console.log(`DASHBOARD_HOST=${process.env.DASHBOARD_HOST}`);
            console.log(`method: ${req.method}, headers: ${JSON.stringify(req.headers,null,2)}`);
        }
        */

        // General CORS policy for OPTIONS requests
        const preflightCorsOptions = {
            origin: true, // Reflect the request's origin back to the browser
            methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Tinad-Source'],
            credentials: true,
        };

        //console.log(`method: ${req.method}`);
        if (req.method === 'OPTIONS') {
            // Apply a broad CORS policy to satisfy preflight requests
            // console.log(`********* IMPLEMENTING preflight CORS for req: ${req.baseUrl}, method: ${req.method}`);
            cors(preflightCorsOptions)(req, res, next);
        } else {
            const specialTinadHeader = req.headers['x-tinad-source'];
            //console.log('specialTinadHeader:', specialTinadHeader);
            const sourceIsDashboard = (specialTinadHeader && (specialTinadHeader === 'Dashboard'));
            // Define a more permissive CORS policy for global access endpoints

            const pathStartsWith = (path, prefix) => path.startsWith(prefix);
            const globalAccessPrefixes = [
                '/status',
                '/notifications',
                '/notifications/dismiss',
                '/notifications/reset-views', // note : this call can only be executed via development api keys or the dashboard
            ];
            // Apply the appropriate CORS policy based on the request path
            const validApiAccess = globalAccessPrefixes.some(prefix => pathStartsWith(req.baseUrl, prefix));
            // console.log(`validApiAccess: ${validApiAccess}`);
            let allowedOrigins = ['*']
            if (sourceIsDashboard) {
              allowedOrigins = process.env.DASHBOARD_HOSTS.split(',');
            }

          // Dynamic origin checking function
          const dynamicCorsOptions = {
            origin: (origin, callback) => {
              // Allow requests with no origin (like mobile apps or curl requests)
              if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
              } else {
                callback(new Error('Not allowed by CORS'));
              }
            },
            methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Tinad-Source'],
            exposedHeaders: ['X-Tinad-Poll-Interval'],
          };

            if (sourceIsDashboard || validApiAccess) {
/*
                console.log(sourceIsDashboard ?
                    "********* CORS: VALID DASHBOARD ACCESS" :
                    "********* CORS: VALID API ACCESS"
                           );
*/
                cors(dynamicCorsOptions)(req, res, next);
            } else {
                console.log(`********* DENYING ACCESS for req: ${req.baseUrl}, method: ${req.method}`);
                res.status(403).send('CORS : access denied');
            }
        }
    }
}
