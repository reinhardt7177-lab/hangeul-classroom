// Release gate for real browser measurements, not a source-text/CSS-string check.
// Usage: node site/verify-design-evidence.mjs <browser-evidence.json> [lighthouse*.json ...]
// Capture with the browser at 320/390px and 1024px; see the implementation plan.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const [evidenceFile,...reports]=process.argv.slice(2);
assert.ok(evidenceFile,'Supply freshly captured browser evidence JSON');
const evidence=JSON.parse(fs.readFileSync(evidenceFile,'utf8'));
const failures=[];
function check(name,fn){try{fn();console.log('PASS '+name)}catch(error){failures.push(name+': '+error.message);console.error('FAIL '+failures.at(-1))}}
for(const width of [320,390]){
 const scene=evidence.mobile.find(item=>item.width===width);
 check(`${width}px readable presenter`,()=>{
  assert.ok(scene,`Missing ${width}px measurement`);
  assert.ok(scene.bodyFont>=16,`Body text ${scene.bodyFont}px is below 16px`);
  assert.ok(scene.headingFont>=24,`Heading ${scene.headingFont}px is below 24px`);
  assert.ok(scene.scrollWidth<=scene.clientWidth+1,'Horizontal page overflow');
  assert.ok(scene.cueScrollWidth<=scene.cueClientWidth+1,'Teacher cue is truncated');
  assert.ok(scene.cueWhiteSpace!=='nowrap','Teacher cue cannot wrap');
  assert.ok(scene.nextVisible,'Next button must remain in the viewport');
 });
}
check('student return link cannot cover controls',()=>{
 assert.ok(evidence.student,'Student measurement missing');
 assert.ok(!['fixed','absolute','sticky'].includes(evidence.student.linkPosition),'Return link is an overlay');
 assert.equal(evidence.student.overlappingControls,0,'Return link intersects student controls');
});
check('desktop presentation keeps 16:9',()=>{
 assert.ok(evidence.desktop,'Desktop measurement missing');
 assert.ok(Math.abs(evidence.desktop.stageWidth/evidence.desktop.stageHeight-16/9)<0.01,'Desktop stage aspect ratio changed');
});
if(evidence.slides)check('all measured slide paragraphs remain readable and controls reachable',()=>{
 assert.ok(evidence.slides.length>0,'No slide measurements');
 for(const slide of evidence.slides){
  assert.equal(slide.smallParagraphs.length,0,`${slide.grade}/${slide.step}: small paragraphs ${JSON.stringify(slide.smallParagraphs)}`);
  assert.ok(slide.mainScroll<=slide.mainClient+1,`${slide.grade}/${slide.step}: horizontal main overflow`);
  assert.ok(slide.stageScroll<=slide.stageClient+1,`${slide.grade}/${slide.step}: horizontal stage overflow`);
  assert.ok(slide.nextVisible,`${slide.grade}/${slide.step}: next button outside viewport`);
 }
});
const luminance=color=>{
 const channels=color.match(/[\d.]+/g)?.map(Number);
 assert.ok(channels?.length===3,'Supply an opaque rendered RGB color: '+color);
 const linear=channels.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
 return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
};
for(const sample of evidence.contrastSamples||[])check(sample.name+': rendered text contrast',()=>{
 const a=luminance(sample.foreground),b=luminance(sample.background);
 const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 assert.ok(ratio>=sample.minimum,`${ratio.toFixed(2)}:1 is below ${sample.minimum}:1`);
});
for(const file of reports){
 const report=JSON.parse(fs.readFileSync(file,'utf8'));
 check(`${file}: text contrast`,()=>assert.equal(report.audits['color-contrast'].score,1,'Rendered contrast audit failed'));
}
assert.equal(failures.length,0,failures.join('\n'));
console.log('Design release evidence passed. This is not an accessibility-conformance certificate.');
