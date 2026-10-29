import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { Database } from '../../src/infrastructure/database';
import { AccessModule } from '../../src/infrastructure/access.module';
import { DatabaseModule } from '../../src/infrastructure/database.module';
import { parseRuntimeConfig } from '../../src/config/runtime-config';
import { WorkspaceModule } from '../../src/modules/study-workspace/module';
import { WorkspaceLibrary } from '../../src/modules/study-workspace/application/workspace-library';
import { WorkspaceNote } from '../../src/modules/study-workspace/domain/workspace';
import { PrismaWorkspaceStore } from '../../src/modules/study-workspace/infrastructure/prisma-workspace-store';
import { AiHistoryLibrary } from '../../src/modules/ai-assistant/application/ai-history-library';
import { PrismaHistoryStore } from '../../src/modules/ai-assistant/infrastructure/prisma-history-store';
import { PrismaConversationStore } from '../../src/modules/ai-assistant/infrastructure/prisma-conversation-store';
import { ConversationDocument } from '../../src/modules/ai-assistant/domain/conversation';
import { PrismaStudyRepository } from '../../src/modules/study/infrastructure/prisma-study-repository';
import { StudyLibrary } from '../../src/modules/study/application/study-library';
import { openSourceTestDatabase } from '../helpers/source-library';
import { recoverWorkspaceTestSchema } from '../helpers/workspace-database';
import { studyContent } from '../helpers/study';
describe('release asymmetric metadata pages and public composition, actual PostgreSQL/Nest',()=>{
 let database:Database;
 const clean=async()=>{await recoverWorkspaceTestSchema(database);await database.client.workspaceNote.deleteMany();await database.client.workspaceFavorite.deleteMany();await database.client.aiConversation.deleteMany();await database.client.aiAnalysis.deleteMany();await database.client.studyRecord.deleteMany();};
 beforeAll(async()=>{database=await openSourceTestDatabase();});beforeEach(clean);afterAll(async()=>{try{await clean();}finally{await database?.onModuleDestroy();}});
 it('orders private notes by date then id across ties, with exact version filtering',async()=>{
  const store=new PrismaWorkspaceStore(database);const studyId=randomUUID();const ids=[randomUUID(),randomUUID(),randomUUID()].sort();const owner='release-owner';const older='2026-10-29T10:00:00.000Z',newer='2026-10-29T11:00:00.000Z';
  for(const [index,id] of ids.entries()){const date=index===2?older:newer;await store.createNote(new WorkspaceNote({id,ownerId:owner,studyId,studyVersion:index===2?1:2,revision:1,content:'Technical personal pagination annotation',createdAt:date,updatedAt:date}));}
  expect((await store.listNotes(owner,studyId,{limit:50})).map(n=>n.id)).toEqual([ids[1],ids[0],ids[2]]);
  expect((await store.listNotes(owner,studyId,{limit:1,cursor:{id:ids[0]!,createdAt:newer}})).map(n=>n.id)).toEqual([ids[2]]);
  expect((await store.listNotes(owner,studyId,{limit:50},2)).map(n=>n.id)).toEqual([ids[1],ids[0]]);
  expect(await store.listNotes('foreign-owner',studyId,{limit:50})).toEqual([]);
 });
 it('paginates real conversations with different timestamps and tied UUID order, retaining version2/revision0',async()=>{
  const store=new PrismaConversationStore(database);const library=new AiHistoryLibrary(new PrismaHistoryStore(database));const studyId=randomUUID(),owner='release-owner';const ids=[randomUUID(),randomUUID(),randomUUID()].sort();const newer='2026-10-29T11:00:00.000Z',older='2026-10-29T10:00:00.000Z';
  for(const [index,id] of ids.entries())await store.create(new ConversationDocument({schemaVersion:1,id,ownerId:owner,studyId,studyVersion:2,createdAt:index===2?older:newer,turns:[]}));
  const first=await library.listForStudy(owner,studyId,{limit:1});expect(first.items.map(n=>n.id)).toEqual([ids[1]]);const second=await library.listForStudy(owner,studyId,{limit:1,cursor:first.nextCursor!});expect(second.items.map(n=>n.id)).toEqual([ids[0]]);const third=await library.listForStudy(owner,studyId,{limit:1,cursor:second.nextCursor!});expect(third.items.map(n=>n.id)).toEqual([ids[2]]);expect(third.nextCursor).toBeNull();
  expect((await library.listForStudy(owner,studyId,{limit:50})).items).toHaveLength(3);expect(first.items[0]).toMatchObject({studyVersion:2,revision:0});
 });
 it('lists real study metadata in date/id order, exposing the actual latest version2',async()=>{
  const repository=new PrismaStudyRepository(database);const rows=await Promise.all([repository.create('release-owner',studyContent()),repository.create('release-owner',studyContent()),repository.create('release-owner',studyContent())]);const ordered=rows.map(s=>s.id).sort();const newer='2026-10-29T11:00:00.000Z',older='2026-10-29T10:00:00.000Z';
  for(const [index,id]of ordered.entries())await database.client.studyRecord.update({where:{id},data:{createdAt:new Date(index===2?older:newer)}});
  await repository.append('release-owner',ordered[0]!,1,studyContent());
  const page=await repository.list('release-owner',{limit:50});expect(page.map(s=>s.id)).toEqual([ordered[1],ordered[0],ordered[2]]);expect(page.find(s=>s.id===ordered[0])!.version).toBe(2);
  expect((await repository.list('release-owner',{limit:1,cursor:{id:ordered[0]!,createdAt:newer}})).map(s=>s.id)).toEqual([ordered[2]]);
  const services=new StudyLibrary({execute:async()=>studyContent()},repository,{collect:async()=>{throw new Error('No source collection during metadata');},availability:async()=>{throw new Error('No source delivery during metadata');}});
  expect((await services.list('release-owner',{limit:50})).items).toHaveLength(3);
 });
 it('exports WorkspaceLibrary to a separate Nest consumer through the real module boundary',async()=>{
  const config=parseRuntimeConfig(process.env);const consumer=Symbol('release-consumer');
  const module=await Test.createTestingModule({imports:[DatabaseModule.register(config.databaseUrl),AccessModule.register(config.jwtSecret),WorkspaceModule.register(config)],providers:[{provide:consumer,inject:[WorkspaceLibrary],useFactory:(library:WorkspaceLibrary)=>library}]}).compile();
  try{await module.init();expect(module.get<WorkspaceLibrary>(consumer)).toBe(module.get(WorkspaceLibrary));expect(await module.get<WorkspaceLibrary>(consumer).listStudies('empty-owner',{limit:50})).toEqual({items:[],nextCursor:null});}finally{await module.close();}
 });
});
