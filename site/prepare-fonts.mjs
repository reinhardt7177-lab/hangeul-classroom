import fs from 'node:fs';
const text=[fs.readFileSync('dist/hangeul.js','utf8'),fs.readFileSync('dist/hangeul-data.js','utf8')].join('');
const chars=[...new Set((text.match(/[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9.,!?·→←]/g)||[]))].sort().join('');
fs.mkdirSync('dist/fonts',{recursive:true});
let css='/* Noto fonts by Google, SIL Open Font License. Subset includes the lesson content. */\n';
for(const [family,name] of [['Noto Sans KR','noto-sans-kr'],['Noto Serif KR','noto-serif-kr']]){
 const url=new URL('https://fonts.googleapis.com/css2');url.searchParams.set('family',family+':wght@400;500;600;700;800;900');url.searchParams.set('display','swap');url.searchParams.set('text',chars);
 const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'}});if(!res.ok)throw Error('Font CSS '+res.status);
 let rules=await res.text();const urls=[...new Set([...rules.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1]))];let n=0;
 for(const source of urls){const u=new URL(source);if(u.hostname!=='fonts.gstatic.com')throw Error('Unexpected font host');const r=await fetch(u);if(!r.ok)throw Error('Font '+r.status);const file=`${name}-${++n}.woff2`;fs.writeFileSync('dist/fonts/'+file,Buffer.from(await r.arrayBuffer()));rules=rules.split(source).join('./fonts/'+file)}
 css+=rules+'\n';console.log(name+': '+n+' font files');
}
fs.writeFileSync('dist/fonts.css',css);console.log('Content subset glyphs: '+chars.length);
