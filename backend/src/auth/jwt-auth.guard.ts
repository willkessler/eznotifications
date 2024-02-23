import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context, status) {
    if (err || !user) {
      // Log the error or handle it according to your application's needs
        console.error('Authentication error');
        console.log(`err: ${err}`);
        console.log(`user: ${user}`);
        console.log(`info: ${info}`);
        console.log(`status: ${status}`);

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Access request and response objects
    console.log(request.headers, request.query, request.body);


      // Instead of throwing here, you might choose to return an error response directly,
      // but throwing is the standard approach in NestJS for HTTP errors.
        throw new UnauthorizedException('You are not authorized to perform this action');
    }

    // If there's no problem, return the user object so the request can proceed
    return user;
  }

}

/*

  constructor() {
      console.log('jwt-auth.guard.ts constructor');

    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
            (request) => {
                console.log("Request cookies:", request.cookies);
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
//      audience: 'ThisIsNotADrillDashboard', // Set your audience if applicable
        issuer: 'https://assured-racer-63.clerk.accounts.dev', // Set your issuer if applicable
      algorithms: ['RS256'],
    });
  }

}
*/
