import { EventEmitter } from 'node:events';
import type { Response } from 'express';
import { appendConversationBody } from '../../src/modules/ai-assistant/presentation/conversation-schemas';
import { ConversationDocument, type ConversationTurnProps } from '../../src/modules/ai-assistant/domain/conversation';
import { ConversationController } from '../../src/modules/ai-assistant/presentation/conversation.controller';
import type { ConversationLibrary } from '../../src/modules/ai-assistant/application/conversation-library';
import { AiUnavailableError } from '../../src/modules/ai-assistant/application/errors';
const id=(n:number)=>'11111111-1111-4111-8111-'+String(n).padStart(12,'0');const time='2026-10-29T00:00:00.000Z';
describe('release conversation schema/context boundaries, technical questions only',()=>{
 it('accepts exactly500 trimmed UTF8 bytes and rejects overflow and unpaired Unicode',()=>{
  expect(appendConversationBody.safeParse({expectedRevision:0,question:'😀'.repeat(125)}).success).toBe(true);
  expect(appendConversationBody.safeParse({expectedRevision:0,question:'  '+'😀'.repeat(125)+'  '}).success).toBe(true);
  for(const question of ['😀'.repeat(125)+'a',String.fromCharCode(0xD800),'a\u0000b'])expect(appendConversationBody.safeParse({expectedRevision:0,question}).success).toBe(false);
 });
 it.each(['questions-v1','questions-v2','questions-v3']as const)('keeps only the two latest eligible short questions in %p',version=>{
  const turns:ConversationTurnProps[]=Array.from({length:20},(_,i)=>({number:i+1,question:'Technical '+String(i+1),analysisId:id(i+30),createdAt:time,contextTurnNumbers:[],omittedTurns:i,revisesTurn:null}));
  const d=new ConversationDocument({schemaVersion:1,id:id(1),ownerId:'owner',studyId:id(2),studyVersion:1,createdAt:time,turns});const c=d.context('Current technical question',undefined,version);
  expect(c.contextTurnNumbers).toEqual([19,20]);expect(c.omittedTurns).toBe(18);expect(c.question).not.toContain('18: Technical 18');
  expect(d.context('Current technical question',[1,10,12],version).contextTurnNumbers).toEqual([10,12]);
 });
 it.each(['questions-v1','questions-v2']as const)('excludes oversized legacy history instead of truncating a prior question %p',version=>{
  const d=new ConversationDocument({schemaVersion:1,id:id(1),ownerId:'owner',studyId:id(2),studyVersion:1,createdAt:time,turns:[{number:1,question:'a'.repeat(500),analysisId:id(30),createdAt:time,contextTurnNumbers:[],omittedTurns:0,revisesTurn:null}]});
  const c=d.context('b'.repeat(500),undefined,version);expect(c.question).toBe('b'.repeat(500));expect(c.contextTurnNumbers).toEqual([]);expect(c.omittedTurns).toBe(1);
 });
});
describe('controller response lifecycle; explicit local event/port doubles, not persistence or inference',()=>{
 const view={id:id(1),studyId:id(2),studyVersion:1,createdAt:time,revision:0,turns:[]};
 it('does not cancel an ended response and removes its close listener after success',async()=>{
  let signal:AbortSignal|undefined;let release!:(value:typeof view)=>void;const work=new Promise<typeof view>(r=>{release=r;});
  const create=jest.fn(async(_owner:string,_study:string,_version:number,active:AbortSignal)=>{signal=active;return work;});const controller=new ConversationController({create}as unknown as ConversationLibrary);
  const response=Object.assign(new EventEmitter(),{writableEnded:false});const pending=controller.create('owner',{studyId:id(2)},{studyVersion:1},{},response as unknown as Response);
  expect(response.listenerCount('close')).toBe(1);response.writableEnded=true;response.emit('close');expect(signal!.aborted).toBe(false);release(view);expect(await pending).toEqual(view);expect(response.listenerCount('close')).toBe(0);
  response.writableEnded=false;response.emit('close');expect(signal!.aborted).toBe(false);
 });
 it('propagates early disconnect and removes the close listener after failure',async()=>{
  let signal:AbortSignal|undefined;let reject!:(error:Error)=>void;const work=new Promise<typeof view>((_r,j)=>{reject=j;});
  const controller=new ConversationController({create:async(_o:string,_s:string,_v:number,active:AbortSignal)=>{signal=active;return work;}}as unknown as ConversationLibrary);
  const response=Object.assign(new EventEmitter(),{writableEnded:false});const pending=controller.create('owner',{studyId:id(2)},{studyVersion:1},{},response as unknown as Response);const observed=expect(pending).rejects.toThrow(AiUnavailableError);
  response.emit('close');expect(signal!.aborted).toBe(true);reject(new AiUnavailableError());await observed;expect(response.listenerCount('close')).toBe(0);
 });
});
