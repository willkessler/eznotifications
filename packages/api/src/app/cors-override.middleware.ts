import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors';

@Injectable()
export class CorsOverrideMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const globalAccessEndpoints = [
            '/status',
            '/notifications',
        ];

        // Define a default CORS policy for the dashboard
        const dashboardCorsOptions = {
            origin: process.env.DASHBOARD_HOST, // Allow only the dashboard domain
            methods: 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        };

        // Define a more permissive CORS policy for global access endpoints
        const globalCorsOptions = {
            origin: '*', // Allow all origins
        };

        // Apply the appropriate CORS policy based on the request path
        if (globalAccessEndpoints.includes(req.path)) {
            cors(globalCorsOptions)(req, res, next);
        } else {
            cors(dashboardCorsOptions)(req, res, next);
        }
    }
}
