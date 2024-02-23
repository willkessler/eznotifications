import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class EarlyExceptionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
      console.log('Early exception hit');
    throw new UnauthorizedException('Forced early exception');
    // next(); // This would normally be called if you were not intentionally throwing an error.
  }
}
