import { WorkspaceLibrary } from '../../src/modules/study-workspace/application/workspace-library';
import { WorkspaceInputError } from '../../src/modules/study-workspace/domain/workspace';
import { StudyLibrary } from '../../src/modules/study/application/study-library';
import { StudyInputError } from '../../src/modules/study/application/errors';
const id='11111111-1111-4111-8111-111111111111';const time='2026-10-29T00:00:00.000Z';
const unexpected=jest.fn(async()=>{throw new Error('Unexpected prevalidation port I/O');});
// Explicit rejecting local ports only assert refusal before I/O; actual DB/Nest integration is separate.
const workspace=new WorkspaceLibrary({createNote:unexpected,findNote:unexpected,listNotes:unexpected,replaceNote:unexpected,deleteNote:unexpected,favorite:unexpected,deleteFavorite:unexpected,listFavorites:unexpected,deleteForStudy:unexpected},{metadata:unexpected,list:unexpected,guardActive:unexpected,beginDelete:unexpected,finishDelete:unexpected},{listForStudy:unexpected,deleteForStudy:unexpected},{id:()=>id,now:()=>time});
const studies=new StudyLibrary({execute:unexpected},{metadata:unexpected,list:unexpected,guardActive:unexpected,beginDelete:unexpected,finishDelete:unexpected,create:unexpected,find:unexpected,append:unexpected},{collect:unexpected,availability:unexpected});
describe('release application refusal before ports, regressions of existing behavior',()=>{
 beforeEach(()=>unexpected.mockClear());
 it.each(['!owner','owner!','owner\n'])('rejects invalid owner in every workspace entry point %p',async owner=>{
  for(const run of [()=>workspace.createNote(owner,id,2,'Personal note'),()=>workspace.conversations(owner,id,{limit:1}),()=>workspace.listNotes(owner,id,{limit:1}),()=>workspace.reviseNote(owner,id,1,'Edit'),()=>workspace.deleteNote(owner,id),()=>workspace.favorite(owner,id,2),()=>workspace.deleteFavorite(owner,id,2),()=>workspace.favorites(owner,{limit:1}),()=>workspace.deleteStudy(owner,id)])await expect(run()).rejects.toThrow(WorkspaceInputError);
  expect(unexpected).not.toHaveBeenCalled();
 });
 it.each(['!'+id,id+'!',id+'\n'])('rejects invalid target in every workspace target entry point %p',async target=>{
  for(const run of [()=>workspace.createNote('owner',target,2,'Personal note'),()=>workspace.conversations('owner',target,{limit:1}),()=>workspace.listNotes('owner',target,{limit:1}),()=>workspace.reviseNote('owner',target,1,'Edit'),()=>workspace.deleteNote('owner',target),()=>workspace.favorite('owner',target,2),()=>workspace.deleteFavorite('owner',target,2),()=>workspace.deleteStudy('owner',target)])await expect(run()).rejects.toThrow(WorkspaceInputError);
  expect(unexpected).not.toHaveBeenCalled();
 });
 it.each([0,-1,1.5,NaN,2147483648])('rejects invalid expected revision before loading note %p',async revision=>{await expect(workspace.reviseNote('owner',id,revision,'Edit')).rejects.toThrow(WorkspaceInputError);expect(unexpected).not.toHaveBeenCalled();});
 it.each([0,1.5,Number.MAX_SAFE_INTEGER+1])('rejects invalid version before metadata lookup %p',async version=>{
  for(const run of [()=>workspace.createNote('owner',id,version,'Personal note'),()=>workspace.listNotes('owner',id,{limit:1},version),()=>workspace.favorite('owner',id,version),()=>workspace.deleteFavorite('owner',id,version)])await expect(run()).rejects.toThrow(WorkspaceInputError);
  expect(unexpected).not.toHaveBeenCalled();
 });
 it.each([0,51,1.5])('rejects invalid window on lists %p',async limit=>{
  for(const run of [()=>workspace.favorites('owner',{limit}),()=>workspace.listNotes('owner',id,{limit}),()=>workspace.conversations('owner',id,{limit})])await expect(run()).rejects.toThrow(WorkspaceInputError);
  expect(unexpected).not.toHaveBeenCalled();
 });
 it.each([{id:'!'+id,createdAt:time},{id:id+'!',createdAt:time},{id,createdAt:'invalid'},{id,createdAt:'2026-10-29T00:00:00Z'}])('rejects invalid study cursor before repository %p',async cursor=>{await expect(studies.list('owner',{limit:1,cursor})).rejects.toThrow(StudyInputError);expect(unexpected).not.toHaveBeenCalled();});
 it.each(['!owner','owner!','owner\n'])('rejects invalid study-list owner before repository %p',async owner=>{await expect(studies.list(owner,{limit:1})).rejects.toThrow(StudyInputError);expect(unexpected).not.toHaveBeenCalled();});
});
