const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {provisionCanon,downloadCanonAsset}=require('./provision-canon-ci.cjs');
const {Response}=globalThis;
const files=require('../admissions/biblical-canon/porbr2018/ci-archive.json').files;
const authentic=name=>fs.readFileSync(path.join('data/biblical-canon/porbr2018',name));
async function sandbox(action){const directory=fs.mkdtempSync(path.join(os.tmpdir(),'biblia-ci-canon-originals-'));try{return await action(directory);}finally{assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(directory).startsWith('biblia-ci-canon-originals-'));fs.rmSync(directory,{recursive:true,force:true});}}
test('provisions both original admitted files, preserving every authenticated byte',()=>sandbox(async directory=>{
 const calls=[];const result=await provisionCanon(directory,async row=>{calls.push(row.assetId);return authentic(row.name);});assert.equal(result.result,'PASS');assert.deepEqual(calls,files.map(row=>row.assetId));
 for(const row of files){const bytes=fs.readFileSync(path.join(directory,row.name));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.deepEqual(bytes,authentic(row.name));}
}));
test('validates existing originals and reuses them without any provider or token',()=>sandbox(async directory=>{
 for(const row of files)fs.writeFileSync(path.join(directory,row.name),authentic(row.name));let called=false;const result=await provisionCanon(directory,async()=>{called=true;throw new Error('No provider expected');});assert.equal(result.result,'PASS');assert.equal(called,false);
}));
test('rejects either adulterated download before promoting any output',async()=>{
 for(const corrupt of files)await sandbox(async directory=>{await assert.rejects(provisionCanon(directory,async row=>{const bytes=authentic(row.name);if(row.name===corrupt.name)bytes[0]^=1;return bytes;}),/CANON_ARCHIVE_PROVISIONING_FAILED/);for(const row of files)assert.equal(fs.existsSync(path.join(directory,row.name)),false);});
});
test('preserves and refuses an existing divergent original instead of overwriting it',()=>sandbox(async directory=>{
 const target=path.join(directory,'source.zip');fs.writeFileSync(target,'technical corrupt archive');const before=fs.readFileSync(target);let called=false;await assert.rejects(provisionCanon(directory,async()=>{called=true;return Buffer.alloc(0);}),/CANON_ARCHIVE_PROVISIONING_FAILED/);assert.deepEqual(fs.readFileSync(target),before);assert.equal(called,false);
}));
test('keeps a valid existing source intact if the other download is unavailable',()=>sandbox(async directory=>{
 const target=path.join(directory,'source.zip'),before=authentic('source.zip');fs.writeFileSync(target,before);await assert.rejects(provisionCanon(directory,async()=>{throw new Error('Technical unavailable download');}));assert.deepEqual(fs.readFileSync(target),before);assert.equal(fs.existsSync(path.join(directory,'catalog.source.html')),false);
}));
test('cannot overwrite an input that appears between verification and atomic promotion',()=>sandbox(async directory=>{
 const target=path.join(directory,'source.zip');await assert.rejects(provisionCanon(directory,async row=>{if(row.name==='catalog.source.html')fs.writeFileSync(target,'technical concurrent writer');return authentic(row.name);}),/CANON_ARCHIVE_PROVISIONING_FAILED/);
 assert.equal(fs.readFileSync(target,'utf8'),'technical concurrent writer');assert.deepEqual(fs.readdirSync(directory),['source.zip']);
}));
// Controlled fetch responses verify transport boundaries; they are not GitHub integration.
test('uses the fixed authenticated API, then follows only the approved CDN without credentials',async()=>{
 const calls=[],item=files[1];const bytes=await downloadCanonAsset(item,'technical-protocol-only',async(url,options)=>{calls.push({url:String(url),options});return calls.length===1?new Response(null,{status:302,headers:{location:'https://release-assets.githubusercontent.com/technical-archive'}}):new Response(authentic(item.name));});
 assert.equal(sha(bytes),item.sha256);assert.equal(calls[0].url,'https://api.github.com/repos/victorlanga348/Bible/releases/assets/'+item.assetId);assert.equal(calls[0].options.headers.Authorization,'Bearer technical-protocol-only');assert.equal(calls[1].options.headers,undefined);assert.equal(calls[1].options.redirect,'error');
});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
test('accepts a direct binary asset response without requiring a redirect',async()=>{const bytes=await downloadCanonAsset(files[1],'technical-protocol-only',async()=>new Response(authentic(files[1].name)));assert.equal(sha(bytes),files[1].sha256);});
test('rejects a missing token before making any request',async()=>{let called=false;await assert.rejects(downloadCanonAsset(files[0],'',async()=>{called=true;}),/CANON_ARCHIVE_PROVISIONING_FAILED/);assert.equal(called,false);});
test('refuses insecure or foreign redirect destinations without following them',async()=>{for(const location of ['http://release-assets.githubusercontent.com/technical','https://evil.example/technical','https://release-assets.githubusercontent.com.evil.example/technical']){let calls=0;await assert.rejects(downloadCanonAsset(files[1],'technical-protocol-only',async()=>{calls++;return new Response(null,{status:302,headers:{location}});}),/CANON_ARCHIVE_PROVISIONING_FAILED/);assert.equal(calls,1);}});
test('refuses HTTP denial and oversized streamed payloads',async()=>{await assert.rejects(downloadCanonAsset(files[1],'technical-protocol-only',async()=>new Response('technical-denial',{status:403})),/CANON_ARCHIVE_PROVISIONING_FAILED/);await assert.rejects(downloadCanonAsset({...files[1],bytes:4},'technical-protocol-only',async()=>new Response('12345')),/CANON_ARCHIVE_PROVISIONING_FAILED/);});
