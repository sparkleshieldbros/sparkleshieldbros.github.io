// Original procedural sprite textures. Collision remains centered on the core.
const colors=['#ff8ccc','#bd8cff','#ffd472','#8deaff','#ff906d','#ff728e','#fff080','#73ffbc','#bca4ff'];
export function installOgreWeapons(scene){
 for(const [index,color] of colors.entries()){
  const key='ogre-weapon-'+index;
  if(scene.textures.exists(key))continue;
  const tex=scene.textures.createCanvas(key,96,96), c=tex.context;
  c.translate(48,48);
  const glow=c.createRadialGradient(0,0,3,0,0,44);
  glow.addColorStop(0,color);glow.addColorStop(1,'transparent');
  c.fillStyle=glow;c.fillRect(-48,-48,96,96);
  c.fillStyle=color;c.strokeStyle='#fff2f9';c.lineWidth=2;
  c.beginPath();
  const points=[8,12,10,6,4,14,6,10,18][index];
  for(let n=0;n<points;n++){
   const a=n*Math.PI*2/points;
   const radius=n%2?12:29;
   const x=Math.cos(a)*radius,y=Math.sin(a)*radius;
   if(n)c.lineTo(x,y);else c.moveTo(x,y);
  }
  c.closePath();c.fill();c.stroke();
  c.fillStyle='#fff8ef';c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fill();
  tex.refresh();
 }
}
