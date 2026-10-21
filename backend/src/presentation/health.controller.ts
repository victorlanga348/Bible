import { Controller, Get, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { z } from 'zod';
import { Database } from '../infrastructure/database';

const live = z.strictObject({ status: z.literal('ok') });
const ready = z.strictObject({ status: z.literal('ok'), database: z.literal('up') });
const unavailable = z.strictObject({ status: z.literal('unavailable'), database: z.literal('down') });

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly database: Database) {}

  @Get('live')
  @ApiResponse({ status: 200, standardSchema: live })
  live(): z.infer<typeof live> {
    return live.parse({ status: 'ok' });
  }

  @Get('ready')
  @ApiResponse({ status: 200, standardSchema: ready })
  @ApiResponse({ status: 503, standardSchema: unavailable })
  async ready(@Res({ passthrough: true }) response: Response): Promise<z.infer<typeof ready> | z.infer<typeof unavailable>> {
    try {
      await this.database.client.$queryRaw`SELECT 1`;
      return ready.parse({ status: 'ok', database: 'up' });
    } catch {
      response.status(503);
      return unavailable.parse({ status: 'unavailable', database: 'down' });
    }
  }
}
