import { createApplication } from '../../src/app';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { Database } from '../../src/infrastructure/database';
import { DatabaseModule } from '../../src/infrastructure/database.module';

describe('failure of real Nest module composition', () => {
  it('composes the real modules with one shared database lifecycle and no eager query', async () => {
    // Observational lifecycle spy; real module factories/client and shutdown run.
    const closed = jest.spyOn(Database.prototype, 'onModuleDestroy');
    try {
      const app = await createApplication({ ...parseRuntimeConfig(process.env), databaseUrl: 'postgresql://localhost:9/biblia_test' });
      try {
        await app.init();
        expect(app.get(Database)).toBeInstanceOf(Database);
      } finally { await app.close(); }
      expect(closed).toHaveBeenCalledTimes(1);
    } finally { closed.mockRestore(); }
  });
  it('propagates a failed provider without requesting process exit or abort', async () => {
    // Local configuration fault only: real Nest initialisation, no DB operations
    // or substitute persistence proof. The process must remain under caller control.
    const configuration = jest.spyOn(DatabaseModule, 'register').mockReturnValue({
      module: DatabaseModule,
      providers: [{ provide: Database, useFactory: () => { throw new Error('controlled-provider-failure'); } }],
      exports: [Database],
    });
    const exited = jest.spyOn(process, 'exit');
    const aborted = jest.spyOn(process, 'abort');
    try {
      await expect(createApplication(parseRuntimeConfig(process.env))).rejects.toThrow('controlled-provider-failure');
      expect(exited).not.toHaveBeenCalled();
      expect(aborted).not.toHaveBeenCalled();
    } finally { configuration.mockRestore(); exited.mockRestore(); aborted.mockRestore(); }
  });
});
