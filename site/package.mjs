import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const site=path.dirname(fileURLToPath(import.meta.url));
const source=path.join(site,'dist');
const target=path.resolve(site,'../output/hangeul/수업앱');
fs.mkdirSync(target,{recursive:true});
function copy(from,to){
 if(fs.statSync(from).isDirectory()){
  fs.mkdirSync(to,{recursive:true});
  for(const child of fs.readdirSync(from))copy(path.join(from,child),path.join(to,child));
 }else fs.copyFileSync(from,to);
}
for(const name of ['index.html','hangeul.html','holidays.css','gaecheon.html','gaecheon.js','gaecheon-data.js','gaecheon.css','gaecheon-presenter-v2.css','hangeul.js','hangeul.css','hangeul-data.js','hangeul-presenter.js','presenter-data.js','presenter.css','tablet.js','tablet.css','lesson-motion.js','lesson-motion.css','fonts.css','fonts','vendor','worksheets','videos']){
 copy(path.join(source,name),path.join(target,name));
}
fs.mkdirSync(path.join(target,'assets'),{recursive:true});
for(const asset of ['hero-sejong','writing-desk','school-sign','classroom-note','library-together','hangul-garden','timeline-skia','documentary-poster','gaecheon-dawn','gaecheon-tree','gaecheon-bear-tiger','gaecheon-community','gaecheon-classroom','gaecheon-dolmen','gaecheon-fact-skia']){
 fs.copyFileSync(path.join(source,'assets',asset+'.png'),path.join(target,'assets',asset+'.png'));
}
fs.copyFileSync(path.join(site,'server.mjs'),path.join(path.dirname(target),'server.mjs'));
fs.copyFileSync(path.join(site,'start-classroom.cmd'),path.join(path.dirname(target),'교실서버-시작.cmd'));
console.log('Portable lesson app prepared: '+target);
