// Keep the book Ogre recognizable while each district changes his energy costume.
const identities = [
 {name:'Rooftop Rumbler',tint:0xffffff,accent:0xffd36e,motif:'crown'},
 {name:'Canopy Keeper',tint:0xc8ffd2,accent:0x8cf0aa,motif:'leaves'},
 {name:'Ember Echo',tint:0xffc4af,accent:0xffaa65,motif:'embers'},
 {name:'Resonance Foreman',tint:0xbceeff,accent:0x7de8ff,motif:'gears'},
 {name:'Prism Stargazer',tint:0xdacbff,accent:0xb6a0ff,motif:'stars'},
 {name:'Trellis Titan',tint:0xcaffd4,accent:0x75db96,motif:'trellis'},
 {name:'Mural Maestro',tint:0xbef5ff,accent:0x79dfff,motif:'ribbons'},
 {name:'Thunder Echo',tint:0xe3bdff,accent:0xe2a0ff,motif:'lightning'},
 {name:'Midnight Mirage',tint:0xcbd5ff,accent:0x93acff,motif:'moon'},
 {name:'Lantern Legend',tint:0xffe1b0,accent:0xffc76e,motif:'lanterns'},
];
export function bossIdentity(chapter){
 return identities[chapter] || identities[0];
}

// Accumulate time only while a hero occupies an arena edge. Consume the locked
// locations at the next normal boss windup, so the usual warning remains intact.
export function advanceEdgePressure(state,elapsed,heroes,left,width=960){
 const occupied=heroes.filter(hero=>hero.x<left+115||hero.x>left+width-115);
 state.edgeDwell=occupied.length?(state.edgeDwell||0)+elapsed:0;
 state.edgeTargets=occupied.map(hero=>Math.max(left+28,Math.min(left+width-28,hero.x)));
}
export function takeEdgePressure(state){
 if((state.edgeDwell||0)<1400)return [];
 state.edgeDwell=0;
 const targets=[...new Set(state.edgeTargets||[])];
 return targets.map(x=>({x,y:65,angle:Math.PI/2,edgePressure:true}));
}

// Overlay at Ogre-relative coordinates. Call once on a graphics object, then
// attach its position to the Ogre. No animation is required to read the motif.
export function drawBossRegalia(graphics,chapter){
 const {accent,motif}=bossIdentity(chapter);
 graphics.clear().lineStyle(3,accent,1).fillStyle(0x221636,.9);
 const diamond=(x,y,r)=>{
  graphics.fillTriangle(x,y-r,x-r,y,x,y+r);
  graphics.fillTriangle(x,y-r,x+r,y,x,y+r);
  graphics.lineBetween(x,y-r,x+r,y).lineBetween(x+r,y,x,y+r);
  graphics.lineBetween(x,y+r,x-r,y).lineBetween(x-r,y,x,y-r);
 };
 if(motif==='moon'){
  graphics.fillStyle(accent,.9).fillCircle(0,-117,17);
  graphics.fillStyle(0x221636,1).fillCircle(7,-122,15);
 }else if(motif==='lightning'){
  for(const side of [-1,1]){
   graphics.lineBetween(side*42,-91,side*58,-105);
   graphics.lineBetween(side*58,-105,side*50,-83);
   graphics.lineBetween(side*50,-83,side*66,-96);
  }
 }else if(motif==='leaves'){
  for(const side of [-1,1]){
   graphics.lineBetween(side*28,-65,side*47,-104);
   graphics.strokeEllipse(side*43,-91,15,28);
  }
 }else if(motif==='ribbons'){
  for(const side of [-1,1]){
   graphics.lineBetween(side*33,-67,side*59,-56);
   graphics.lineBetween(side*59,-56,side*47,-39);
   graphics.lineBetween(side*47,-39,side*68,-28);
  }
 }else if(motif==='gears'){
  for(const side of [-1,1]){
   graphics.strokeCircle(side*41,-63,14);
   graphics.strokeCircle(side*41,-63,6);
   for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    graphics.lineBetween(side*41+Math.cos(a)*14,-63+Math.sin(a)*14,
     side*41+Math.cos(a)*20,-63+Math.sin(a)*20);
   }
  }
 }else if(motif==='lanterns'){
  for(const side of [-1,1]){
   graphics.lineBetween(side*38,-64,side*52,-40);
   graphics.fillRoundedRect(side*52-9,-40,18,24,4);
   graphics.strokeRoundedRect(side*52-9,-40,18,24,4);
   graphics.lineBetween(side*52,-36,side*52,-20);
  }
 }else if(motif==='trellis'){
  graphics.lineBetween(-45,-92,45,-92).lineBetween(-45,-75,45,-75);
  for(const x of [-32,0,32])graphics.lineBetween(x,-105,x,-58);
 }else if(motif==='embers'){
  for(const x of [-30,0,30]){
   graphics.fillStyle(accent,.9).fillTriangle(x-9,-103,x+9,-103,x,-127);
   graphics.lineBetween(x,-103,x,-91);
  }
 }else if(motif==='stars'){
  for(const [x,y,r] of [[0,-117,13],[-42,-86,8],[42,-86,8]])diamond(x,y,r);
 }else{
  graphics.lineBetween(-27,-96,-23,-116).lineBetween(-23,-116,-9,-105);
  graphics.lineBetween(-9,-105,0,-126).lineBetween(0,-126,9,-105);
  graphics.lineBetween(9,-105,23,-116).lineBetween(23,-116,27,-96);
 }
 return graphics;
}
