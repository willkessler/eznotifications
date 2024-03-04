import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Spit out GET, POST etc:
        // console.log('Method:',  req.method);
        // Spit out all inbound headers:
        // console.log('Headers:', req.headers);
        // More targeted output
        // console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);

        // Spit out cookies if needed:
        /*
        if (Object.keys(req.cookies).length > 0) {
            console.log('Parsed cookies: ', req.cookies);
        } else {
            console.log('Raw Cookie Header: ', req.headers.cookie);
        }
        */
        // Spit out the body for POST
        // console.log('Body:',    req.body);

        next();
    }
}
