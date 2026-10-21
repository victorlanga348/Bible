import { Module, StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RuntimeConfig } from './config/runtime-config';
import { Database } from './infrastructure/database';
import { HealthController } from './presentation/health.controller';
import { ErrorFilter } from './presentation/error.filter';

export function configureTransport(app: INestApplication): void {
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}

export async function createApplication(config: RuntimeConfig): Promise<INestApplication> {
  @Module({
    controllers: [HealthController],
    providers: [{ provide: Database, useFactory: () => new Database(config.databaseUrl) }],
  })
  class ApplicationModule {}
  const app = await NestFactory.create(ApplicationModule, { logger: false });
  configureTransport(app);
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Bíblia App — Backend').setVersion('0.1.0').build());
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'openapi.json' });
  return app;
}
