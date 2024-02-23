import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
      PassportModule.register({defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy],
  controllers: [],
  exports: [],
})
export class AuthModule {}
