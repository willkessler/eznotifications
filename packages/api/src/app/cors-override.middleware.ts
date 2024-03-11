import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors';

@Injectable()
export class CorsOverrideMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        // Define a default CORS policy for the dashboard
        /*
        if (req.baseUrl == '/notifications') {
            console.log(`DASHBOARD_HOST=${process.env.DASHBOARD_HOST}`);
            console.log(`method: ${req.method}, headers: ${JSON.stringify(req.headers,null,2)}`);
        }
        */
        const dashboardCorsOptions = {
            origin: process.env.DASHBOARD_HOST, // Allow only the dashboard domain
            methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            allowedHeaders: [ 'Content-Type', 'Accept', 'Authorization', 'X-Tinad-Source'],
        };
        const globalCorsOptions = {
            origin: '*', // Allow all origins
            methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: [ 'Content-Type', 'Accept', 'Authorization', 'X-Tinad-Source'],
        };

        if (req.method === 'OPTIONS') {
            // Apply a broad CORS policy to satisfy preflight requests
            console.log(`********* IMPLEMENTING preflight CORS for req: ${req.baseUrl}, method: ${req.method}`);
            cors(dashboardCorsOptions)(req, res, next);
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
            ];
            // Apply the appropriate CORS policy based on the request path
            const validApiAccess = globalAccessPrefixes.some(prefix => pathStartsWith(req.baseUrl, prefix));
            if (sourceIsDashboard) {
                console.log("********* IMPLEMENTING DASHBOARD CORS");
                cors(dashboardCorsOptions)(req, res, next);
            } else if (validApiAccess) {
                console.log(`********* IMPLEMENTING API CORS for req: ${req.baseUrl}, method: ${req.method}`);
                cors(globalCorsOptions)(req, res, next);
            } else {
                res.status(403).send('CORS : access denied');
            }
        }
    }
}
