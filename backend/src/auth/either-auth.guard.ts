import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

@Injectable()
export class EitherAuthGuard implements CanActivate {
  constructor(private reflector: Reflector,
              private jwtAuthGuard: JwtAuthGuard,
              private apiKeyAuthGuard: ApiKeyAuthGuard) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      const jwtGuardResult = await this.jwtAuthGuard.canActivate(context);
      if (jwtGuardResult) {
        resolve(true);
        return;
      }

      const apiKeyGuardResult = await this.apiKeyAuthGuard.canActivate(context);
      if (apiKeyGuardResult) {
        resolve(true);
        return;
      }

      resolve(false);
    });
  }
}
