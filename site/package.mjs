import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const site=path.dirname(fileURLToPath(import.meta.url));
const source=path.join(site,'dist');
const target=path.resolve(site,'../output/hangeul/수업앱');
// Start from an empty folder so files removed from dist (retired font subsets, archived pictures,
// deleted videos) never linger in the portable app, the offline ZIP or a Cloudflare upload.
if(target!==path.resolve(site,'../output/hangeul/수업앱'))throw Error('Unexpected package target');
if(fs.existsSync(target)){
 const archiveRoot=path.resolve(site,'../tmp');fs.mkdirSync(archiveRoot,{recursive:true});
 const backup=fs.mkdtempSync(path.join(archiveRoot,'hangeul-app-backup-'));
 fs.renameSync(target,path.join(backup,'수업앱'));console.log('Previous package preserved: '+backup);
}
fs.mkdirSync(target,{recursive:true});
function copy(from,to){
 if(fs.statSync(from).isDirectory()){
  fs.mkdirSync(to,{recursive:true});
  for(const child of fs.readdirSync(from))copy(path.join(from,child),path.join(to,child));
 }else fs.copyFileSync(from,to);
}
for(const name of ['index.html','hangeul.html','holidays.css','gaecheon.html','gaecheon.js','gaecheon-data.js','learning-resources.js','gaecheon.css','gaecheon-presenter-v2.css','hangeul.js','hangeul.css','hangeul-data.js','hangeul-presenter.js','hangeul-inquiry.js','gaecheon-inquiry.js','lesson-library.js','lesson-library.css','activity-qr.js','presenter-data.js','presenter.css','tablet.js','tablet.css','lesson-motion.js','lesson-motion.css','fonts.css','fonts','vendor','worksheets','videos']){
 copy(path.join(source,name),path.join(target,name));
}
fs.mkdirSync(path.join(target,'assets'),{recursive:true});
// Deploy only reviewed WebP derivatives; source PNG/JPEG files stay in the repository.
const imageManifest=JSON.parse(fs.readFileSync(path.join(site,'image-assets.json'),'utf8'));
for(const {file} of imageManifest.images){
 if(!/^[\w-]+\.webp$/.test(file))throw Error('Invalid image asset: '+file);
 fs.copyFileSync(path.join(source,'assets',file),path.join(target,'assets',file));
}
fs.copyFileSync(path.join(site,'server.mjs'),path.join(path.dirname(target),'server.mjs'));
fs.copyFileSync(path.join(site,'start-classroom.cmd'),path.join(path.dirname(target),'교실서버-시작.cmd'));
console.log('Portable lesson app prepared: '+target);
