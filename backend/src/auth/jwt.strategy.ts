import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // Use the custom extractor here
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    //console.log("jwt-strategy: Request cookies:", request.cookies);
                    let token = null;
                    if (request && request.cookies) {
                        token = request.cookies['__session'];
                        //console.log(`Extracted token: ${token}`);
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
    
    async validate(payload: any) {
        console.log('JWT Strategy validator() running.');
        if (!payload) {
            console.log('Error: no payload seen in Jwt strategy.');
            throw new UnauthorizedException();
        } else {
            console.log('JWT payload provided.');
        }
        return { userId: payload.sub, username: payload.username };
    }

}
