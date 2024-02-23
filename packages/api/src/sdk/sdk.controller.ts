// src/sdk/sdk.controller.ts

import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sdk')
@UseGuards(JwtAuthGuard)
export class SDKController {
  // Endpoints for serving data to SDK
}
