// Verify the reviewed lossless WebP allowlist and every literal classroom asset URL.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=import.meta.dirname,dist=path.join(root,'dist');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'image-assets.json'),'utf8'));
assert.equal(manifest.encoding,'lossless');assert.equal(manifest.resized,false);
assert.equal(manifest.images.length,24);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const known=new Set();
for(const item of manifest.images){
 assert.match(item.file,/^[\w-]+\.webp$/);assert.ok(!known.has(item.file));known.add(item.file);
 const original=path.join(dist,'assets',item.source),converted=path.join(dist,'assets',item.file);
 assert.equal(hash(original),item.sourceSha256,'Original changed: '+item.source);
 assert.equal(hash(converted),item.sha256,'WebP changed: '+item.file);
 assert.equal(fs.statSync(converted).size,item.bytes);assert.ok(item.width>0&&item.height>0);
 const data=fs.readFileSync(converted),header=data.subarray(0,16);
 assert.equal(header.toString('ascii',0,4),'RIFF');assert.equal(header.toString('ascii',8,12),'WEBP');
 const chunks=[];
 for(let offset=12;offset+8<=data.length;){
  chunks.push(data.toString('ascii',offset,offset+4));
  const size=data.readUInt32LE(offset+4);offset+=8+size+(size%2);
 }
 assert.ok(chunks.includes('VP8L')&&!chunks.includes('VP8 '),'Expect lossless WebP: '+item.file);
}
for(const name of fs.readdirSync(dist).filter(name=>/\.(js|html|css)$/.test(name))){
 const source=fs.readFileSync(path.join(dist,name),'utf8');
 for(const [,asset] of source.matchAll(/assets\/([\w-]+\.(?:png|jpe?g|webp))/g)){
  assert.ok(known.has(asset),`${name}: non-WebP or unknown asset ${asset}`);
 }
}
console.log(JSON.stringify({images:known.size,sourceHashes:'preserved',webpHashes:'verified',
 originalBytes:manifest.images.reduce((s,x)=>s+x.sourceBytes,0),
 webpBytes:manifest.images.reduce((s,x)=>s+x.bytes,0)}));
