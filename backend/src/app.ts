import { Module, StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RuntimeConfig } from './config/runtime-config';
import { DatabaseModule } from './infrastructure/database.module';
import { SourceLibraryModule } from './modules/source-library/module';
import { BiblicalCanonModule } from './modules/biblical-canon/module';
import { HealthController } from './presentation/health.controller';
import { ErrorFilter } from './presentation/error.filter';
import { AccessModule } from './infrastructure/access.module';
import { StudyModule } from './modules/study/module';

export function configureTransport(app: INestApplication): void {
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}

export async function createApplication(config: RuntimeConfig): Promise<INestApplication> {
  @Module({
    controllers: [HealthController],
    imports: [DatabaseModule.register(config.databaseUrl), AccessModule.register(config.jwtSecret), SourceLibraryModule, BiblicalCanonModule, StudyModule],
  })
  class ApplicationModule {}
  const app = await NestFactory.create(ApplicationModule, { logger: false, abortOnError: false });
  configureTransport(app);
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Bíblia App — Backend').setVersion('0.1.0').addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }).build());
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'openapi.json' });
  return app;
}
