const bands=[
 {y:-31,radius:48,depth:11,phase:0},
 {y:-14,radius:43,depth:10,phase:1.1},
 {y:3,radius:34,depth:8,phase:2.2},
 {y:19,radius:24,depth:6,phase:3.3},
 {y:33,radius:13,depth:4,phase:4.4}
];

export function drawOgreVortex(vortex,time,charging){
 const {back,front}=vortex;
 back.clear();
 front.clear();
 back.fillStyle(0x4b177d,.72).fillTriangle(-43,-31,43,-31,3,46);
 for(const {y,radius,depth,phase} of bands){
  const center=Math.sin(time+phase)*4;
  back.fillStyle(0x6f31a5,.68).fillEllipse(center,y,radius*2,depth*3);
  for(let index=0;index<6;index++){
   const angle=time*6+phase+index*Math.PI/3;
   const facing=Math.sin(angle);
   const x=center+Math.cos(angle)*radius*.77;
   const height=depth*(1.1+Math.max(0,facing)*.45);
   const layer=facing>0?front:back;
   layer.fillStyle(index%2?0xb567ef:0x8134c5,.58)
    .fillEllipse(x,y+facing*depth*.7,radius*.75,height);
   if(facing>.45){
    front.fillStyle(charging?0xffc1f9:0xd8a0ff,.64)
     .fillEllipse(x+radius*.1,y+facing*depth*.7-2,radius*.35,2.5);
   }
  }
 }
}
