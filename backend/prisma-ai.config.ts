import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma-ai/schema.prisma',
  migrations: { path: 'prisma-ai/migrations' },
  datasource: { url: process.env.BIBLE_AI_DATABASE_URL ?? '' },
});
