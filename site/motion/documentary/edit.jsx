export default async ({ project }) => {
 const p = await project({dir:"/home/user/hangul-doc/edit",size:"1920x1080",fps:24,background:"#0b2521"});
 const scenes=[{"index":1,"at":0,"kind":"card","eyebrow":"한글이 태어난 까닭","title":["누구나 마음을","전할 수 있도록"],"detail":"세종이 꿈꾼 새로운 글자의 이야기"},{"index":2,"at":5,"kind":"video","clip":1,"eyebrow":"글로 전하기 어려운 마음","lines":["우리말은 있었지만, 글로 뜻을","전하기 어려운 이들이 있었어요."]},{"index":3,"at":10,"kind":"video","clip":2,"eyebrow":"백성을 생각하는 마음","lines":["세종은 그 어려움을","안타깝게 여겼어요."]},{"index":4,"at":15,"kind":"video","clip":3,"eyebrow":"쉽게 배우고 편히 쓰는 글자","lines":["누구나 쉽게 배우고 쓸","새 글자를 만들고자 했어요."]},{"index":5,"at":20,"kind":"card","year":"1443","eyebrow":"새 글자의 탄생","title":["훈민정음 창제"],"detail":"세종이 새로운 글자 스물여덟 자를 만들었어요."},{"index":6,"at":25,"kind":"video","clip":4,"eyebrow":"1445 · 새로운 글자로 지은 노래","lines":["새 글자로 지은 노래,","『용비어천가』가 만들어졌어요."]},{"index":7,"at":30,"kind":"video","clip":5,"eyebrow":"원리와 쓰임을 설명하다","lines":["집현전 학자들은 새 글자의","원리와 쓰임을 설명했어요."]},{"index":8,"at":35,"kind":"card","year":"1446","eyebrow":"글자를 설명하는 책","title":["『훈민정음』 해례본 간행"],"detail":"왜 만들었는지, 어떻게 쓰는지 밝혔어요."},{"index":9,"at":40,"kind":"card","year":"1447","eyebrow":"노래에서 책으로","title":["『용비어천가』 간행"],"detail":"1445년 노래 작성 → 1447년 책 간행"},{"index":10,"at":45,"kind":"video","clip":6,"eyebrow":"시간이 흐른 뒤","lines":["시간이 흐르며 한글을 배우고","쓰는 사람들이 늘어났어요."]},{"index":11,"at":50,"kind":"video","clip":7,"eyebrow":"오늘, 우리 곁의 한글","lines":["그 글자는 오늘도 우리의","마음과 생각을 이어 줘요."]},{"index":12,"at":55,"kind":"card","eyebrow":"이제 함께 생각해요","title":["세종은 왜","새 글자를 만들었을까요?"],"detail":"영상에서 찾은 까닭을 이야기해 봐요."}];
 scenes.find(scene=>scene.index===7).lines=['학자들은 세종의 명을 받아 새 글자의','원리와 쓰임을 설명했어요.'];
 for(const s of scenes){
  if(s.kind==="video"){
   const clip=await p.add("/home/user/hangul-doc/clips/clip"+String(s.clip).padStart(2,"0")+".mp4");
   const overlay=await p.add("/home/user/hangul-doc/graphics/overlay"+String(s.index).padStart(2,"0")+".png");
   p.compose(<group width={1920} height={1080}><media file={clip} trimStart={0} x={0} y={0} width={1920} height={1080} fit="cover" /><media file={overlay} x={0} y={0} width={1920} height={1080} fit="contain" animate={[{property:"opacity",from:0,to:1,at:0,duration:0.45,easing:"ease-out"}]} /></group>,{at:s.at,dur:5,name:"Korean explanation "+s.index});
  }else{
   const bg=await p.add("/home/user/hangul-doc/graphics/card"+String(s.index).padStart(2,"0")+"-bg.png");
   const fg=await p.add("/home/user/hangul-doc/graphics/card"+String(s.index).padStart(2,"0")+"-fg.png");
   p.compose(<group width={1920} height={1080}>
    <media file={bg} x={0} y={0} width={1920} height={1080} fit="contain" />
    <media file={fg} x={0} y={0} width={1920} height={1080} fit="contain" animate={[{property:"opacity",from:0,to:1,at:0,duration:0.7,easing:"ease-out"},{property:"offsetY",from:32,to:0,at:0,duration:0.7,easing:"ease-out"}]} />
   </group>,{at:s.at,dur:5,name:"Skia title "+s.index});
  }
 }
 await p.frame(22.5,"/home/user/hangul-doc/preview.png");
 await p.render("/home/user/hangul-doc/final.mp4",{depth:8,bitrate:8000000,accel:"cpu",shards:2,concurrency:2});
};
