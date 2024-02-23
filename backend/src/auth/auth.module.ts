import { Module } from '@nestjs/common';
//import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
      PassportModule.register({defaultStrategy: 'jwt' }),
      //JwtModule.register({
      //  secret: process.env.DASHBOARD_AUTH_SECRET,
      //  signOptions: { expiresIn: '60s' },
      //}),
  ],
    // providers: [AuthService, JwtStrategy],
    //controllers: [AuthController],
    //exports: [AuthService],
  providers: [JwtStrategy],
  controllers: [],
  exports: [],
})
export class AuthModule {}
