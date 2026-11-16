export const STRIDE_FRAMES=8;
const outfits={
 cash:['#267b55','#f4ca52','#ac842b','#f9dc76'],
 kairo:['#ac5229','#ef8e45','#315a71','#75ddde'],
 ninja:['#202735','#434d61','#252b37','#a6bd9d']
};
const alternateOutfits={
 cash:['#94672b','#e4ab36','#b68834','#fff09e'],
 kairo:['#244b86','#4389cd','#253e61','#84d8ff'],
 ninja:['#a2a6b0','#e5e8ee','#929bab','#fffdf0']
};

export function drawStride(ctx,pose,width,height,row,hero,alternate){
 const [shade,lit,boot,trim]=(alternate&&alternateOutfits[hero])||outfits[hero]||outfits.cash;
 const phase=row/STRIDE_FRAMES;
 const bob=[0,2,1,0,0,2,1,0][row];
 const hip=39-height*.35+bob;
 const swing=height*.19;
 for(const near of [false,true]){
  const step=(phase+(near?0:.5))%1;
  const planted=step<.5;
  const travel=planted?1-step*4:-Math.cos((step-.5)*2*Math.PI);
  const lift=planted?0:Math.sin((step-.5)*2*Math.PI)*height*.17;
  const footX=travel*swing;
  const footY=35-lift;
  const kneeX=footX*.54+(planted?2:7);
  const kneeY=(hip+footY)/2;
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const [color,thickness] of [['#182035',height*.13],[near?lit:shade,height*.095]]){
   ctx.strokeStyle=color;ctx.lineWidth=thickness;
   ctx.beginPath();ctx.moveTo(near?3:-3,hip-2);ctx.lineTo(kneeX,kneeY);ctx.lineTo(footX,footY-3);ctx.stroke();
  }
  ctx.fillStyle=near?boot:shade;
  ctx.beginPath();ctx.roundRect(footX-5,footY-5,height*.17,9,3);ctx.fill();
  ctx.fillStyle=trim;ctx.fillRect(footX+1,footY+2,height*.09,2);
 }
 ctx.save();
 ctx.beginPath();ctx.rect(-56,-56,112,hip+61);ctx.clip();
 ctx.drawImage(pose,-width/2,39-height+bob,width,height);
 ctx.restore();
}

export function strideFrame(motion,x){
 const previous=motion.strideX;
 motion.strideX=x;
 const travel=previous==null?0:Math.abs(x-previous);
 motion.strideDistance=travel>30?0:(motion.strideDistance||0)+travel;
 return Math.floor(motion.strideDistance/8)%STRIDE_FRAMES;
}
