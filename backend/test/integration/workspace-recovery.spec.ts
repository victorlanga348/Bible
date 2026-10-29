import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import request from 'supertest';
import type { Database } from '../../src/infrastructure/database';
import { openSourceTestDatabase } from '../helpers/source-library';
import { recoverWorkspaceTestSchema } from '../helpers/workspace-database';
describe('workspace fault-fixture recovery on actual isolated PostgreSQL; no application behavior claimed',()=>{
 let database:Database;
 const reset=async()=>{
  const [state]=await database.client.$queryRaw<{base:boolean;alias:boolean}[]>`SELECT to_regclass('app.workspace_note') IS NOT NULL AS base,to_regclass('app.workspace_http_offline') IS NOT NULL AS alias`;
  if(state!.alias){if(!state!.base)await database.client.$executeRaw`ALTER TABLE app.workspace_http_offline RENAME TO workspace_note`;else await database.client.$executeRaw`DROP TABLE app.workspace_http_offline`;}
  await database.client.$executeRaw`DROP TRIGGER IF EXISTS workspace_test_fail_cleanup ON app.workspace_favorite`;await database.client.$executeRaw`DROP FUNCTION IF EXISTS app.workspace_test_fail_cleanup()`;await database.client.workspaceNote.deleteMany();await database.client.workspaceFavorite.deleteMany();
 };
 beforeAll(async()=>{database=await openSourceTestDatabase();});beforeEach(reset);afterEach(reset);afterAll(async()=>{await database?.onModuleDestroy();});
 it('restores the exact controlled alias without losing its technical personal note',async()=>{
  const id=randomUUID();await database.client.workspaceNote.create({data:{id,ownerId:'recovery-owner',studyId:randomUUID(),studyVersion:1n,revision:1,content:'Technical personal recovery note',createdAt:new Date(),updatedAt:new Date()}});
  await database.client.$executeRaw`ALTER TABLE app.workspace_note RENAME TO workspace_http_offline`;await recoverWorkspaceTestSchema(database);expect((await database.client.workspaceNote.findUniqueOrThrow({where:{id}})).content).toBe('Technical personal recovery note');
  const [alias]=await database.client.$queryRaw<{exists:boolean}[]>`SELECT to_regclass('app.workspace_http_offline') IS NOT NULL AS exists`;expect(alias!.exists).toBe(false);
 });
 it('removes only the controlled fault trigger before a later actual cleanup',async()=>{
  await database.client.workspaceFavorite.create({data:{id:randomUUID(),ownerId:'recovery-owner',studyId:randomUUID(),studyVersion:1n,createdAt:new Date()}});
  await database.client.$executeRaw`CREATE FUNCTION app.workspace_test_fail_cleanup() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'controlled-workspace-cleanup-failure'; END $$`;await database.client.$executeRaw`CREATE TRIGGER workspace_test_fail_cleanup BEFORE DELETE ON app.workspace_favorite FOR EACH ROW EXECUTE FUNCTION app.workspace_test_fail_cleanup()`;
  await expect(database.client.workspaceFavorite.deleteMany()).rejects.toThrow('controlled-workspace-cleanup-failure');await recoverWorkspaceTestSchema(database);expect((await database.client.workspaceFavorite.deleteMany()).count).toBe(1);
 });
 it('refuses an ambiguous alias while keeping the real base table intact',async()=>{
  await database.client.$executeRaw`CREATE TABLE app.workspace_http_offline(marker integer)`;await expect(recoverWorkspaceTestSchema(database)).rejects.toThrow('Ambiguous workspace fault fixture');expect(await database.client.workspaceNote.count()).toBe(0);
 });
 it('bounds a stalled real HTTP client and restores the renamed table through finally',async()=>{
  const server=createServer(()=>undefined);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));await database.client.$executeRaw`ALTER TABLE app.workspace_note RENAME TO workspace_http_offline`;
  try{try{await expect(request(server).get('/').timeout({response:100,deadline:200})).rejects.toMatchObject({timeout:expect.any(Number)});}finally{await recoverWorkspaceTestSchema(database);}expect(await database.client.workspaceNote.count()).toBe(0);}
  finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
 });
});
