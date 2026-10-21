import type { INestApplication } from '@nestjs/common';
import type { RuntimeConfig } from './config/runtime-config';
import { createApplication } from './app';

export async function startApplication(config: RuntimeConfig): Promise<INestApplication> {
  const app = await createApplication(config);
  app.enableShutdownHooks();
  try {
    await app.listen(config.port, '127.0.0.1');
    return app;
  } catch (error) {
    await app.close();
    throw error;
  }
}
