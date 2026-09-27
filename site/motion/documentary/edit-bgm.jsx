export default async ({ project }) => {
 const p=await project({dir:'/home/user/hangul-bgm/edit',size:'1920x1080',fps:24});
 const music=await p.add('/home/user/hangul-bgm/bgm.wav');
 const video=await p.add('/home/user/hangul-bgm/silent.mp4');
 p.cut(music,{from:0,dur:60,at:0});
 p.compose(<media file={video} x={0} y={0} width={1920} height={1080} fit="contain" muted={true}/>,{at:0,dur:60,name:'Verified documentary picture'});
 await p.render('/home/user/hangul-bgm/rendered.mp4',{depth:8,bitrate:8000000,accel:'cpu',shards:2,concurrency:2});
};
