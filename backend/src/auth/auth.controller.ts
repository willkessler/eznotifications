import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('renew')
  async renewToken(@Req() req) {
    // Assuming req.user is populated from the JWT
    return this.authService.login(req.user);
  }
}
