const palettes=[
 {stone:0x674854,edge:0xffc68c,shadow:0x322b40,glass:0x65d4d1},
 {stone:0x356456,edge:0xc8f597,shadow:0x203f42,glass:0xa6efd5},
 {stone:0x614156,edge:0xffb565,shadow:0x35263b,glass:0xff9e5d},
 {stone:0x424f72,edge:0xc7adff,shadow:0x282940,glass:0x9ff4ee}
];

export function roofArt(scene,x,y,width,chapter){
 const {stone,edge,shadow}=palettes[chapter];
 const g=scene.obj(scene.add.graphics().setDepth(3));
 const left=x-width/2,top=y-6.5;
 g.fillStyle(shadow).fillRect(left,top,width,13);
 g.fillStyle(stone).fillRect(left+3,top+3,width-6,6);
 g.fillStyle(edge).fillRect(left,top,width,2);
 for(let seam=left+12;seam<left+width-5;seam+=15){
  g.fillStyle(shadow).fillRect(seam,top+3,2,6);
 }
}

export function districtArt(scene,layer,width,chapter,portals){
 const {stone,edge,shadow,glass}=palettes[chapter];
 const ground=scene.obj(scene.add.graphics().setDepth(1));
 layer.forEachTile(tile=>{
  if(!tile.collides||layer.getTileAt(tile.x,tile.y-1)?.collides)return;
  const {pixelX:x,pixelY:y,width:w,height:h}=tile;
  ground.fillStyle(shadow).fillRect(x,y,w,Math.min(h,25));
  ground.fillStyle(stone).fillRect(x+1,y+4,w-2,10);
  ground.fillStyle(stone,.75).fillRect(x+4,y+17,w-8,6);
  ground.fillStyle(edge).fillRect(x,y,w,2);
 });
 const factor=scene.reduced?1:.79;
 const silhouettes=scene.obj(scene.add.graphics().setDepth(-7).setScrollFactor(factor,0));
 for(let x=18;x<width;x+=170){
  const h=19+(x%5)*7;
  silhouettes.fillStyle(shadow,.42).fillRoundedRect(x,512-h,109,h,5);
  for(let panel=12;panel<100;panel+=24){
   silhouettes.fillStyle(glass,.32).fillRect(x+panel,519-h,13,4);
  }
 }
 const frames=scene.obj(scene.add.graphics().setDepth(0));
 for(const {arch} of portals){
  const {x,y}=arch;
  frames.fillStyle(shadow,.92).fillRoundedRect(x-51,y-66,102,132,42);
  frames.lineStyle(3,stone).strokeRoundedRect(x-49,y-64,98,128,42);
  for(const side of [-1,1]){
   const pillar=x+side*41;
   frames.fillStyle(stone).fillRoundedRect(pillar-7,y-22,14,82,5);
   frames.fillStyle(glass,.9).fillRoundedRect(pillar-2,y+9,4,35,2);
   frames.fillStyle(edge).fillCircle(pillar,y+53,3);
  }
  frames.fillStyle(edge).fillCircle(x,y-61,5);
 }

 const landmarks=scene.obj(scene.add.graphics().setDepth(-2));
 for(const [index,x] of [365,...portals.map(portal=>portal.x-178)].entries()){
  const y=474;
  landmarks.fillStyle(shadow,.84).fillRoundedRect(x-58,y-79,116,79,9);
  landmarks.lineStyle(2,edge,.7).strokeRoundedRect(x-54,y-75,108,71,7);
  if(chapter===0&&index<2){
   landmarks.fillStyle(glass,.8).fillCircle(x,y-42,23);
   landmarks.fillStyle(edge).fillCircle(x,y-42,15);
   landmarks.fillStyle(stone).fillTriangle(x-40,y-17,x,y-56,x+40,y-17);
   landmarks.fillStyle(glass).fillTriangle(x-19,y-17,x,y-43,x+19,y-17);
  }else if(chapter<=1){
   landmarks.fillStyle(glass,.45).fillRoundedRect(x-42,y-66,84,54,12);
   landmarks.lineStyle(2,edge,.75).strokeRoundedRect(x-42,y-66,84,54,12);
   for(const offset of [-28,0,28]){
    landmarks.lineBetween(x+offset,y-65,x+offset,y-12);
    landmarks.fillStyle(0x8ee6a4).fillEllipse(x+offset+7,y-30,12,18);
   }
  }else{
   landmarks.fillStyle(glass,.23).fillCircle(x,y-42,31);
   landmarks.lineStyle(3,edge,.8).strokeCircle(x,y-42,24);
   landmarks.fillStyle(glass).fillTriangle(x-13,y-24,x+2,y-58,x+15,y-24);
  }
 }
}

export function weaponArt(scene,x,y,hero,powered){
 if(!['cash','kairo','ninja'].includes(hero))return null;
 const color=hero==='cash'?0xffd466:hero==='kairo'?(powered?0xc0ff77:0x8af6ff):0xbceaca;
 const g=scene.obj(scene.add.graphics().setPosition(x,y).setDepth(16));
 const length=powered?34:20;
 g.fillStyle(color,.32).fillTriangle(-length,0,-3,-4,-3,4);
 g.lineStyle(1.5,0xfffbec,.85).lineBetween(-length*.55,0,-4,0);
 if(hero==='cash')g.lineStyle(1.5,0x765129,.9).strokeEllipse(0,0,7,11);
 if(hero==='kairo')g.fillStyle(0xffffff,.92).fillEllipse(-2,-3,4,2);
 return g;
}
