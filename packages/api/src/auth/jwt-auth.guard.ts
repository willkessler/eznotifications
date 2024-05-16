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
            // console.error('handleRequest: JWT Authentication did not pass.');
            //console.log(`err: ${err}`);
            //console.log(`user: ${user}`);
            //console.log(`info: ${info}`);
            //console.log(`status: ${status}`);

            const httpContext = context.switchToHttp();
            const request = httpContext.getRequest();
            const response = httpContext.getResponse();

            // Access request and response objects
            //console.log(request.headers, request.query, request.body);


            // Instead of throwing here, you might choose to return an error response directly,
            // but throwing is the standard approach in NestJS for HTTP errors.
            throw new UnauthorizedException('You are not authorized to perform this action with that JWT');
        } else {
            console.log('JWT auth check succeeded.');
        }

        // If there's no problem, return the user object so the request can proceed
        return user;
    }

}
