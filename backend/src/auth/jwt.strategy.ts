import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        console.log('jwt.strategy.ts constructor');
    super({
        // Use the custom extractor here
        jwtFromRequest: ExtractJwt.fromExtractors([
            (request) => {
                console.log("jwt-strategy: Request cookies:", request.cookies);
                let token = null;
                if (request && request.cookies) {
                    token = request.cookies['__session'];
                    console.log(`Extracted token: ${token}`);
                }
                return token;
            }
        ]),
        secretOrKeyProvider: passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: process.env.CLERK_JWKS_ENDPOINT,
        }),
        //      audience: 'ThisIsNotADrillDashboard',
        issuer: 'https://assured-racer-63.clerk.accounts.dev',
        algorithms: ['RS256'],
    });
  }

/*
  handleRequest(err, user, info) {
      console.log(`JWKS__EDNPOINT: ${process.env.CLERK_JWKS_ENDPOINT}`);
      console.log('handleRequest:', err,user,info);
      if (err || !user) {
          throw err || new UnauthorizedException();
      }
      return user;
  }

  async validate(payload: any) {
    // Your validation logic here
      if (!payload) {
          console.log('Crashing...');
         // throw new UnauthorizedException();
      }
      return { userId: payload.sub, username: payload.username };
  }
*/

}
