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
for(const asset of ['hero-sejong','writing-desk','school-sign','classroom-note','library-together','hangul-garden','timeline-skia','documentary-poster','gaecheon-documentary-poster','gaecheon-tree','gaecheon-bear-tiger','gaecheon-community','gaecheon-classroom','gaecheon-dolmen','gaecheon-fact-skia','gaecheon-helping-today','gaecheon-source-study','gaecheon-story-hwanung','gaecheon-story-promise','gaecheon-story-ungnyeo','gaecheon-story-dangun']){
 fs.copyFileSync(path.join(source,'assets',asset+'.png'),path.join(target,'assets',asset+'.png'));
}
fs.copyFileSync(path.join(site,'server.mjs'),path.join(path.dirname(target),'server.mjs'));
for(const asset of ['bronze-dagger-songgukri.jpg','gochang-dolmen-steve46814.jpg','hunminjeongeum-haerye-facsimile.jpg'])fs.copyFileSync(path.join(source,'assets',asset),path.join(target,'assets',asset));
fs.copyFileSync(path.join(site,'start-classroom.cmd'),path.join(path.dirname(target),'교실서버-시작.cmd'));
console.log('Portable lesson app prepared: '+target);
