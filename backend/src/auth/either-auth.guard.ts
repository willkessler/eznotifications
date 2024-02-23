import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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
        return new Promise(async (resolve, reject) => {
            let jwtSuccess = false;
            let apiKeySuccess = false;
            try {
                console.log('canActivate: checking JWT');
                const jwtGuardResult = await this.jwtAuthGuard.canActivate(context);
                console.log(`canActivate: JTW results ${jwtGuardResult}`);
                if (jwtGuardResult) {
                    resolve(true);
                    return;
                }

                console.log('canActivate: checking API key');
                const apiKeyGuardResult = await this.apiKeyAuthGuard.canActivate(context);
                if (apiKeyGuardResult) {
                    resolve(true);
                    return;
                }

                // If neither guard passes, you can choose to throw an UnauthorizedException
                // or resolve with false depending on your application's requirements.
                // Here, we'll throw an UnauthorizedException for clarity.
                throw new UnauthorizedException('Access Denied');
            } catch (error) {
                // This catch block will handle any exceptions thrown by the guards.
                // You might want to log the error or handle it in a specific way here.
                reject(new UnauthorizedException('Access Denied'));
            }
        });
    }
}
