import { pageQuery } from '../../src/modules/study-workspace/presentation/schemas';
import { encodeCursor } from '../../src/presentation/pagination';
const id='11111111-1111-4111-8111-111111111111',time='2026-10-29T00:00:00.000Z';
const raw=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
describe('canonical release cursor boundaries; no IO',()=>{
 it.each(['!'+id,id+'!',id+'\n'])('rejects complete invalid UUID inside an otherwise valid cursor %p',value=>{expect(pageQuery.safeParse({cursor:raw({id:value,createdAt:time})}).success).toBe(false);});
 it.each(['2026-10-29T00:00:00Z','2026-02-30T00:00:00.000Z','invalid'])('rejects noncanonical timestamp inside a valid base64 envelope %p',createdAt=>{expect(pageQuery.safeParse({cursor:raw({id,createdAt})}).success).toBe(false);});
 it('rejects noncanonical unused base64 bits even when decoded JSON is identical',()=>{
  let text=JSON.stringify({id,createdAt:time});while(Buffer.byteLength(text)%3===0)text+=' ';
  const canonical=Buffer.from(text).toString('base64url');const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';const index=alphabet.indexOf(canonical.at(-1)!);const altered=canonical.slice(0,-1)+alphabet[index+1]!;
  expect(Buffer.from(altered,'base64url').toString()).toBe(text);expect(pageQuery.safeParse({cursor:canonical}).success).toBe(true);expect(pageQuery.safeParse({cursor:altered}).success).toBe(false);
 });
 it.each(['!','\n','='])('rejects extra encoding suffix %p',suffix=>{expect(pageQuery.safeParse({cursor:encodeCursor({id,createdAt:time})!+suffix}).success).toBe(false);});
});
