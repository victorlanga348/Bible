import { WorkspaceNote, WorkspaceFavorite, WorkspaceInputError, workspaceOwner, workspaceId, workspaceWindow, type WorkspaceWindow } from '../../src/modules/study-workspace/domain/workspace';
import { AiHistoryLibrary } from '../../src/modules/ai-assistant/application/ai-history-library';
import { AiModelInputError } from '../../src/modules/ai-assistant/domain/model-input';
import { relationOwner, relationId, RelationInputError } from '../../src/modules/cross-references/domain/relation';
import * as workspace from '../../src/modules/study-workspace/presentation/schemas';
import * as relation from '../../src/modules/cross-references/presentation/schemas';
import * as canon from '../../src/modules/biblical-canon/presentation/schemas';
import * as source from '../../src/modules/source-library/presentation/schemas';
const id='11111111-1111-4111-8111-111111111111';const time='2026-10-29T10:00:00.000Z';
const props={id,ownerId:'boundary-owner',studyId:id,studyVersion:2,createdAt:time,updatedAt:time,revision:1,content:'Personal technical note'};
describe('release boundary regressions of existing contracts; no retrospective RED claimed',()=>{
 it.each(['\n','\r','\u2028','\u2029','x'])('rejects trailing identity suffix %p in both domains and transport',suffix=>{
  expect(()=>workspaceId(id+suffix)).toThrow(WorkspaceInputError);expect(()=>relationId(id+suffix)).toThrow(RelationInputError);
  expect(workspace.studyParams.safeParse({studyId:id+suffix}).success).toBe(false);expect(relation.relationParams.safeParse({id:id+suffix}).success).toBe(false);
 });
 it.each(['\n','\r','\u2028','\u2029','!'])('requires complete owner identities %p',suffix=>{
  expect(()=>workspaceOwner('boundary-owner'+suffix)).toThrow(WorkspaceInputError);expect(()=>relationOwner('boundary-owner'+suffix)).toThrow(RelationInputError);
 });
 it.each([12,null,{},['owner']])('refuses non-string owner runtime input %p',value=>{expect(()=>workspaceOwner(value as string)).toThrow(WorkspaceInputError);});
 it.each([{id:'invalid'},{ownerId:'invalid owner'},{studyId:'invalid'},{studyVersion:0},{createdAt:'2026-10-29T10:00:00Z'}])('validates note target before materialization %p',patch=>{expect(()=>new WorkspaceNote({...props,...patch})).toThrow(WorkspaceInputError);});
 it('preserves equal revision timestamp and rejects regression against the latest edit, not just creation',()=>{
  const note=new WorkspaceNote({...props,revision:2,updatedAt:'2026-10-29T11:00:00.000Z'});
  expect(note.revise(2,'Equal instant allowed',note.updatedAt).revision).toBe(3);
  expect(()=>note.revise(2,'Regressive edit','2026-10-29T10:30:00.000Z')).toThrow(WorkspaceInputError);
 });
 it.each([null,42,()=>undefined])('rejects malformed favorite target %p',value=>{expect(()=>new WorkspaceFavorite(value as unknown as typeof props)).toThrow(WorkspaceInputError);});
 it.each([null,42,()=>undefined])('rejects malformed page runtime structure %p',value=>{expect(()=>workspaceWindow(props.ownerId,value as unknown as WorkspaceWindow)).toThrow(WorkspaceInputError);});
 it.each([null,42,()=>undefined])('rejects malformed cursor runtime structure %p',value=>{expect(()=>workspaceWindow(props.ownerId,{limit:1,cursor:value} as unknown as WorkspaceWindow)).toThrow(WorkspaceInputError);});
 it('keeps internal tab, CR, LF and the exact UTF-8 boundary for personal annotations',()=>{
  expect(new WorkspaceNote({...props,content:'a\tb\rc\nd'}).content).toBe('a\tb\rc\nd');
  expect(workspace.noteBody.safeParse({studyVersion:2,content:'😀'.repeat(2000)}).success).toBe(true);
  expect(workspace.noteBody.safeParse({studyVersion:2,content:'😀'.repeat(2000)+'a'}).success).toBe(false);
  for(const content of ['a\u0000b',String.fromCharCode(0xD800),'a\u007fb'])expect(workspace.noteBody.safeParse({studyVersion:2,content}).success).toBe(false);
 });
 it.each(['2x','2\n','x2','2.0','02'])('refuses noncanonical positive version text %p',studyVersion=>{expect(workspace.favoriteParams.safeParse({studyId:id,studyVersion}).success).toBe(false);});
 it('accepts version2 and a nonzero/nonmax history revision while retaining the public schema fields',()=>{
  expect(workspace.favoriteParams.parse({studyId:id,studyVersion:'2'}).studyVersion).toBe(2);
  const item={id,studyId:id,studyVersion:2,revision:7,createdAt:time};expect(workspace.conversationPage.parse({items:[item],nextCursor:null})).toEqual({items:[item],nextCursor:null});
  expect(workspace.conversationPage.safeParse({items:[{...item,revision:21}],nextCursor:null}).success).toBe(false);
  expect(workspace.conversationPage.safeParse({items:[{...item,revision:-1}],nextCursor:null}).success).toBe(false);
  expect(workspace.conversationPage.safeParse({items:[{...item,id:undefined}],nextCursor:null}).success).toBe(false);
 });
 it.each(['porbr2018\n','porbr2018!'])('rejects noncanonical source/canon transport identifiers %p',value=>{
  expect(canon.translationParams.safeParse({translationId:value}).success).toBe(false);expect(source.sourceParams.safeParse({sourceId:value}).success).toBe(false);
 });
 it.each(['2x','2\n','02.0'])('rejects decimal routing/query suffix %p',value=>{
  expect(canon.chapterParams.safeParse({translationId:'porbr2018',bookCode:'GEN',chapter:value}).success).toBe(false);expect(source.excerptQuery.safeParse({limit:value}).success).toBe(false);expect(workspace.pageQuery.safeParse({limit:value}).success).toBe(false);
 });
});
describe('AI history pre-I/O boundary; explicit local rejecting store, real persistence is tested separately',()=>{
 const unexpected=jest.fn(async()=>{throw new Error('Unexpected port I/O');});const library=new AiHistoryLibrary({list:unexpected,deleteForStudy:unexpected});
 beforeEach(()=>unexpected.mockClear());
 it.each(['!owner','owner!','owner\n','x'.repeat(65)])('rejects bad owner before read/delete %p',async owner=>{await expect(library.listForStudy(owner,id,{limit:1})).rejects.toThrow(AiModelInputError);await expect(library.deleteForStudy(owner,id)).rejects.toThrow(AiModelInputError);expect(unexpected).not.toHaveBeenCalled();});
 it.each(['!'+id,id+'!',id+'\n','invalid'])('rejects bad target before read/delete %p',async target=>{await expect(library.listForStudy('owner',target,{limit:1})).rejects.toThrow(AiModelInputError);await expect(library.deleteForStudy('owner',target)).rejects.toThrow(AiModelInputError);expect(unexpected).not.toHaveBeenCalled();});
 it.each([{id:'!'+id,createdAt:time},{id:id+'!',createdAt:time},{id,createdAt:'invalid'},{id,createdAt:'2026-10-29T10:00:00Z'}])('rejects noncanonical cursor before read %p',async cursor=>{await expect(library.listForStudy('owner',id,{limit:1,cursor})).rejects.toThrow(AiModelInputError);expect(unexpected).not.toHaveBeenCalled();});
});
