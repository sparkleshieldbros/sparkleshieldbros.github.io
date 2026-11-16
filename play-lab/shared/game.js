import {drawOgreVortex} from './cash/ogre-vortex.js';
import {districtArt,roofArt,weaponArt} from './cash/district-art.js';
import {attackMotion,attackFrame} from './cash/attack-motion.js';
import {drawStride,strideFrame,STRIDE_FRAMES} from './cash/stride.js';
import {roster} from './cash/roster.js';
import {installOgreWeapons} from './cash/ogre-weapons.js';
import {advanceBossClock,chapterBossPattern,bossHit,OGRE_HITS_PER_LIFE} from './cash/boss.js';
import {cashCue} from './cash/presentation.js';
import {tuning,runVelocity} from './cash/movement.js';
import {movementIntent} from './cash/input.js';
import {bindCheckIn,showMethodCallout} from './family.js';
import {chapterNames,levels} from './levels.js';
import {createProgressStore} from './save.js';
import {playMusicBeat,tone,unlockEffects} from './audio.js';
import {bindGameUI} from './ui.js';
/* Sparkle Shield Bros — Phaser 3 shared game engine. Phaser is MIT-licensed. */
(()=>{'use strict';
// Keep the fallback outside the Phaser scene declaration so an unavailable
// engine can still show a useful message.
if(typeof Phaser==='undefined'){
 document.querySelector('#status').textContent='The game engine could not load. Check your connection and refresh.';
 return;
}
const kind=document.body.dataset.game||'bubble';
const info={bubble:{title:'Kairo’s Anti-Gravity Quest',desc:'Use anti-gravity bubbles to repair paths and restore the Floating Garden.',power:'🫧 BUBBLE'},cash:{title:'Captain Cash: Coin Dash',desc:'Dash past obstacles and shoot coins from your boots to activate targets.',power:'🪙 COINS'},ninja:{title:'Ninja Nugs: Secret Mission',desc:'Explore the maze, reveal hidden paths and activate the secret switch.',power:'🔎 SCAN'},echo:{title:'The Echo Ogre: Sparkle Rescue',desc:'Combine the brothers’ powers and choose how to restore the Sparkle Grid.',power:'✨ POWER'}}[kind];
const status=document.querySelector('#status');const $=id=>document.getElementById(id);const W=960,H=540;let game;
const buttons={left:false,right:false,up:false,down:false,jump:false,breathe:false,power:false,dash:false,switch:false};
const CASH_CHALLENGES=['Maplewood Rooftop Relay','Floating Garden Trick Shot','Night Foundry Counter Run'];
const LIGHTNING_CHARGE_MS=10_000;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const palette={sky:0x142b55,blue:0x70e4ff,gold:0xffd16b,lav:0xa77bea,white:0xfff5df,grass:0x326a67};
const progress=createProgressStore(kind,chapterNames[kind].length);
const readProgress=progress.read;
const saveProgress=progress.save;
function updateChapterSelect(current){
 const select=$('chapter-select');
 if(!select)return;
 select.replaceChildren(...chapterNames[kind].map((title,index)=>{
  const option=new Option(title,String(index));
  option.disabled=index>readProgress();
  return option;
 }));
 select.value=String(current);
}
const canonical={kairo:{name:'Bubble Boy Kairo',image:'../../assets/runtime/bubble-boy-kairo-profile.jpg'},cash:{name:'Captain Cash',image:'../../assets/runtime/captain-cash-profile.jpg'},ninja:{name:'Ninja Nugs',image:'../../assets/runtime/ninja-nugs-profile.jpg'},ogre:{name:'Echo Ogre',image:'../../assets/runtime/echo-ogre-profile.jpg'}};
for(const hero of ['mom','dad'])canonical[hero]={name:roster[hero].name,image:'../../assets/runtime/'+hero+'-profile.jpg'};
function portrait(hero){const c=canonical[hero]||canonical.kairo;const im=$('dialogue-portrait'),nm=$('dialogue-name');if(im){im.src=c.image;im.alt='Official '+c.name+' portrait'}if(nm)nm.textContent=c.name;document.querySelectorAll('.hero-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hero===hero)))}
function dialogue(message){const el=$('dialogue-line');if(el)el.textContent=message}

function setStatus(t){status.textContent=t;dialogue(t)}
function emit(scene,x,y,color=palette.gold,count=16){
 if(scene.reduced)return;
 const pool=scene.sparkPool??=Array.from({length:48},()=>
  scene.add.circle(0,0,4).setDepth(30).setVisible(false));
 for(const particle of pool.filter(p=>!p.visible).slice(0,count)){
  const angle=Math.random()*Math.PI*2;
  const distance=60+Math.random()*130;
  particle.setPosition(x,y).setFillStyle(color,.9).setScale(1).setAlpha(1).setVisible(true);
  scene.tweens.add({targets:particle,x:x+Math.cos(angle)*distance,y:y+Math.sin(angle)*distance,
   alpha:0,scale:0,duration:420,onComplete:()=>particle.setVisible(false)});
 }
}
// Phase 13: generated animation atlas. The original published portrait is never recolored or altered.
const CASH_HERO_SCALE={kairo:.84,dad:1.68,ninja:.66,mom:1.32};
const ATLAS_STATES=['idle','run','jump','fall','dash','power','celebrate'];
// Crops in reference-sheet coordinates normalized to a width of 600.
const BOOK_POSES={
 kairo:[[23,7,87,128],[338,9,427,129],[453,7,590,99],[9,148,108,238],[453,7,590,99],[479,148,576,242],[417,254,479,359]],
 cash:[[15,17,134,202],[292,19,428,203],[162,19,289,204],[442,24,598,179],[442,24,598,179],[174,396,285,573],[300,393,410,572]],
 ninja:[[454,311,551,390],[184,308,279,391],[178,26,276,117],[22,35,130,116],[184,308,279,391],[448,36,594,117],[454,311,551,390]],
 mom:[[61,33,102,118],[465,24,560,119],[162,124,264,200],[309,128,424,204],[461,131,577,200],[16,219,135,297],[28,310,114,396]],
 dad:[[37,41,86,127],[458,30,561,127],[163,133,263,205],[301,141,424,207],[452,143,576,204],[292,223,432,299],[12,315,121,392]],
};
const ADULT_WALK={mom:[331,25,397,119],dad:[318,29,411,127]};
function bookPose(scene,hero,index,alternate){
 const key='book-poses-'+hero;
 if(!scene.textures.exists(key))return null;
 const sheet=scene.textures.get(key).getSourceImage();
 const [x,y,right,bottom]=BOOK_POSES[hero][index]??ADULT_WALK[hero];
 const scale=sheet.width/600;
 const cutout=document.createElement('canvas');
 cutout.width=right-x;cutout.height=bottom-y;
 const ctx=cutout.getContext('2d');
 ctx.drawImage(sheet,x*scale,y*scale,cutout.width*scale,cutout.height*scale,0,0,cutout.width,cutout.height);
 const pixels=ctx.getImageData(0,0,cutout.width,cutout.height);
 for(let i=0;i<pixels.data.length;i+=4){
  const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
  if(Math.min(r,g,b)>215&&Math.max(r,g,b)-Math.min(r,g,b)<15)pixels.data[i+3]=0;
  else if(alternate){
   const color=pixels.data;
   const green=g>r*1.12&&g>b*1.13;
   const orange=r>g*1.27&&g>b*1.23&&r>125;
   const dark=Math.max(r,g,b)<130&&Math.max(r,g,b)-Math.min(r,g,b)<45;
   const shade=(r+g+b)/3;
   const replacement=hero==='cash'&&green?[g*1.45,g*1.23,g*.24]:
    hero==='kairo'&&orange?[r*.26,r*.68,r*1.16]:
    hero==='ninja'&&dark?[155+shade*.74,160+shade*.74,168+shade*.69]:
    (hero==='mom'||hero==='dad')&&(green||orange||b>r*1.22)?[shade*.8,shade*.69,shade*1.35]:null;
   if(replacement)color.set(replacement,i);
  }
 }
 ctx.putImageData(pixels,0,0);
 if(index===7){
  // The walking references face left while the game atlas faces right.
  if(hero==='dad')ctx.clearRect(0,0,27,4);
  const facingRight=document.createElement('canvas');
  facingRight.width=cutout.width;facingRight.height=cutout.height;
  const flipped=facingRight.getContext('2d');
  flipped.translate(cutout.width,0);
  flipped.scale(-1,1);
  flipped.drawImage(cutout,0,0);
  return facingRight;
 }
 return cutout;
}
function makeHeroAtlas(scene,hero,alternate=false){
 const key='atlas-'+hero+(alternate?'-alternate':'');if(scene.textures.exists(key))return key;
 const srcKey='canon-'+hero,portrait=scene.textures.exists(srcKey)?scene.textures.get(srcKey).getSourceImage():null;
 const cell=112,canvas=document.createElement('canvas');canvas.width=cell*7;canvas.height=cell*STRIDE_FRAMES;
 const ctx=canvas.getContext('2d');const cash=hero==='cash',ninja=hero==='ninja';
 const primary=cash?'#279c69':ninja?'#384b62':'#ed8c39',trim=cash?'#f5d26d':ninja?'#b2e9bb':'#ffe3a1';
 const poses=ATLAS_STATES.map((_,index)=>bookPose(scene,hero,index,alternate));
 const walk=ADULT_WALK[hero]?bookPose(scene,hero,7,alternate):null;
 const round=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
 for(let row=0;row<STRIDE_FRAMES;row++)for(let col=0;col<7;col++){
  const state=ATLAS_STATES[col],phase=row*Math.PI/2,run=state==='run',dash=state==='dash',power=state==='power';
  ctx.save();ctx.translate(col*cell+56,row*cell+56);
  const bounce=run?Math.abs(Math.sin(phase))*5:state==='celebrate'?Math.abs(Math.sin(phase))*7:state==='idle'?Math.sin(phase)*2:0;
  ctx.translate(dash?8:0,-bounce);ctx.rotate(dash?-.16:state==='jump'?-.1:state==='fall'?.1:0);
  const pose=poses[col];
  if(pose){
   const proportioned=kind==='cash'&&!cash;
   const height=proportioned?94:pose.height*Math.min(100/pose.width,100/pose.height);
   const width=Math.min(100,pose.width*height/pose.height);
   if(run&&kind==='cash'){
    ctx.translate(0,bounce);
    if(walk){
     const stride=[pose,pose,walk,poses[0],walk,pose,walk,poses[0]][row];
     const strideWidth=Math.min(100,stride.width*height/stride.height);
     ctx.translate([0,2,1,0,0,2,1,0][row],39);
     const compression=[1,1,.98,.97,1,1,.98,.97][row];
     ctx.drawImage(stride,-strideWidth/2,-height*compression,strideWidth,height*compression);
    }else drawStride(ctx,pose,width,height,row,hero,alternate);
   }else if(power&&kind==='cash'){
    const beat=row%3;
    const motion=attackMotion(hero);
    const lean=[-.12,.11,.035][beat]*(motion.x/28);
    ctx.translate([ -5, 6, 1 ][beat],39);
    ctx.rotate(lean);
    ctx.scale(1,[.94,1.035,.99][beat]);
    ctx.drawImage(beat===0?(poses[0]||pose):pose,-width/2,-height,width,height);
   }else ctx.drawImage(pose,-width/2,39-height,width,height);
   ctx.restore();
   continue;
  }
  ctx.strokeStyle=trim;ctx.lineWidth=3;
  if(power){ctx.fillStyle='rgba(112,228,255,.2)';ctx.beginPath();ctx.arc(0,0,45,0,Math.PI*2);ctx.fill()}
  // Body silhouette is provisional. The portrait remains the untouched canonical reference.
  ctx.fillStyle=cash?'#f1c15c':ninja?'#425c69':'#407dc0';ctx.beginPath();ctx.moveTo(-11,2);ctx.lineTo(-28,32);ctx.lineTo(10,34);ctx.closePath();ctx.fill();
  ctx.fillStyle=primary;round(-16,-2,32,38,9);ctx.fill();ctx.stroke();
  const stride=run?Math.sin(phase)*9:dash?10:0;
  ctx.strokeStyle=primary;ctx.lineWidth=10;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-9,31);ctx.lineTo(-9+stride,46);ctx.moveTo(9,31);ctx.lineTo(9-stride,46);ctx.stroke();
  ctx.fillStyle=trim;round(-20+stride,43,20,9,3);ctx.fill();round(2-stride,43,20,9,3);ctx.fill();
  ctx.strokeStyle=primary;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-15,7);ctx.lineTo(-25+(run?stride*.6:0),22);ctx.moveTo(15,7);ctx.lineTo(25-(run?stride*.6:0),22);ctx.stroke();
  if(portrait){const sw=portrait.width||1,sh=portrait.height||1,scale=Math.min(45/sw,45/sh);ctx.save();ctx.beginPath();ctx.arc(0,-23,24,0,Math.PI*2);ctx.clip();ctx.drawImage(portrait,-sw*scale/2,-23-sh*scale/2,sw*scale,sh*scale);ctx.restore();ctx.strokeStyle=trim;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-23,24,0,Math.PI*2);ctx.stroke()}
  else{ctx.fillStyle=trim;ctx.beginPath();ctx.arc(0,-23,21,0,Math.PI*2);ctx.fill();ctx.fillStyle='#152d47';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText(hero==='ninja'?'🐾':'★',0,-16)}
  if(power){ctx.strokeStyle='#86f0ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-3,40+row*2,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
 }
 scene.textures.addSpriteSheet(key,canvas,{frameWidth:cell,frameHeight:cell});
 for(let i=0;i<ATLAS_STATES.length;i++){
  const state=ATLAS_STATES[i],animKey=key+'-'+state;
  if(!scene.anims.exists(animKey))scene.anims.create({key:animKey,frames:[0,1,2,3].map(r=>({key,frame:r*7+i})),frameRate:state==='run'?12:state==='dash'?16:state==='idle'?4:8,repeat:-1});
 }
 return key;
}

class Adventure extends Phaser.Scene{
 constructor(){super('Adventure');this.level=0;this.hero='kairo';this.muted=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.pressed={};this.lock=false;this.completed=false;this.score=0;this.motionState='idle';this.motionClock=0;this.facing=1;this.lastGrounded=true}
 preload(){
 if(kind==='cash'){
  for(const level of [1,2,3])this.load.tilemapTiledJSON('cash-chapter-'+level,'../../assets/levels/cash-chapter-'+level+'.json');
  for(const hero of ['mom','dad','ninja'])this.load.image('book-poses-'+hero,'../../assets/runtime/'+hero+'-poses.jpg');
  for(const hero of ['mom','dad','ninja'])this.load.image('canon-'+hero,canonical[hero].image);
  this.load.image('book-poses-kairo','../../assets/runtime/kairo-poses.jpg');
  this.load.image('canon-kairo','../../assets/runtime/bubble-boy-kairo-profile.jpg');
  for(const asset of ['sun-cuff','rift-wing','kiln-runner'])this.load.svg(asset,'../../assets/runtime/'+asset+'.svg');
  this.load.image('cash-scout','../../assets/runtime/echo-scout-painted.png');
  this.load.svg('cash-launch','../../assets/runtime/launch-pad.svg');
  this.load.image('cash-garden','../../assets/book/floating-garden.jpg');
  this.load.image('maplewood-houses','../../assets/runtime/maplewood-houses.jpg');
  this.load.tilemapTiledJSON('cash-showcase','../../assets/levels/cash-showcase.json');
  this.load.svg('cash-terrain','../../assets/levels/terrain-alloy.svg');
 }

 const panel=$('load-panel'), bar=$('load-progress'), label=$('load-status');
 if(panel)panel.hidden=false;
 this.load.on('progress',fraction=>{
  if(bar)bar.value=fraction*bar.max;
  if(label)label.textContent=Math.round(fraction*100)+'%';
 });
 this.load.once('complete',()=>{if(panel)panel.hidden=true;});

 if(kind==='cash'||kind==='echo')this.load.image('ogre-action','../../assets/runtime/ogre-action.jpg');

 if(kind==='ninja')this.load.image('book-arena','../../assets/runtime/ninja-arena.jpg');
 if(kind==='bubble')this.load.image('book-floating-garden','../../assets/book/floating-garden.jpg');for(const hero of (kind==='echo'?['kairo','cash','ninja']:[({bubble:'kairo',cash:'cash',ninja:'ninja'})[kind]]))this.load.image('book-poses-'+hero,'../../assets/runtime/'+hero+'-poses.jpg');if(kind==='echo')this.load.image('book-opening','../../assets/runtime/opening.jpg');for(const [key,character] of Object.entries(canonical)){if(kind==='echo'||key===({bubble:'kairo',cash:'cash',ninja:'ninja'})[kind])this.load.image('canon-'+key,character.image)}this.load.on('loaderror',file=>{if(file.key.startsWith('canon-'))console.warn('Character portrait unavailable:',file.key)})}
 create(){
 this.events.on('cash:coin-fired',({x,y,charged})=>{
  if(kind==='cash')cashCue(this,charged?'charge':'coin');else tone(this,charged?540:940,charged?.21:.07);
  if(kind==='cash')this.cashFirePose=120;
  if(kind==='cash')emit(this,x,y,0xffd36e,charged?20:6);
 });
 this.events.on('coin:target-hit',({x,y})=>{emit(this,x,y,0xffd36e,10);if(kind==='cash')cashCue(this,'impact');else tone(this,790,.09);});
 this.events.once('shutdown',()=>{this.events.off('cash:coin-fired');this.events.off('coin:target-hit');});

 const chapter=$('chapter-select');
 const choose=()=>{this.cashChallenge=null;const index=Number(chapter.value);if(Number.isInteger(index)&&index>=0&&index<levels[kind].length&&index<=readProgress()){this.level=index;this.loadLevel();}};
 chapter?.addEventListener('change',choose);
 this.events.once('shutdown',()=>chapter?.removeEventListener('change',choose));
 if(kind==='echo'||kind==='cash'){
 const mode=$('echo-mode');
 const tierKey='sparkle-play-lab:'+kind+':tier';
 if(kind==='echo'){try{const saved=localStorage.getItem(tierKey);if([...mode.options].some(o=>o.value===saved))mode.value=saved;}catch{}}
 const reset=()=>{try{localStorage.setItem(tierKey,mode.value);}catch{}this.loadLevel();};
 mode.addEventListener('change',reset);
 this.events.once('shutdown',()=>mode.removeEventListener('change',reset));
 }this.cameras.main.setBackgroundColor('#142b55');this.keys=this.input.keyboard.addKeys('A,D,W,S,LEFT,RIGHT,UP,DOWN,SPACE,J,K,Q,R,ENTER,B,E,F,SHIFT');this.input.keyboard.on('keydown-R',()=>this.loadLevel());this.input.keyboard.on('keydown-Q',()=>this.swap());this.input.keyboard.on('keydown-W',()=>{
 if(this.showcase?.partnerHero==='ninja'&&!this.completed&&this.echoStep!=='retry')this.showcase.partnerJumpPressed=true;
});this.input.keyboard.on('keydown-E',()=>{
 if(this.showcase?.partner&&!this.completed&&this.echoStep!=='retry')this.showcase.partnerDashPressed=true;
});this.input.keyboard.on('keydown-F',()=>{
 const s=this.showcase;
 if(!s?.partner||this.completed)return;
 if(this.echoStep==='duel')this.fireDuelCoin(s.partner,s.partnerHero);
 else if(this.echoStep==='course')this.fireScoutShot(s.partner,s.partnerHero,s.partner.flipX?-1:1);
});this.input.keyboard.on('keydown-J',()=>{if(!this.showcase?.partner)this.action();});this.input.keyboard.on('keydown-K',()=>{if(!this.showcase?.partner)this.dash();});this.input.keyboard.on('keydown-SHIFT',()=>{if(this.showcase?.partner)this.dash();});this.input.keyboard.on('keydown-ENTER',()=>{if(this.completed)this.next();else if(this.showcase?.partner)this.action()});this.createBackdrop();
 if(kind==='cash'&&challengeOnBoot>=0){
  this.cashChallenge=challengeOnBoot;
  this.level=challengeOnBoot;
 }
 if(kind==='cash'&&!practiceOnBoot&&this.cashChallenge==null)this.level=Math.min(readProgress(),levels.cash.length-1);this.loadLevel(kind==='cash'&&!practiceOnBoot&&this.cashChallenge==null);if(practiceOnBoot)this.enterCashArena(true);this.events.on('shutdown',()=>{this.input.keyboard.removeAllListeners()})}
 createBackdrop(){
  if(kind==='cash')return;
  if(this.textures.exists('book-arena')){
   const image=this.add.image(W/2,H/2,'book-arena').setDepth(-8);
   image.setScale(Math.max(W/image.width,H/image.height));
   this.add.rectangle(W/2,H/2,W,H,0x112138,kind==='ninja'?.67:.39).setDepth(-7);
   return;
  }
  if(kind==='bubble'&&this.textures.exists('book-floating-garden')){
   this.add.image(W/2,H/2,'book-floating-garden').setDisplaySize(W,H).setDepth(-8);
   const shade=this.add.graphics().setDepth(-7);
   shade.fillGradientStyle(0x10293a,0x10293a,0x142c38,0x142c38,.08,.08,.52,.52).fillRect(0,0,W,H);
   if(!this.reduced){
    for(let i=0;i<12;i++){
     const mote=this.add.circle(30+(i*83)%900,90+(i*47)%355,2+i%2,0xffe8a0,.35).setDepth(-6);
     this.tweens.add({targets:mote,y:mote.y-25,alpha:.08,duration:2600+i*170,yoyo:true,repeat:-1,delay:i*200,ease:'Sine.InOut'});
    }
   }
   return;
  }
  if(kind==='echo'&&this.textures.exists('book-opening')){
 const art=this.add.image(W/2,H/2,'book-opening').setDepth(-6);
 art.setScale(Math.max(W/art.width,H/art.height));
 this.add.rectangle(W/2,H/2,W,H,0x142b55,.43).setDepth(-5);
 return;
 }const g=this.add.graphics().setDepth(-5);g.fillGradientStyle(0x16356b,0x16356b,0x3b6584,0x3b6584).fillRect(0,0,W,H);g.fillStyle(0xffd47e,.9).fillCircle(835,78,35);for(let i=0;i<15;i++){const x=i*79-10,h=75+(i%4)*22;g.fillStyle(i%2?0x244766:0x305473,.9).fillRect(x,445-h,69,h);g.fillStyle(0xf7d78b,.75);for(let j=0;j<3;j++)g.fillRect(x+11+j*17,455-h+15,8,11)}g.fillStyle(0x347269).fillRect(0,502,W,38);g.fillStyle(0x66a78b).fillRect(0,498,W,6);for(let i=0;i<22;i++){g.fillStyle(0x9de6b2,.5).fillCircle((i*59)%W,503,2+(i%3))}this.add.text(22,15,'SPARKLE SHIELD BROS',{fontFamily:'system-ui',fontSize:'16px',fontStyle:'bold',color:'#c7f5ff'}).setDepth(40)}
 clearLevel(){this.finalePending=false;for(const collider of this.levelColliders||[])collider.destroy();this.levelColliders=[];this.dashTime=0;this.jumpBuffer=0;this.nugsAirJumpUsed=false;this.groundGrace=0;this.jumpWasDown=false;this.dashCarry=0;this.dashRecovery=0;this.cashFirePose=0;this.cashWasGrounded=true;this.crateDelivered=false;this.targetsAnnounced=false;if(this.objects)this.objects.forEach(o=>o.destroy());this.objects=new Set();this.walls=[];this.targets=[];this.projectiles=[];this.completed=false;this.lock=false;this.dashTime=0;this.holding=false;this.charge=100;this.ogreMood=0;this.ninjaScan=0;if(this.player)this.tweens.killTweensOf(this.player);this.heroMotion=null;this.motionState='idle';this.motionClock=0}
 obj(object){
  const objects=this.objects;
  objects.add(object);
  object.once('destroy',()=>objects.delete(object));
  return object;
 }
 label(t,x,y,size=18,color='#fff3d1'){return this.obj(this.add.text(x,y,t,{fontFamily:'system-ui',fontSize:size+'px',fontStyle:'bold',color,align:'center'}).setOrigin(.5))}
 box(x,y,w,h,c=0x72547d){let r=this.obj(this.add.rectangle(x,y,w,h,c).setStrokeStyle(3,0xc1a0d8));this.physics.add.existing(r,true);this.walls.push(r);return r}
 setupVillain(){
  const [name,attack,color]={
   bubble:['Bramble Baron','BRAMBLE BURST',0xff9ed2],
   cash:['Clockwork Crook','GEAR SWEEP',0xffbd65],
   ninja:['Shadow Fox','SHADOW POUNCE',0xb0dcff],
   echo:['Echo Ogre','ECHO RIPPLE',0xd9a1ff]
  }[kind];
  const x=kind==='ninja'?480:845,y=kind==='ninja'?32:137;
  if(kind==='echo'){
   this.ogre.setScale(1.35).setDepth(6);
   this.obj(this.add.ellipse(845,466,157,29,0x241338,.55));
  }
  const mask=kind==='echo'?this.ogre:this.obj(this.add.container(x,y,[
   this.add.ellipse(0,4,86,65,0x3f315d).setStrokeStyle(4,color),
   this.add.triangle(-28,-24,0,24,15,0,30,24,color),
   this.add.triangle(28,-24,0,24,15,0,30,24,color),
   this.add.ellipse(-17,0,17,17,0xffedbc),this.add.ellipse(17,0,17,17,0xffedbc),
   this.add.circle(-16,1,5,0x30233b),this.add.circle(18,1,5,0x30233b),
   this.add.arc(0,13,12,0,180,false,0x1e1730)
  ]).setScale(kind==='ninja'?.55:1).setDepth(6));
  const label=this.label(name,x,kind==='echo'?295:y+(kind==='ninja'?29:48),16).setDepth(18);
  label.setBackgroundColor('#171b31').setPadding(7,3);
  const offsets=kind==='cash'?[-112,0,112]:kind==='echo'?[-86,0,86]:[0];
  this.villain={name,attack,color,mask,label,offsets,phase:'rest',time:3400,round:0,
   zones:offsets.map(()=>this.obj(this.add.ellipse(0,0,78,68,color,.2)
    .setStrokeStyle(4,color).setDepth(8).setVisible(false)))};
 }
 updateVillain(dt){
  const v=this.villain;
  if(!v)return;
  if(kind==='echo'){this.updateEcho(dt);return;}
  v.time-=dt;
  if(v.phase==='rest'&&v.time<=0){
   if(kind==='echo'){
    const slam=(v.round+this.level)%2===1;
    v.attack=slam?'OGRE STOMP • JUMP':'ECHO RIPPLE • MOVE';
    v.slam=slam;
    v.round++;
   }
   v.zones.forEach((zone,i)=>{
    const offset=v.offsets[i];
    const x=clamp(this.player.x+(kind==='ninja'?this.facing*34:offset),45,W-45);
    const y=clamp(kind==='echo'&&v.slam?496:this.player.y+(kind==='echo'?(i-1)*27:0),55,H-42);
    zone.setPosition(x,y).setFillStyle(v.color,.20).setVisible(true);
   });
   if(!this.reduced){v.mask.setAngle(-7);if(kind==='echo')v.mask.setScale(1.5);}
   v.label.setText(kind==='echo'?v.attack:v.attack+' • MOVE!');
   v.phase='warning';v.time=1200;
  }else if(v.phase==='warning'&&v.time<=0){
   v.zones.forEach(zone=>{
    zone.setFillStyle(v.color,.65);
    emit(this,zone.x,zone.y,v.color,8);
   });
   v.mask.setAngle(0);
   if(kind==='echo')v.mask.setScale(1.28);
   v.phase='strike';v.time=420;v.hit=false;
   tone(this,290,.1);
  }else if(v.phase==='strike'){
   if(!v.hit&&v.zones.some(zone=>Math.hypot(this.player.x-zone.x,this.player.y-zone.y)<42)){
    v.hit=true;
    this.score=Math.max(0,this.score-10);
    this.updateHUD();
    emit(this,this.player.x,this.player.y,v.color,10);
    v.label.setText('Keep going!');
   }
   if(v.time<=0){
    v.zones.forEach(zone=>zone.setVisible(false));
    if(kind==='echo')v.mask.setScale(1.35);
    v.label.setText(v.hit?v.name:'Nice dodge!');
    if(!v.hit){this.score+=5;this.updateHUD();}
    v.phase='rest';v.time=Math.max(2400,3900-this.level*280);
   }
  }
 }
 setOgrePose(pose){
  if(!this.ogreArt)return;
  const key='ogre-pose-'+pose+(kind==='cash'?'-vortex':'');
  if(!this.textures.exists(key)){
   const sheet=this.textures.get('ogre-action').getSourceImage();
   const [x,y,w,h]=[[402,29,87,123],[318,29,82,123],[235,29,80,123],[510,29,90,123]][pose];
   const scale=sheet.width/640;
   const texture=this.textures.createCanvas(key,w,h);
   const ctx=texture.context;
   ctx.drawImage(sheet,x*scale,y*scale,w*scale,h*scale,0,0,w,h);
   const pixels=ctx.getImageData(0,0,w,h);
   for(let i=0;i<pixels.data.length;i+=4){
    const g=pixels.data[i+1],b=pixels.data[i+2];
    const row=Math.floor(i/(4*w));
    const fade=kind==='cash'?Math.max(0,Math.min(1,(104-row)/16)):1;
    pixels.data[i+3]=Math.min(255,Math.max(0,(b-g-9)*6))*fade;
   }
   ctx.putImageData(pixels,0,0);
   texture.refresh();
  }
  this.ogreArt.setTexture(key).setDisplaySize(132,182);
 }
 setupDuel(){
  this.duel={cash:100,ogre:100,cashLives:3,ogreLives:2,pattern:0,clock:900,shots:[],coins:[],cooldown:0,grace:0};
  this.ogreArt=null;
  if(this.textures.exists('ogre-action')){
   this.ogre.removeAll(true);
   this.ogreArt=this.add.image(0,-50,'ogre-action');
   this.ogre.add(this.ogreArt);
   this.setOgrePose(0);
  }
  if(kind==='cash'){
   const back=this.add.graphics(),front=this.add.graphics();
   this.ogre.addAt(back,0);
   this.ogre.add(front);
   this.duel.vortex={back,front};
   drawOgreVortex(this.duel.vortex,0,false);
  }
  this.duelMeter=this.obj(this.add.graphics().setDepth(42).setScrollFactor(0));
  this.duelReadout=this.label('',480,62,19).setScrollFactor(0).setDepth(43).setBackgroundColor('#211a32').setPadding(7,4);
  this.duelGlow=this.obj(this.add.ellipse(0,0,50,15,0xffdf70,.7).setDepth(12).setVisible(false));
  this.drawDuelMeters();
 }
 setupCoinOgre(){
  installOgreWeapons(this);
  this.echoMode=$('echo-mode')?.value||'practice';
  this.echoHits=0;
  this.echoStep='duel';
  this.ogre=this.obj(this.add.container(845,415,
   [this.add.ellipse(0,-25,110,140,0x7543a1)]).setDepth(6));
  this.echoCue=this.label('COIN DUEL',480,108,25).setScrollFactor(0).setDepth(30).setBackgroundColor('#211a32').setPadding(9,5);
  this.villain=null;
  this.setupDuel();
  this.duel.pattern=chapterBossPattern(this.level,-1,2,()=>0);
  if(this.showcase){
   this.ogre.x=this.showcase.boss.x;this.ogre.y=this.showcase.boss.y;
   this.duel.cashLives=this.showcase.hearts;
   this.drawDuelMeters();
  }
 }
 setupEcho(){
  this.echoMode=$('echo-mode').value;
  this.echoStep='wait';
  this.sparkle={calm:0,kindness:0,courage:0,repair:0};
  this.breath=0;
  this.breathRing=this.obj(this.add.graphics().setDepth(33));
  this.updateSparkleHUD();
  this.showBreathe(false);
  $('echo-method').hidden=true;
  this.setupDuel();
  this.crate.removeAll(true);
  this.crate.add([
   this.add.rectangle(0,0,32,37,0x714b49).setStrokeStyle(3,0xffca75),
   this.add.rectangle(0,0,21,26,0xffdc86),
   this.add.circle(0,-23,6,0x493543).setStrokeStyle(2,0xffca75)
  ]);
  this.crate.setVisible(false);
  this.crate.body.enable=false;
  this.goal.setVisible(false);
  this.targets[0].setVisible(false);
  this.echoLight=this.obj(this.add.rectangle(W/2,H/2,W,H,0xffd47b,0).setDepth(-4));
  this.echoSwitch=this.obj(this.add.star(730,469,5,10,20,0xffd674)
    .setStrokeStyle(3,0xffffff).setDepth(11).setVisible(false));
  this.echoWave=this.obj(this.add.rectangle(0,493,30,47,0xd9a1ff,.85)
    .setStrokeStyle(4,0xffe0ff).setDepth(9).setVisible(false));
  this.echoCue=this.label('',480,108,25).setDepth(30).setBackgroundColor('#211a32').setPadding(9,5);
  this.echoCue.setText(this.dataLevel.name);
 }
 updateEcho(dt){
  if(this.echoStep==='stop'||this.echoStep==='choose'||this.echoStep==='repair'||this.echoStep==='breathe'||this.echoStep==='retry'||this.echoStep==='guardian'||this.echoStep==='scan'||this.echoStep==='switch')return;
  if(this.echoStep==='duel'){this.updateDuel(dt);return;}
  const v=this.villain;
  const practice=this.echoMode==='practice';
  const elapsed=Math.min(dt,50);
  this.echoTime-=elapsed;
  if(this.echoAttack==='warning'&&!this.echoStomp&&this.echoChime>0){
   this.echoChime-=elapsed;
   if(this.echoChime<=0)tone(this,860,.15);
  }
  if(this.echoAttack==='warning'&&this.echoStomp&&this.echoTime<=this.echoWarning-275&&!this.echoBeat){
   this.echoBeat=true;tone(this,115,.15);
  }
  if(this.echoAttack==='ripple'&&this.echoTime>0){
   this.echoWave.x-=elapsed*(practice?.36:.52);
   if(Math.abs(this.echoWave.x-this.player.x)<28&&this.player.y>438)this.echoHit();
  }
  if(this.echoAttack==='stomp'&&this.echoTime>0&&this.player.y>443)this.echoHit();
  if(this.echoTime>0)return;
  if(this.echoAttack==='rest'){
   this.echoStomp=this.level===0||(this.level===2&&this.echoRound%2===1);
   this.echoRound++;
   this.echoAttack='warning';
   this.echoWarning=practice?1600:950;
   this.echoTime=this.echoWarning;
   this.echoBeat=false;
   this.echoStrikeHit=false;
   this.echoCue.setText(this.echoStomp?'STOMP • JUMP':'RIPPLE • JUMP OVER THE WAVE');
   v.zones.forEach((zone,i)=>zone.setPosition(190+i*285,502).setVisible(true));
   if(!this.reduced)v.mask.setAngle(this.echoStomp?-10:9).setScale(this.echoStomp?1.55:1.18);
   tone(this,this.echoStomp?115:560,.15);
   if(!this.echoStomp)this.echoChime=240;
  }else if(this.echoAttack==='warning'){
   this.echoAttack=this.echoStomp?'stomp':'ripple';
   this.echoCue.setText(this.echoStomp?'STOMP!':'ECHO WAVE!');
   this.echoTime=this.echoStomp?180:2300;
   v.zones.forEach(zone=>zone.setVisible(false));
   v.mask.setAngle(0).setScale(1.42);
   if(this.echoStomp){
    emit(this,845,492,0xd9a1ff,30);
    v.zones.forEach(zone=>zone.setVisible(true));
   }else this.echoWave.setPosition(860,493).setVisible(true);
   tone(this,this.echoStomp?92:850,.13);
  }else{
   this.echoAttack='rest';
   this.echoTime=practice?7200:4800;
   v.mask.setScale(1.23);
   this.echoWave.setVisible(false);
   v.zones.forEach(zone=>zone.setVisible(false));
   if(this.echoStep==='wait'){
    this.echoStep='lift';
    this.crate.setVisible(true);
    this.crate.body.enable=true;
    this.crate.body.reset(this.dataLevel.crate[0],290);
    this.goal.setVisible(true);
    setStatus('The impact knocked loose a lantern! Use Kairo’s bubble to float it into the gold bracket.');
   }
   this.echoCue.setText('OGRE OPEN · COUNTER NOW');
  }
 }
 drawDuelMeters(){
  const d=this.duel;
  this.duelMeter.clear();
  for(const [x,energy,color] of [[240,d.cash,0x6ceaa4],[510,d.ogre,0xc58cff]]){
   this.duelMeter.fillStyle(0x201a34).fillRect(x,78,210,15);
   this.duelMeter.fillStyle(color).fillRect(x+2,80,206*energy/100,11);
   this.duelMeter.lineStyle(2,0xffedbc).strokeRect(x,78,210,15);
  }
  this.duelReadout.setText('CASH '+d.cash+'% · '+d.cashLives+' lives     OGRE '+d.ogre+'% · '+d.ogreLives+' lives');
 }
 fireDuelCoin(shooter=this.player,hero=this.hero,release=false){
  const d=this.duel;
  const cooldown=shooter===this.player?'cooldown':'partnerCooldown';
  if(d[cooldown]>0)return;
  if(kind==='cash'&&!release){
   const facing=shooter===this.player?(this.facing||1):shooter.flipX?-1:1;
   this.queueCashAttack(shooter,hero,facing,'duel',()=>this.fireDuelCoin(shooter,hero,true));
   return;
  }
  d[cooldown]=shooter===this.player?190:310;
  const charged=!!d.charged&&(kind!=='cash'||d.chargeOwner===shooter);
  const powered=kind==='cash'&&this.showcase?.starPower;
  if(charged){
   d.charged=false;
   d.chargeOwner=null;
   this.duelGlow?.setVisible(false);
  }
  let coin;
  const facing=shooter.cashAttack?.facing??(shooter===this.player?(this.facing||1):shooter.flipX?-1:1);
  const motion=kind==='cash'?attackMotion(hero):{x:13,y:26};
  const x=shooter.x+facing*motion.x,y=shooter.y+motion.y;
  const star=kind==='cash'&&hero==='ninja';
  if(star)coin=this.makeNugsStar(x,y,charged||powered);
  else if(kind==='cash'){
   if(!d.coinPool)d.coinPool=Array.from({length:20},()=>this.obj(this.add.circle(0,0,9).setDepth(15).setVisible(false)));
   coin=d.coinPool.find(sprite=>!sprite.visible);
   if(!coin)return;
   coin.setPosition(x,y).setRadius(roster[hero].radius+(charged||powered?6:0)).setFillStyle(hero==='kairo'&&this.showcase?.starPower?0xbfff70:roster[hero].color).setVisible(true);
  }else coin=this.obj(this.add.circle(x,y,charged?15:9,charged?0xfff5ac:0xffd36e).setDepth(15));
  const angle=Math.atan2(this.ogre.y-26-coin.y,this.ogre.x-coin.x);
  d.coins.push({sprite:coin,vx:Math.cos(angle)*720,vy:Math.sin(angle)*720,charged,life:1500,spinning:star,disposable:star});
  this.events.emit('cash:coin-fired',{x,y,charged});
 }
 cashAttackOrigins(pattern){
  const left=this.showcase?this.showcase.width-W:0;
  const right=left+W;
  const x=clamp(this.player.x,left+55,right-55);
  if(pattern===6)return [-120,120].map(offset=>({x:clamp(x+offset,left+45,right-45),y:505,angle:-Math.PI/2}));
  if(pattern===7)return [-130,0,130].map(offset=>({x:clamp(x+offset,left+45,right-45),y:80,angle:Math.PI*.34}));
  if(pattern===3)return [-155,0,155].map(offset=>({x:clamp(x+offset,left+45,right-45),y:85,angle:Math.PI/2}));
  if(pattern===4)return [{x:left+25,y:469,angle:0},{x:right-25,y:391,angle:Math.PI}];
  return [];
 }
 updateDuel(dt){
  const d=this.duel;
  const elapsed=Math.min(dt,40);
  const seconds=elapsed/1000;
  if(kind==='cash'){
   d.motion=(d.motion||0)+seconds;
   if(!this.reduced)drawOgreVortex(d.vortex,d.motion,d.warning);
   const left=this.showcase?this.showcase.width-W:0;
   const cycle=d.motion%8;
   const lane=cycle<1.6?1:cycle<4?1-(cycle-1.6)/1.2:cycle<5.6?-1:-1+(cycle-5.6)/1.2;
   this.ogre.x=left+W/2+(W/2-112)*lane;
   this.ogre.y=415-Math.abs(Math.sin(d.motion*.65))*95;
   const delta=this.player.x-this.ogre.x;
   const facing=Math.abs(delta)<30?(d.facing??-1):Math.sign(delta);
   if(d.facing!==undefined&&facing!==d.facing&&!d.warning){
    d.pattern=chapterBossPattern(this.level,d.pattern,d.ogreLives);
    d.clock=Math.min(d.clock,330);
    this.echoCue.setText('OGRE TURNING · GET READY');
   }
   d.facing=facing;
   this.ogreArt?.setFlipX(d.facing<0);
  }
  d.cooldown-=elapsed;
  d.partnerCooldown=(d.partnerCooldown||0)-elapsed;
  if((kind==='cash'?movementIntent(buttons,this.keys,!!this.showcase?.partner).fire:(buttons.power||this.keys.J.isDown))&&(kind==='cash'||this.hero==='cash')&&d.cooldown<=0)this.fireDuelCoin();
  if(d.charged&&d.chargeOwner)this.duelGlow?.setPosition(d.chargeOwner.x,d.chargeOwner.y+26);
  d.grace-=elapsed;
  const previousClock=d.clock;
  const transition=kind==='cash'?advanceBossClock(d,elapsed,this.echoMode):
   ((d.clock-=elapsed)<=0?(d.warning?'fire':'windup'):null);
  if(!d.warning&&d.clock<900&&previousClock>=900)this.setOgrePose(0);
  if(transition){
   if(transition==='windup'){
    d.warning=true;
    this.setOgrePose([1,3,2,1,3,2,1,3,2][d.pattern]);
    this.echoCue.setText((kind==='cash'?'GUARDING · ':'')+['LOW BOLT · JUMP','TRIPLE SPREAD · FIND A GAP','TRACKING ORBS · DASH AFTER THE LOCK','SKY CRYSTALS · MOVE SIDEWAYS','CROSS FIRE · CHANGE HEIGHT','CRESCENT · WATCH THE RETURN','RISING SPARKS · MOVE SIDEWAYS','DIAGONAL RAIN · FIND A GAP','NOVA · DASH THROUGH A GAP'][d.pattern]);
    if(kind==='cash'){
     d.origins=this.cashAttackOrigins(d.pattern);
     d.markers=d.origins.map(origin=>this.obj(this.add.circle(origin.x,origin.y,24,0x783eb4,.36)
      .setStrokeStyle(4,0xffdd87).setDepth(14)));
    }
    if(!this.reduced)this.ogre.setAngle(-7);
    tone(this,230,.18);
    if(kind!=='cash')d.clock=({practice:1250,adventurer:1000,challenge:750})[this.echoMode];
   }else{
    d.warning=false;
    this.setOgrePose(2);
    const facing=kind==='cash'?d.facing:-1;
    const x=this.ogre.x+facing*(kind==='cash'?Math.min(65,Math.abs(this.player.x-this.ogre.x)/2):75),y=this.ogre.y-26;
    const aim=Math.atan2(this.player.y-y,this.player.x-x);
    const forward=facing<0?Math.PI:0;
    const vectors=d.pattern===0?[forward]:d.pattern===1?[forward-.27,forward,forward+.27]:d.pattern===5?[forward]:d.pattern===8?Array.from({length:7},(_,i)=>aim+(i-3)*.34):[aim-.13,aim+.13];
    const origins=d.origins?.length?d.origins:vectors.map(angle=>({x,y,angle}));
    for(const marker of d.markers||[])marker.destroy();
    d.markers=[];d.origins=[];
    for(const origin of origins){
     const {angle}=origin;
     const low=d.pattern===0;
     const orb=kind==='cash'
      ?this.obj(this.add.image(origin.x,low?474:origin.y,'ogre-weapon-'+d.pattern).setDisplaySize(low?61:49,low?61:49).setDepth(14))
      :this.obj(this.add.circle(origin.x,low?474:origin.y,low?16:12,0xd697ff).setStrokeStyle(3,0xffe2ff).setDepth(14));
     if(kind==='cash')this.cashShockwave(orb.x,orb.y,0xd697ff,64);
     const speed=(kind==='cash'?{practice:290,adventurer:365,challenge:430}:{practice:270,adventurer:310,challenge:350})[this.echoMode];
     d.shots.push({sprite:orb,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,homing:d.pattern===2,pattern:d.pattern,trailClock:0});
    }
    if(kind==='cash'){
     d.pattern=chapterBossPattern(this.level,d.pattern,d.ogreLives);
    }else{
     d.pattern=d.ogreLives===2?(d.pattern+1)%2:(d.pattern+1)%3;
     d.clock=this.echoMode==='practice'?2000:1250;
    }
    this.ogre.setAngle(0);
    this.echoCue.setText(kind==='cash'?'GUARD OPEN · FIRE':'COIN DUEL');
    tone(this,150,.15);
   }
  }
  const advance=shot=>{
   const o=shot.sprite;
   if(shot.homing){
    if((shot.age||0)<850){
    const angle=Math.atan2(this.player.y-o.y,this.player.x-o.x);
    const speed=kind==='cash'?({practice:260,adventurer:345,challenge:400})[this.echoMode]:this.echoMode==='practice'?245:320;
    shot.vx+= (Math.cos(angle)*speed-shot.vx)*seconds*1.35;
    shot.vy+= (Math.sin(angle)*speed-shot.vy)*seconds*1.35;
    }else if(kind==='cash')o.setTint(0xffdf70);else o.setStrokeStyle(3,0xffdf70);
    shot.age=(shot.age||0)+elapsed;
    if(shot.age>3000)return false;
   }
   if(shot.pattern===5){
    shot.age=(shot.age||0)+elapsed;
    if(shot.age>=620&&!shot.returning){shot.vx*=-1;shot.returning=true;}
    if(shot.age>1550)return false;
   }
   o.x+=shot.vx*seconds;o.y+=shot.vy*seconds;
   return o.x>-30&&o.x<(this.showcase?.width||W)+30&&o.y>-30&&o.y<H+30;
  };
  d.coins=d.coins.filter(shot=>{
   const o=shot.sprite;
   if(shot.spinning)o.angle+=elapsed*.95;
   shot.life-=elapsed;
   if(shot.life<=0){if(kind==='cash'&&!shot.disposable)o.setVisible(false);else o.destroy();return false;}
   if(kind==='cash'){
    const angle=Math.atan2(this.ogre.y-26-o.y,this.ogre.x-o.x);
    shot.vx=Math.cos(angle)*720;shot.vy=Math.sin(angle)*720;
   }
   if(advance(shot)&&Math.hypot(o.x-this.ogre.x,o.y-(this.ogre.y-26))>=58)return true;
   if(Math.hypot(o.x-this.ogre.x,o.y-(this.ogre.y-26))<58&&d.ogreLives>0){
    if(kind==='cash'){
     const hit=bossHit(d.ogreDamage||0,d.warning,shot.charged,shot.superDash,d.hitsPerLife);
     if(hit.blocked){
      emit(this,o.x,o.y,0xc198ff,3);
      if(!d.lastGuardCue||this.time.now-d.lastGuardCue>400){
       d.lastGuardCue=this.time.now;
       tone(this,225,.085,.035,'triangle');
      }
      if(shot.disposable)o.destroy();else o.setVisible(false);return false;
     }
     // A shared impact interval prevents two held fire keys from doubling chip damage.
     if(this.showcase?.partner&&!shot.charged&&!shot.superDash){
      if(this.time.now<(d.nextRegularImpact??0)){
       if(shot.disposable)o.destroy();else o.setVisible(false);
       return false;
      }
      d.nextRegularImpact=this.time.now+({practice:260,adventurer:320,challenge:360})[this.echoMode];
     }
     if(shot.superDash&&!d.warning){
      d.clock=Math.max(d.clock,850);
      this.echoCue.setText('OGRE STAGGERED · FIRE');
      emit(this,o.x,o.y,0xffdf8a,30);
      this.cashShockwave(o.x,o.y,0xffd36e,104);
     }
     d.ogreDamage=hit.damage;
     d.ogre=hit.energy;
     if(hit.energy>0&&this.ogreArt&&!this.reduced){
      const art=this.ogreArt;
      this.tweens.killTweensOf(art);
      art.setAngle((d.facing||1)*(shot.charged?12:5));
      this.tweens.add({targets:art,angle:0,duration:shot.charged?190:100,ease:'Sine.easeOut'});
     }
    }else d.ogre=Math.max(0,d.ogre-(shot.charged?38:12));
    if(shot.charged&&!this.reduced)this.cameras.main.shake(140,.005);
    if(d.ogre===0){
     d.ogreLives--;
     if(d.ogreLives){
      d.ogreDamage=kind==='cash'?Math.max(0,d.ogreDamage-OGRE_HITS_PER_LIFE):0;
      d.ogre=100-d.ogreDamage*2;
      d.pattern=kind==='cash'?chapterBossPattern(this.level,-1,1):2;d.warning=false;d.clock=850;
      this.setOgrePose(3);
      this.echoCue.setText(kind==='cash'?'SECOND LIFE · NEW WEAPON':'SECOND LIFE · TRACKING ORBS');
      setStatus(kind==='cash'?'New attack incoming. Read the warning.':'The Ogre’s tracking orbs turn gold when they lock. Dash past one to charge your next coin.');
     }
    }
    this.events.emit('coin:target-hit',{x:o.x,y:o.y});this.drawDuelMeters();
   }
   if(kind==='cash'&&!shot.disposable)o.setVisible(false);else o.destroy();return false;
  });
  if(!d.ogreLives){
   for(const marker of d.markers||[])marker.destroy();
   for(const shot of d.shots)shot.sprite.destroy();
   for(const shot of d.coins){if(kind==='cash'&&!shot.disposable)shot.sprite.setVisible(false);else shot.sprite.destroy();}
   d.shots=[];d.coins=[];
   this.setOgrePose(3);
   if(kind==='cash'){
    cashCue(this,'victory');
    this.echoStep='won';
    this.ogre.setAngle(-24).setScale(.72);
    if(!this.reduced)this.tweens.add({targets:[d.vortex.back,d.vortex.front],alpha:.25,scaleX:1.35,scaleY:.28,duration:360,ease:'Cubic.Out'});
    this.ogreArt?.setTint(0x845dab);
    const x=this.ogre.x,y=this.ogre.y-36;
    const ring=this.obj(this.add.circle(x,y,85,0xa465ff,.26).setStrokeStyle(5,0xe4c0ff).setDepth(25));
    if(!this.reduced){
     ring.setScale(.3);
     this.tweens.add({targets:ring,scale:2.8,alpha:0,duration:870,onComplete:()=>ring.destroy()});
     emit(this,x,y,0xca83ff,48);
    }
    this.echoCue.setText('OGRE DEFEATED');
    cashCue(this,'impact');
    this.victory();
    if(this.echoMode==='challenge'&&!this.echoHits){
     this.score+=100;this.updateHUD();
     this.label('CLEAN DODGES +100',480,330,22).setDepth(55);
    }
    return;
   }
   this.addSparkle('courage');this.echoStep='scan';this.echoLight.setAlpha(.14);
   this.echoCue.setText('THE OGRE SLOWS DOWN');
   setStatus('Switch to Nugs. Scan for pawprints.');
   return;
  }
  d.shots=d.shots.filter(shot=>{
   const o=shot.sprite;
   if(!advance(shot)){o.destroy();return false;}
   if(kind==='cash'&&!this.reduced){
    o.angle+=elapsed*(shot.pattern===3?.12:.28);
    shot.trailClock+=elapsed;
    if(shot.trailClock>=90){
     shot.trailClock=0;
     emit(this,o.x,o.y,[0xff95cf,0xc29bff,0xffd777,0x9beaff,0xffa681,0xff92a1,0xffef8f,0x8affcc,0xc9a5ff][shot.pattern],2);
    }
   }
   const dodger=[this.player,this.showcase?.partner].find(hero=>hero&&this.cashHeroDashing(hero)&&Math.hypot(o.x-hero.x,o.y-hero.y)<43);
   if(dodger){
    if(!d.charged){
     d.charged=true;
     d.chargeOwner=dodger;
     this.duelGlow?.setPosition(dodger.x,dodger.y+26).setVisible(true);
     emit(this,dodger.x,dodger.y+24,0xffdf70,12);
     tone(this,1046,.13);
     setStatus((dodger===this.player?'Player 1':'Player 2')+' earned a charged countershot!');
    }
    o.destroy();return false;
   }
   const hitHero=[this.player,this.showcase?.partner].find(hero=>hero&&Math.abs(o.x-hero.x)<29&&Math.abs(o.y-hero.y)<34);
   if(d.grace<=0&&hitHero){
    if(this.showcase)this.resetCashStreak(hitHero);
    d.grace=800;
    d.cash=Math.max(0,d.cash-((kind==='cash'?{practice:25,adventurer:34,challenge:50}:{practice:25,adventurer:30,challenge:34})[this.echoMode]));
    this.echoHits++;
    if(!d.cash&&--d.cashLives>0)d.cash=100;
    if(this.showcase)this.updateShowcaseHud();
    this.drawDuelMeters();
    emit(this,o.x,o.y,0xd697ff,12);tone(this,180,.16);
    o.destroy();return false;
   }
   return true;
  });
  if(!d.cashLives){
   for(const marker of d.markers||[])marker.destroy();
   for(const shot of d.shots)shot.sprite.destroy();
   for(const shot of d.coins){if(kind==='cash'&&!shot.disposable)shot.sprite.setVisible(false);else shot.sprite.destroy();}
   d.shots=[];d.coins=[];
   if(this.showcase){d.coinPool?.forEach(coin=>coin.destroy());this.showCashGameOver();return;}
   this.echoStep='retry';this.echoCue.setText('PRESS POWER TO RETRY');
   setStatus('Cash is out of lives. Press POWER or Restart to try this phase again.');
  }
 }
 echoHit(){
  if(this.echoStrikeHit)return;
  this.echoStrikeHit=true;
  this.echoHits++;
  this.score=Math.max(0,this.score-10);
  this.updateHUD();
  emit(this,this.player.x,this.player.y,0xd9a1ff,12);
 }
 updateSparkleHUD(){
  for(const [name,value] of Object.entries(this.sparkle||{})){
   const meter=$('sparkle-'+name);
   if(meter)meter.value=value;
  }
 }
 addSparkle(name){
  this.sparkle[name]=Math.min(100,this.sparkle[name]+25);
  this.updateSparkleHUD();
 }
 showBreathe(visible){
  const button=$('breathe');
  if(button)button.hidden=!visible;
  buttons.breathe=false;
 }
 startStop(){
  this.echoStep='stop';
  this.player.body.setVelocity(0);
  this.echoCue.setText('STOP · LOOK AT THE LANTERN');
  $('echo-method').hidden=false;
  this.updateMethodButtons('stop');
  setStatus('Stop. Notice the lantern and pawprints.');
 }
 updateMethodButtons(step){
  for(const button of $('echo-method').querySelectorAll('button')){
   button.hidden=button.dataset.step!==step;
  }
 }
 methodAction(action){
  if(this.echoStep==='stop'&&action==='stop'){
   this.echoStep='choose';
   this.updateMethodButtons('choose');
   this.echoCue.setText('CHOOSE HOW TO HELP');
   setStatus('Both choices help.');
  }else if(this.echoStep==='choose'&&(action==='light'||action==='trail')){
   this.echoChoice=action;
   this.echoStep='repair';
   this.updateMethodButtons('repair');
   this.echoCue.setText('REPAIR');
   const repair=$('echo-repair');
   repair.textContent=action==='light'?'Steady the lantern':'Restore the trail';
   setStatus(action==='light'?'Steady the lantern.':'Restore the pawprint trail.');
  }else if(this.echoStep==='repair'&&action==='repair'){
   if(this.echoChoice==='light'){
    this.echoLight.setAlpha(.23);
    this.goal.setFillStyle(0xffdc86,.65);
   }else{
    this.echoSwitch.setFillStyle(0x91e5be,1);
    for(const x of [610,640,670,700])this.label('✦',x,505,15).setDepth(12);
   }
   this.addSparkle('repair');
   $('echo-method').hidden=true;
   this.startBreathe();
  }
 }
 startBreathe(){
  showMethodCallout('Breathe');
  this.echoStep='breathe';
  this.breath=0;
  this.setOgrePose(1);
  this.ogre.setAngle(this.reduced?0:-7).setScale(1.52);
  this.echoCue.setText('ECHO CHARGING · HOLD BREATHE');
  this.showBreathe(true);
  this.addSparkle('kindness');
  setStatus('Hold Breathe or B. Fill the ring.');
 }
 updateBreathe(dt){
  const held=buttons.breathe||this.keys.B.isDown;
  this.breath=Math.min(1,this.breath+(held?Math.min(dt,50)/2200:0));
  const ring=this.breathRing;
  ring.clear().lineStyle(7,0x24384b).strokeCircle(480,205,44);
  ring.lineStyle(7,0xb7f5dc).beginPath();
  ring.arc(480,205,44,-Math.PI/2,-Math.PI/2+Math.PI*2*this.breath).strokePath();
  if(this.breath<1)return;
  this.showBreathe(false);
  ring.clear();
  this.addSparkle('calm');
  this.finishEcho();
 }
 echoScan(){
  showMethodCallout('Notice');
  if(this.echoStep!=='scan'){
   setStatus('Nugs can find the hidden switch once Cash wins the duel.');
   return;
  }
  this.echoSwitch.setVisible(true);
  this.label('PAWPRINT SWITCH',730,426,15).setDepth(15);
  for(const x of [610,640,670,700])this.label('🐾',x,491,15).setDepth(12);
  this.echoStep='switch';
  tone(this,740);
  setStatus('Follow the pawprints to the switch with Ninja Nugs.');
 }
 finishEcho(){
  this.echoStep='guardian';
  this.echoWave.setVisible(false);
  if(!this.reduced)this.tweens.add({targets:this.echoLight,alpha:.28,duration:500});
  else this.echoLight.setAlpha(.28);
  tone(this,660,.2);
  emit(this,845,415,0xffd47b,32);
  this.echoCue.setText('THE GUARDIAN AWAKENS');
  this.setOgrePose(0);
  this.ogre.setAngle(0).setScale(1.1);
  this.victory();
  this.villain.label.setText('GUARDIAN');
  const flawless=this.echoMode==='challenge'&&this.echoHits===0;
  if(flawless){
   this.score+=50;this.updateHUD();
   this.label('✨ FLAWLESS RESCUE +50',480,322,24).setDepth(55);
  }
  setStatus((flawless?'Flawless rescue! ':'The Echo Ogre is calm. ')+
   (this.level===2?'Press POWER to replay.':'Press POWER for the next phase.'));
 }
 setupShowcase(resumeCheckpoint){
  $('cash-boss-shortcut').hidden=this.cashChallenge!=null;
  this.echoMode=$('echo-mode')?.value||'practice';
  const map=this.make.tilemap({key:this.level?'cash-chapter-'+this.level:'cash-showcase'});
  const tiles=map.addTilesetImage('Terrain','cash-terrain');
  const layer=this.obj(map.createLayer('Terrain',tiles,0,0));
  layer.setCollision(1);
  layer.forEachTile(tile=>{tile.tint=[0xffe2b0,0xa4f0ce,0xc9b7ff,0xe8bbff][this.level];});
  this.levelColliders.push(this.physics.add.collider(this.player,layer));
  const width=map.widthInPixels;
  this.physics.world.setBounds(0,0,width,H+90);
  this.cameras.main.setBounds(0,0,width,H).setDeadzone(220,100).startFollow(this.player,true,.12,.12);
  const markers=map.getObjectLayer('Markers').objects;
  const starKey='sparkle-play-lab:cash-stars'+(this.level?':'+this.level:'');
  let saved=0;
  try{saved=Number(localStorage.getItem(starKey))&7;}catch{}
  this.showcase={width,terrain:layer,boss:markers.find(o=>o.name==='boss'),hearts:3,checkpoint:95,starKey,saved,
   flags:markers.filter(o=>o.name==='checkpoint').map(o=>({x:o.x,mark:this.label('⚑ CHECKPOINT',o.x,452,15)})),
   stars:markers.filter(o=>o.name==='star').map((o,i)=>this.obj(this.add.image(o.x,o.y,'sun-cuff').setDisplaySize(50,42).setDepth(10)))};
  this.showcase.exitX=width-700;
  if(this.cashChallenge!=null){
   const finish=[3820,3160,3540][this.cashChallenge];
   this.showcase.challengeFinish=finish;
   this.showcase.challengeElapsedMs=0;
   this.label('🏁',finish,397,36).setDepth(10);
  }
  const districtNames=[
   ['Maplewood Rooftops','Sunbeam Lane','Community Gardens','Echo’s Overlook'],
   ['Floating Garden','Bloom Isles','Canopy Crossing','Skygate'],
   ['Night Foundry','Ember Walk','Lantern Works','The Echo Furnace'],
   ['Echo Factory','Prism Conveyor','Resonance Core']
  ][this.level];
  this.label(CASH_CHALLENGES[this.cashChallenge]??districtNames[0],265,245,27).setDepth(5).setBackgroundColor('#211a32').setPadding(9,5);
  if(this.textures.exists('maplewood-houses')){
   const factor=this.reduced?0:.58;
   const panelWidth=Math.ceil(560*H/233);
   const panels=Math.ceil((W+(width-W)*factor)/panelWidth)+1;
   this.showcase.scenery=[];
   for(let index=0;index<panels;index++){
    const panel=this.obj(this.add.image(panelWidth*index,0,this.level===1?'cash-garden':'maplewood-houses').setOrigin(0)
     .setDisplaySize(panelWidth,H).setTint([0xffffff,0xc7ffe4,0xa9a7df,0xabd5ee][this.level]).setFlipX(index%2===1).setDepth(-8).setScrollFactor(factor,0));
    this.showcase.scenery.push({panel, width:panelWidth});
   }
  }
  this.showcaseHud=this.label('',480,25,19).setScrollFactor(0).setDepth(44).setBackgroundColor('#211a32').setPadding(6,3);
  this.echoStep='course';
  for(const name of ['rift-wing','kiln-runner']){
   if(this.textures.exists(name+'-poses'))continue;
   const sheet=document.createElement('canvas');
   sheet.width=384;sheet.height=72;
   sheet.getContext('2d').drawImage(this.textures.get(name).getSourceImage(),0,0);
   this.textures.addSpriteSheet(name+'-poses',sheet,{frameWidth:96,frameHeight:72});
  }
  this.showcase.hazards=markers.filter(o=>o.name==='scout').map(({x,y,type},index)=>{
   const variant=['rift-wing','kiln-runner'].includes(type)?type:'scout';
   const sprite=this.obj(this.add.image(x,y,variant==='scout'?'cash-scout':variant+'-poses',0).setDisplaySize(64,48).setDepth(7));
   return {x,y,sprite,type:variant,reload:1+(index%4)*.22};
  });
  this.showcase.courseTime=0;
  this.showcase.heroCleanMs=[0,0];
  this.showcase.cleanMs=0;
  this.showcase.bumpGrace=0;
  const springX=[530,1165,1358,1358][this.level];
  this.showcase.spring=this.obj(this.add.rectangle(springX,505,54,12,0xef8c62).setStrokeStyle(3,0xffedc0));
  this.label('↑',springX,470,14);
  this.obj(this.add.image(springX,498,'cash-launch').setDisplaySize(62,23).setDepth(7));
  this.showcase.extraSpring=this.obj(this.add.image(2790,498,'cash-launch').setDisplaySize(62,23).setDepth(7));
  this.label('↑  »',2760,440,17);
  for(const [x,y,w] of [[springX+88,401,110],[springX+285,365,96]]){
   this.box(x,y,w,13,0x537475).setVisible(false);
   roofArt(this,x,y,w,this.level);
  }
  this.label('★',springX+88,374,13);
  for(const roof of this.walls.slice(-2)){
   this.levelColliders.push(this.physics.add.collider(this.player,roof));
   if(this.showcase.partner)this.levelColliders.push(this.physics.add.collider(this.showcase.partner,roof));
  }
  if(this.level>0){
   const gap=this.level===1?1248:1440;
   this.label('↑  »',gap-72,420,16);
   this.obj(this.add.rectangle(gap+157,506,50,8,0x8af2b5));
  }
  this.showcase.speedStrip=this.obj(this.add.rectangle(1810,505,78,12,0x65d8d8).setStrokeStyle(3,0xffedc0));
  this.label('»',1810,470,14);
  this.showcase.portals=markers.filter(o=>o.name==='portal'||o.name==='checkpoint').sort((a,b)=>a.x-b.x).filter((o,i,all)=>!i||o.x-all[i-1].x>100).map(o=>{
   const rim=[0xffd596,0x9effdc,0xd5b3ff,0x8dfff1][this.level];
   const arch=this.obj(this.add.ellipse(o.x,o.y,78,112,0x553487,.44).setStrokeStyle(7,rim).setDepth(2));
   this.obj(this.add.ellipse(o.x,o.y,94,128,rim,.08).setStrokeStyle(2,rim,.55).setDepth(1));
   this.label('◎',o.x,o.y-70,16);
   return {x:o.x,arch,entered:false};
  });
  districtArt(this,layer,width,this.level,this.showcase.portals);
  this.showcase.district=0;
  this.showcase.districtNames=districtNames;
  this.showcase.starPower=false;
  this.showcase.powerStars=markers.filter(o=>o.name==='portal').map(o=>
   this.obj(this.add.image(o.x+210,457,'sun-cuff').setDisplaySize(50,42).setDepth(10)));
  this.showcase.bolts=[];
  this.showcase.scoutCoins=[];
  if($('cash-coop')?.checked){
   const choice=$('cash-partner')?.value;
   this.showcase.partnerHero=Object.hasOwn(roster,choice)?choice:'kairo';
   const key=makeHeroAtlas(this,this.showcase.partnerHero,this.showcase.partnerHero===this.hero);
   this.showcase.partnerAtlas=key;
   const scale=CASH_HERO_SCALE[this.showcase.partnerHero]??.88;
   const partner=this.obj(this.add.sprite(52,455,key).setScale(scale).setDepth(10));
   partner.setOrigin(.5,.5+39*(scale-.88)/(112*scale));
   partner.play(key+'-idle');
   this.physics.add.existing(partner);
   partner.body.setSize(30*.88/scale,42*.88/scale).setGravityY(750).setCollideWorldBounds(true);
   partner.body.setOffset(partner.body.offset.x,partner.displayOriginY+39-partner.body.sourceHeight);
   this.levelColliders.push(this.physics.add.collider(partner,layer));
   this.showcase.partner=partner;
   this.showcase.partnerDash={charge:100,remaining:0,recovery:0,direction:1};
  }
  this.showcase.springs=markers.filter(o=>o.name==='spring').map(o=>
   this.obj(this.add.image(o.x,o.y,'cash-launch').setDisplaySize(62,23).setDepth(7)));
  for(const pad of this.showcase.springs){
   const wall=this.box(pad.x+94,466,28,92,0x5b547e);
   this.levelColliders.push(this.physics.add.collider(this.player,wall));
   if(this.showcase.partner)this.levelColliders.push(this.physics.add.collider(this.showcase.partner,wall));
   for(let y=429;y<510;y+=27)this.obj(this.add.image(wall.x,y,'cash-terrain').setDisplaySize(29,28).setDepth(6));
   this.label('↑',pad.x,421,14);
  }
  const lamps=[[2110,3390],[1040,2110,3390],[2110,3390],[2110,3390]][this.level]
   .concat(markers.filter(o=>o.name==='lamp').map(o=>o.x));
  this.showcase.lamps=lamps.map(x=>this.obj(this.add.star(x,448,5,10,21,0xffc66d).setStrokeStyle(3,0xffffff)));
  this.showcase.lantern=this.showcase.lamps[0];
  for(const lamp of this.showcase.lamps)this.label('◈',lamp.x,410,15);
  this.label(this.level===2?'»  ◈':'◈ →',lamps[0]-70,415,16);
  const s=this.showcase;
  if(this.level===0){
   if(!s.partner&&this.hero==='cash'){
    s.ricochetShield=this.obj(this.add.ellipse(270,480,20,60,0x4076ab,.85)
     .setStrokeStyle(4,0xa3f8ff).setDepth(8));
    this.label('◈ ↷',270,430,18);
   }
   this.label('★ ↗',springX+36,411,24).setDepth(8);
   this.label('→',springX+40,481,24).setDepth(8);

  }
  if(this.cashChallenge===1&&!s.partner&&this.hero==='cash'){
   s.ricochetShield=this.obj(this.add.ellipse(270,452,20,60,0x4076ab,.85)
    .setStrokeStyle(4,0xa3f8ff).setDepth(8));
  }
  const rewards=markers.filter(marker=>marker.name==='medal');
  if(this.level===0)rewards.unshift({x:springX+285,y:329});
  s.medalKey='sparkle-play-lab:cash-medals:'+this.level;
  s.earnedMedals=0;
  try{
   s.earnedMedals=Number(localStorage.getItem(s.medalKey))&15;
   if(this.level===0&&localStorage.getItem('sparkle-play-lab:maplewood-medal')==='1')s.earnedMedals|=1;
  }catch{}
  s.medals=rewards.map(({x,y},index)=>{
   const earned=!!(s.earnedMedals&(1<<index));
   const marker=this.obj(this.add.image(x,y,'sun-cuff').setDisplaySize(34,31).setDepth(12).setVisible(!earned));
   const sign=this.label(earned?'✓':'★',x,y-34,14)
    .setBackgroundColor('#211a32').setPadding(5,3);
   return {marker,sign};
  });
  s.playerMeters=[this.player,s.partner].filter(Boolean).map(()=>
   this.obj(this.add.graphics().setScrollFactor(0).setDepth(46))
  );
  if(resumeCheckpoint&&this.cashChallenge==null){
   let district=0;
   try{district=Number(localStorage.getItem('sparkle-play-lab:cash-portal:'+this.level));}catch{}
   if(Number.isInteger(district)&&district>0&&district<=s.portals.length){
    s.district=district;
    for(const portal of s.portals.slice(0,district))portal.entered=true;
    this.arriveCashPortal(s,s.portals[district-1]);
    this.showCashDistrict(s);
   }
  }
  this.updateShowcaseHud();
 }
 arriveCashPortal(s,portal){
  let arrival=portal.x+65;
  while(arrival<portal.x+260&&!s.terrain.getTileAtWorldXY(arrival,527)?.collides)arrival+=32;
  s.checkpoint=arrival;
  this.player.body.reset(arrival,455);
  s.partner?.body.reset(arrival-45,455);
 }
 showCashDistrict(s){
  const key=this.level===1&&s.district!==2||this.level===0&&s.district===2?'cash-garden':'maplewood-houses';
  const colors=[[0xffffff,0xffe0ae,0xe4ffd1,0xd0bff7],[0xc7ffe4,0xcaffce,0xb7efe1,0x9cdccf],[0xa9a7df,0xbc9ee2,0xd5a2b8,0xf2baaa],[0xabd5ee,0x94a9d7,0xf0bfcc]];
  for(const {panel,width} of s.scenery||[])panel.setTexture(key).setDisplaySize(width,H).setTint(colors[this.level][s.district]);
  setStatus(s.districtNames[s.district]+' · Checkpoint '+s.district+' of '+s.portals.length+'. Progress saved.');
 }
 updateShowcaseHud(){
  const s=this.showcase;
  const count=(mask,bits)=>bits.filter(bit=>mask&bit).length;
  const course=this.echoStep==='course';
  this.showcaseHud.setText('♥ '+(this.echoStep==='duel'?this.duel.cashLives:s.hearts)
   +'   ★ '+count(s.saved,[1,2,4])+'/3'
   +(course?'   ◎ '+s.district+'/'+s.portals.length+'   ◈ '+count(s.earnedMedals,[1,2,4,8])+'/4':'')
   +(s.starPower?'   ✨':'')
   +(s.challengeFinish?'   ⏱ '+Math.floor(s.challengeElapsedMs/1000)+'s':''));
 }
 updateCashIndicators(s){
  const colors=[0x79e8ff,0xffabed];
  for(const [index,meter] of s.playerMeters.entries()){
   const hero=index?s.partner:this.player;
   const name=index?s.partnerHero:this.hero;
   const x=index?864:16,y=78,w=80;
   const dash=index?s.partnerDash.charge:this.charge;
   const charge=name==='cash'?s.cleanMs:s.heroCleanMs[index];
   const counter=this.echoStep==='duel'&&this.duel.chargeOwner===hero;
   meter.clear();
   meter.fillStyle(0x151e35,.9).fillRoundedRect(x,y,w,20,5);
   meter.fillStyle(colors[index]).fillRect(x+4,y+4,(w-8)*dash/100,4);
   meter.fillStyle(counter?0xffffff:0xffd36e)
    .fillRect(x+4,y+12,(w-8)*(counter?1:charge/LIGHTNING_CHARGE_MS),4);
  }
 }
 showCashPortalStamp(s){
  const saved=!!(s.earnedMedals&(1<<(s.district-1)));
  const badge=this.label('◎ '+s.district+'/'+s.portals.length+'    '+(saved?'★ ✓':'★ —'),W/2,170,32)
   .setScrollFactor(0).setDepth(60).setBackgroundColor('#18233c').setPadding(18,10);
  this.time.delayedCall(1500,()=>{if(badge.active)badge.destroy();});
  tone(this,784,.14,.07);

 }
 cashShockwave(x,y,color,radius){
  if(this.reduced)return;
  const ring=this.add.circle(x,y,radius,color,.12).setStrokeStyle(5,color).setDepth(19).setScale(.3);
  this.tweens.add({targets:ring,scale:1.45,alpha:0,duration:380,onComplete:()=>ring.destroy()});
 }
 showCashGameOver(){
  this.echoStep='retry';
  this.player.body.stop();
  this.showcase?.partner?.body.stop();
  this.player.body.setAllowGravity(false);
  this.dashTime=0;
  this.label('GAME OVER',480,205,54,'#ffe6a7').setScrollFactor(0).setDepth(65).setBackgroundColor('#201631').setPadding(14);
  const retryKey=this.showcase?.partner?'Enter':'J';
  this.label('Press COIN or '+retryKey+' to try again',480,284,23).setScrollFactor(0).setDepth(65).setBackgroundColor('#201631').setPadding(8);
  setStatus('GAME OVER. Press Coin or '+retryKey+' to retry.');
  cashCue(this,'defeat');
 }
 respawnShowcase(){
  const s=this.showcase;
  s.hearts=3;this.echoStep='course';
  this.player.body.reset(s.checkpoint,455);
  this.ogre?.setVisible(false);
  this.duelMeter?.setVisible(false);
  this.duelReadout?.setVisible(false);
  this.echoCue?.setVisible(false);
  this.updateShowcaseHud();
  setStatus('Back at the checkpoint. Try again!');
 }
 trapCashScout(s,scout,powered,owner){
  if(powered){
   scout.sprite.setVisible(false);
   scout.trap?.destroy();scout.trap=null;
   this.cashShockwave(scout.sprite.x,scout.sprite.y,0xbfff70,104);
   emit(this,scout.sprite.x,scout.sprite.y,0xbfff70,24);
   tone(this,240,.21,.065,'triangle');
   return;
  }
  scout.trapOwner=owner;
  scout.trapUntil=s.courseTime+(powered?6:3.5);
  scout.reload=1;
  if(!scout.trap)scout.trap=this.obj(this.add.ellipse(scout.sprite.x,scout.sprite.y,75,63,0x80fff2,.22)
   .setStrokeStyle(4,0xc0fff7).setDepth(12));
  scout.sprite.setTint(0xb6fff1);
  if(scout.type!=='scout')scout.sprite.setFrame(3);
  tone(this,880,.14,.05);
 }
 aimCashRicochet(s,shot,excluded){
  let nearest=null;
  let range=440;
  for(const scout of s.hazards){
   if(!scout.sprite.visible||scout===excluded)continue;
   const distance=Math.hypot(shot.sprite.x-scout.sprite.x,shot.sprite.y-scout.sprite.y);
   if(distance<range){nearest=scout;range=distance;}
  }
  if(!nearest)return false;
  shot.chainTarget=nearest;
  shot.ricochet=true;
  shot.life=.65;
  shot.sprite.setFillStyle(0xfff2a0);
  const trail=this.obj(this.add.graphics().setDepth(14));
  const x=shot.sprite.x,y=shot.sprite.y;
  const end=nearest.sprite;
  const bendY=Math.min(y,end.y)-22;
  for(const [width,color,alpha] of [[8,0x176176,.65],[3,0xffe68a,.92]]){
   trail.lineStyle(width,color,alpha);
   trail.beginPath();
   trail.moveTo(x,y);
   trail.lineTo((x+end.x)/2,bendY);
   trail.lineTo(end.x,end.y);
   trail.strokePath();
  }
  this.time.delayedCall(this.reduced?180:250,()=>{if(trail.active)trail.destroy();});
  return true;
 }
 cashComboFeedback(x,y){
  this.cashShockwave(x,y,0x9ff8ff,72);
  const crest=this.obj(this.add.star(x,y,4,8,25,0xffd875)
   .setStrokeStyle(2,0xfff6d4).setDepth(22));
  this.tweens.add({targets:crest,alpha:0,scale:this.reduced?1:1.4,duration:240,
   onComplete:()=>{if(crest.active)crest.destroy();}});
  emit(this,x,y,0xffde78,18);
  tone(this,660,.12,.065,'triangle');
  tone(this,990,.2,.055,'sine');
 }
 makeScoutBolt(x,y,bearing,type){
  const key='scout-bolt-'+type;
  if(!this.textures.exists(key)){
   const art=this.add.graphics();
   const paletteByType={scout:[0x492a68,0xf186c7], 'rift-wing':[0x205771,0x8cf4ff], 'kiln-runner':[0x6a302a,0xffae6e]};
   const [shadow,light]=paletteByType[type]??paletteByType.scout;
   art.fillStyle(shadow,.42).fillEllipse(20,12,38,22);
   art.fillStyle(shadow,1).fillEllipse(22,12,28,16);
   art.fillStyle(light,1).fillEllipse(24,12,22,10);
   art.fillStyle(0xfff3cf,1).fillEllipse(27,11,10,4);
   art.generateTexture(key,40,24);
   art.destroy();
  }
  return this.obj(this.add.image(x,y,key).setRotation(bearing).setDepth(13));
 }
 updateScoutTell(scout,visible){
  if(visible&&!scout.tell){
   scout.tell=this.obj(this.add.graphics().setDepth(32));
   const tell=scout.tell;
   tell.fillStyle(0x24192e,1).fillTriangle(-11,5,11,5,0,-13);
   tell.lineStyle(2,0xffd36e,1).strokeTriangle(-11,5,11,5,0,-13);
   tell.fillStyle(0xfff3cf,1).fillRect(-1,-6,2,5).fillRect(-1,1,2,2);
  }
  scout.tell?.setPosition(scout.sprite.x,scout.sprite.y-31).setVisible(visible);
 }
 cashCourseCombat(s,dt){
  const seconds=Math.min(dt,40)/1000;
  const cameraLeft=this.cameras.main.scrollX;
  const warningSeconds=({practice:.62,adventurer:.48,challenge:.37})[this.echoMode]??.48;
  for(const scout of s.hazards){
   const {sprite}=scout;
   if(scout.trapUntil>s.courseTime){scout.warningAt=null;this.updateScoutTell(scout,false);continue;}
   if(scout.trap){scout.trap.destroy();scout.trap=null;}
   const target=[this.player,s.partner].filter(Boolean).reduce((nearest,hero)=>
    Math.abs(hero.x-sprite.x)<Math.abs(nearest.x-sprite.x)?hero:nearest);
   if(!sprite.visible||sprite.x<cameraLeft+24||sprite.x>cameraLeft+W-24||Math.abs(sprite.x-target.x)>370){
    scout.warningAt=null;
    this.updateScoutTell(scout,false);
    continue;
   }
   scout.reload-=seconds;
   const warning=scout.warningAt!=null;
   this.updateScoutTell(scout,warning);
   sprite.setTint(warning?0xffd5a1:0xffffff);
   if(scout.type!=='scout')sprite.setFrame(warning?1:0);
   if(!warning){
    if(scout.reload>0||s.courseTime<(s.nextScoutWarning??0))continue;
    scout.warningAt=s.courseTime+warningSeconds;
    this.updateScoutTell(scout,true);
    s.nextScoutWarning=s.courseTime+warningSeconds+.12;
    this.cashShockwave(sprite.x,sprite.y,0xffcf80,26);
    tone(this,550,.08,.03);
    continue;
   }
   if(s.courseTime<scout.warningAt)continue;
   scout.warningAt=null;
   this.updateScoutTell(scout,false);
   scout.reload=scout.type==='kiln-runner'?1.9:2.4;
   const {x,y}=sprite;
   const angle=scout.type==='kiln-runner'?(target.x<x?Math.PI:0):Math.atan2(target.y-y,target.x-x);
   const angles=scout.type==='rift-wing'?[angle-.2,angle+.2]:[angle];
   for(const bearing of angles){
   const bolt=this.makeScoutBolt(x,y,bearing,scout.type);
   const speed=scout.type==='kiln-runner'?375:285;
   s.bolts.push({sprite:bolt,vx:speed*Math.cos(bearing),vy:speed*Math.sin(bearing),life:1.7});
   }
   tone(this,360,.14,.06,'triangle');
   this.cashShockwave(x,y,0xd697ff,30);
  }
  for(const [group,friendly] of [[s.bolts,false],[s.scoutCoins,true]]){
   for(let index=group.length-1;index>=0;index--){
    const shot=group[index],sprite=shot.sprite;
    if(shot.spinning)sprite.angle+=seconds*950;
    if(shot.chainTarget?.sprite.visible){
     const angle=Math.atan2(shot.chainTarget.sprite.y-sprite.y,shot.chainTarget.sprite.x-sprite.x);
     shot.vx=Math.cos(angle)*shot.speed;
     shot.vy=Math.sin(angle)*shot.speed;
    }
    sprite.x+=shot.vx*seconds;sprite.y+=shot.vy*seconds;shot.life-=seconds;
    shot.art?.setPosition(sprite.x,sprite.y).setRotation(Math.atan2(shot.vy,shot.vx));
    const shield=s.ricochetShield;
    if(friendly&&shot.hero==='cash'&&!shot.chainTarget&&shield&&Math.abs(sprite.x-shield.x)<17
      &&Math.abs(sprite.y-shield.y)<32&&this.aimCashRicochet(s,shot)){
     this.cashComboFeedback(shield.x,shield.y);
     continue;
    }
    const target=friendly?s.hazards.find(scout=>scout.sprite.visible&&(!shot.chainTarget||shot.chainTarget===scout)&&!shot.hit?.has(scout)&&Math.hypot(sprite.x-scout.sprite.x,sprite.y-scout.sprite.y)<(shot.powered?44:29)):
     [this.player,s.partner].find(hero=>hero&&Math.hypot(sprite.x-hero.x,sprite.y-hero.y)<29);
    if(!target&&shot.life>0)continue;
    if(!friendly&&shot.life<=0){sprite.destroy();group.splice(index,1);continue;}
    if(friendly&&target){
     const duo=shot.hero==='cash'&&target.trapUntil>s.courseTime&&target.trapOwner&&target.trapOwner!==shot.owner;
     if(shot.bubble)this.trapCashScout(s,target,shot.powered,shot.owner);
     else{target.sprite.setVisible(false);this.updateScoutTell(target,false);if(target.trap){target.trap.destroy();target.trap=null;}}
     this.events.emit('coin:target-hit',{x:sprite.x,y:sprite.y});
     if(this.cashChallenge===1&&shot.ricochet&&!s.trickShotEarned){
      s.trickShotEarned=true;
      this.cashComboFeedback(sprite.x,sprite.y);
      const star=this.label('★',sprite.x,sprite.y-38,33).setDepth(24);
      this.time.delayedCall(850,()=>{if(star.active)star.destroy();});
     }
     if(duo){
      this.cashComboFeedback(sprite.x,sprite.y);
      if(this.aimCashRicochet(s,shot,target))continue;
     }
     if(shot.powered)this.cashShockwave(sprite.x,sprite.y,0xffd36e,85);
    }else if(target&&!s.bumpGrace&&!this.cashHeroDashing(target)){
     const lostPower=s.starPower;
     s.starPower=false;
     if(lostPower)setStatus('Star power lost. Find another gold star.');
     s.bumpGrace=1100;
     tone(this,155,.19,.07,'triangle');
     this.cashShockwave(sprite.x,sprite.y,0xff91df,42);
     this.resetCashStreak(target);
     if(--s.hearts<=0)this.showCashGameOver();
     else{target.body.setVelocityY(-160);this.updateShowcaseHud();}
    }
    if(friendly&&target&&shot.chainHits>1){
     shot.chainHits--;
     let next=null,best=420;
     for(const scout of s.hazards){
      if(!scout.sprite.visible)continue;
      const distance=Math.hypot(sprite.x-scout.sprite.x,sprite.y-scout.sprite.y);
      if(distance<best){best=distance;next=scout;}
     }
     if(next){shot.chainTarget=next;shot.life=.65;continue;}
    }
    if(friendly&&target&&shot.pierce&&shot.life>0){shot.hit.add(target);continue;}
    sprite.destroy();group.splice(index,1);
    if(this.echoStep==='retry')return;
   }
  }
 }
 nugsJumpFeedback(hero){
  this.cashShockwave(hero.x,hero.y+18,0xb8ff8e,24);
  tone(this,660,.07);
 }
 makeNugsStar(x,y,powered){
  const radius=powered?17:12;
  const star=this.obj(this.add.star(x,y,4,radius*.38,radius,powered?0xe8ff89:0xcddee7));
  return star.setStrokeStyle(2,powered?0xffffff:0x465772).setDepth(15);
 }
 queueCashAttack(shooter,hero,facing,phase,release){
  if(shooter.cashAttack||this.completed)return;
  const motion=attackMotion(hero);
  const attack={motion,facing,start:this.time.now};
  shooter.cashAttack=attack;
  this.time.delayedCall(motion.windup,()=>{
   if(shooter.active&&shooter.cashAttack===attack&&this.echoStep===phase&&!this.completed)release();
  });
  this.time.delayedCall(motion.windup+motion.hold+motion.recovery,()=>{
   if(shooter.cashAttack===attack)shooter.cashAttack=null;
  });
 }
 showCashAttack(shooter,sprite){
  const attack=shooter.cashAttack;
  if(!attack||this.reduced)return false;
  const frame=attackFrame(this.time.now-attack.start,attack.motion);
  sprite.anims.stop();
  sprite.setFrame(frame*7+5);
  if(shooter===this.player)shooter.setScale(attack.facing,1);
  else sprite.setFlipX(attack.facing<0);
  return true;
 }
 fireScoutShot(shooter,hero,facing,release=false){
  if(this.showcase.scoutCoins.length>=12)return;
  if(!release){
   this.queueCashAttack(shooter,hero,facing,'course',()=>this.fireScoutShot(shooter,hero,facing,true));
   return;
  }
  const motion=attackMotion(hero);
  const x=shooter.x+facing*motion.x,y=shooter.y+motion.y;
  const scout=this.showcase.hazards.find(h=>h.sprite.visible&&(h.sprite.x-x)*facing>0&&Math.abs(h.sprite.x-x)<410);
  const angle=scout?Math.atan2(scout.sprite.y-y,scout.sprite.x-x):facing<0?Math.PI:0;
  const powered=this.showcase.starPower;
  const weapon=roster[hero];
  const speed=weapon.speed+(powered?140:0);
  const spinning=hero==='ninja';
  const sprite=spinning?this.makeNugsStar(x,y,powered):this.obj(this.add.circle(x,y,weapon.radius+(powered?8:0),powered&&hero==='kairo'?0xbfff70:weapon.color).setStrokeStyle(2,0xfff4da).setDepth(15));
  const art=weaponArt(this,x,y,hero,powered);
  if(art)sprite.once('destroy',()=>art.destroy());
  this.showcase.scoutCoins.push({sprite,art,vx:speed*Math.cos(angle),vy:speed*Math.sin(angle),life:powered?1:.85,powered,hero,owner:shooter,bubble:hero==='kairo',spinning,speed,chainHits:spinning&&powered?3:1});
  this.events.emit('cash:coin-fired',{x,y,charged:powered});
 }
 cashHeroDashing(hero){
  return (hero===this.player?this.dashTime:this.showcase?.partnerDash?.remaining)>0;
 }
 resetCashStreak(hero){
  this.showcase.cleanMs=0;
  this.showcase.heroCleanMs[hero===this.player?0:1]=0;
 }
 cashDashPower(shooter,hero,direction){
  const s=this.showcase;
  if(!s)return;
  const lightning=hero==='cash'&&s.cleanMs>=LIGHTNING_CHARGE_MS;
  if(hero==='cash'&&!lightning)return;
  const water=hero==='kairo';
  const playerIndex=shooter===this.player?0:1;
  const tsunami=water&&s.heroCleanMs[playerIndex]>=LIGHTNING_CHARGE_MS;
  const smoke=hero==='ninja'&&s.heroCleanMs[playerIndex]>=LIGHTNING_CHARGE_MS;
  const superDash=lightning||tsunami||smoke;
  const color=lightning?0xffee72:roster[hero].color;
  const x=shooter.x,y=shooter.y;
  if(lightning){
   s.cleanMs=0;
   this.updateShowcaseHud();
   setStatus('Lightning strike!');
   tone(this,125,.35,.09,'triangle');
  }else if(tsunami||smoke){
   s.heroCleanMs[playerIndex]=0;
   this.updateShowcaseHud();
   setStatus(smoke?'Smoke bomb!':'Giant tsunami!');
   tone(this,210,.26,.07,'triangle');
  }
  const duel=this.echoStep==='duel';
  if(!duel&&this.echoStep!=='course')return;
  if(superDash){
   const camera=this.cameras.main;
   if(!this.reduced){
    camera.shake(430,.006);
    camera.flash(140,lightning?255:115,lightning?240:205,255);
   }
   tone(this,smoke?73:lightning?95:58,.43,.10,'triangle');
   tone(this,smoke?160:lightning?630:190,.21,.045,'sawtooth');
  }
  if(tsunami)this.drawGiantTsunami(direction);
  if(smoke)this.drawSmokeBomb(direction);
  if(superDash&&duel){
   const targetX=this.ogre.x,targetY=this.ogre.y-26;
   if(lightning)this.drawCashLightning(targetX,targetY);
   if(!this.reduced){
    const glow=this.obj(this.add.ellipse(targetX,509,154,13,lightning?0xffee99:smoke?0xaa87db:0x87e4ef,.58).setDepth(5));
    this.tweens.add({targets:glow,alpha:0,scaleX:1.55,duration:400,
     onComplete:()=>{if(glow.active)glow.destroy();}});
   }
   const strike=this.obj(this.add.circle(targetX,targetY,22,color,.45).setDepth(17));
   this.duel.coins.push({sprite:strike,vx:0,vy:0,charged:true,superDash:true,life:150,disposable:true});
   for(const shot of this.duel.shots)shot.sprite.destroy();
   this.duel.shots=[];
   return;
  }
  if(superDash){
   const left=this.cameras.main.scrollX;
   for(const scout of s.hazards){
    if(!scout.sprite.visible||scout.sprite.x<left||scout.sprite.x>left+W)continue;
    if(lightning)this.drawCashLightning(scout.sprite.x,scout.sprite.y);
    this.trapCashScout(s,scout,true);
   }
   for(const shot of s.bolts){
    if(shot.sprite.x>=left&&shot.sprite.x<=left+W)shot.life=0;
   }

   return;
  }
  const wave=this.obj(this.add.graphics().setPosition(x,y).setDepth(16));
  wave.fillStyle(color,.86);
  wave.lineStyle(3,0xffffff,.9);
  if(water){
   wave.beginPath();
   wave.moveTo(-35,22);wave.lineTo(-15,-17);wave.lineTo(7,-32);
   wave.lineTo(30,-27);wave.lineTo(40,-11);wave.lineTo(16,-15);
   wave.lineTo(27,2);wave.lineTo(48,22);wave.closePath();
   wave.fillPath();wave.strokePath();wave.setScale(direction,1);
  }else{
   wave.strokeCircle(0,0,21);
   wave.fillCircle(0,0,17);
  }
  if(duel){
   this.duel.coins.push({sprite:wave,vx:0,vy:0,charged:false,life:1750,disposable:true});
   return;
  }
  s.scoutCoins.push({sprite:wave,vx:direction*(water?595:690),vy:0,life:water?.9:.5,powered:true,pierce:water,hit:new Set()});
 }
 drawSmokeBomb(direction){
  const smoke=this.obj(this.add.graphics().setScrollFactor(0).setDepth(23));
  for(let i=0;i<27;i++){
   const x=(i%9)*120;
   const y=H-36-Math.floor(i/9)*92+Math.sin(i*4)*21;
   const radius=73+(i%5)*8;
   smoke.fillStyle([0x44345e,0x9a83bc,0xd2c5e9][i%3],.30);
   smoke.fillCircle(x,y,radius);
  }
  this.tweens.add({targets:smoke,x:this.reduced?0:direction*48,alpha:0,duration:460,onComplete:()=>smoke.destroy()});
 }
 drawGiantTsunami(direction){
  const wave=this.obj(this.add.graphics().setScrollFactor(0).setDepth(23));
  const start=direction>0?0:W;
  wave.setPosition(start,0).setScale(direction,1);
  for(const [height,color,alpha] of [[355,0x157bd0,.66],[290,0x17baa9,.72],[225,0x91fff1,.65]]){
   wave.fillStyle(color,alpha);
   wave.beginPath();
   wave.moveTo(0,H);
   for(let x=0;x<=W;x+=8){
    wave.lineTo(x,H-height+Math.sin(x/78)*35+Math.cos(x/38)*12);
   }
   wave.lineTo(W,H);
   wave.closePath();
   wave.fillPath();
  }
  this.tweens.add({targets:wave,x:this.reduced?start:start+direction*95,alpha:0,duration:460,onComplete:()=>wave.destroy()});
 }
 drawCashLightning(x,y){
  const bolt=this.obj(this.add.graphics().setDepth(21));
  const offset=this.reduced?0:26;
  const trunk=[[x-offset,0],[x+offset,y*.22],[x-offset*.8,y*.47],
   [x+offset*.65,y*.7],[x-offset*.35,y*.86],[x,y]];
  const paths=[trunk];
  if(!this.reduced){
   paths.push([trunk[1],[x+62,y*.32],[x+48,y*.47],[x+89,y*.55]]);
   paths.push([trunk[2],[x-61,y*.59],[x-47,y*.7],[x-83,y*.8]]);
   paths.push([trunk[3],[x+44,y*.79],[x+57,y*.91]]);
  }
  for(const [width,color,alpha] of [[24,0x417cff,.18],[13,0x768bff,.48],[6,0xafffff,.9],[2,0xffffff,1]]){
   for(const [index,path] of paths.entries()){
    bolt.lineStyle(index?width*.45:width,color,alpha);
    bolt.beginPath();
    bolt.moveTo(...path[0]);
    for(const point of path.slice(1))bolt.lineTo(...point);
    bolt.strokePath();
   }
  }
  this.cashShockwave(x,y,0xaaffff,72);
  if(!this.reduced)emit(this,x,y,0xaaffff,12);
  this.tweens.add({targets:bolt,alpha:0,duration:460,onComplete:()=>bolt.destroy()});
 }
 updateCashPartner(s,dt){
  const partner=s.partner;
  if(!partner)return;
  const body=partner.body;
  const direction=Number(this.keys.D.isDown)-Number(this.keys.A.isDown);
  const dash=s.partnerDash;
  const pressed=s.partnerDashPressed;
  s.partnerDashPressed=false;
  dash.charge=Math.min(100,dash.charge+dt*.016);
  dash.recovery=Math.max(0,dash.recovery-dt);
  if(dash.remaining>0){
   dash.remaining=Math.max(0,dash.remaining-dt);
   if(!dash.remaining)dash.recovery=tuning.recoveryMs;
  }
  if(pressed&&!dash.remaining&&!dash.recovery&&dash.charge>=tuning.dashCost){
   dash.charge-=tuning.dashCost;
   dash.remaining=tuning.dashMs;
   dash.direction=direction||(partner.flipX?-1:1);
   this.cashDashPower(partner,s.partnerHero,dash.direction);
   cashCue(this,'dash');
   emit(this,partner.x,partner.y,palette.gold,18);
  }
  body.setVelocityX(dash.remaining?dash.direction*tuning.dashSpeed:direction*248);
  const grounded=body.blocked.down&&body.velocity.y>=0;
  if(s.partnerHero==='ninja'){
   if(grounded)s.partnerAirJumpUsed=false;
   if(s.partnerJumpPressed){
    s.partnerJumpPressed=false;
    if(grounded)body.setVelocityY(-tuning.jumpSpeed);
    else if(!s.partnerAirJumpUsed){
     s.partnerAirJumpUsed=true;
     body.setVelocityY(-tuning.jumpSpeed);
     this.nugsJumpFeedback(partner);
    }
   }
  }else if(this.keys.W.isDown&&grounded)body.setVelocityY(-tuning.jumpSpeed);
  if(body.blocked.down&&[s.spring,s.extraSpring,...s.springs].some(pad=>Math.abs(partner.x-pad.x)<29))body.setVelocityY(-565);
  if(partner.y>560){this.resetCashStreak(partner);this.updateShowcaseHud();}
  if(partner.y>560||Math.abs(partner.x-this.player.x)>590)body.reset(Math.max(30,this.player.x-52),415);
  if(direction)partner.setFlipX(direction<0);
  const state=this.reduced?'idle':dash.remaining?'dash':!body.blocked.down?(body.velocity.y<0?'jump':'fall'):direction?'run':'idle';
  if(this.showCashAttack(partner,partner)){partner.strideX=null;}
  else if(!this.reduced&&state==='run'){
   partner.anims.stop();
   partner.setFrame(strideFrame(partner,partner.x)*7+1);
  }else{
   partner.strideX=null;
   partner.play(s.partnerAtlas+'-'+state,true);
  }
  if(this.echoStep==='duel'){
   if(this.keys.F.isDown)this.fireDuelCoin(partner,s.partnerHero);
   return;
  }


 }
 updateCashCourseHazards(s,dt){
  s.courseTime+=Math.min(dt,40)/1000;
  s.bumpGrace=Math.max(0,s.bumpGrace-dt);
  for(const [index,hazard] of s.hazards.entries()){
   if(hazard.trapUntil>s.courseTime)continue;
   const phase=s.courseTime*(hazard.type==='kiln-runner'?3.3:2)+index;
   hazard.sprite.x=hazard.x+Math.sin(phase)*(hazard.type==='kiln-runner'?77:40);
   hazard.sprite.setFlipX(Math.cos(phase)<0);
   hazard.sprite.y=hazard.y+(hazard.type==='rift-wing'?Math.sin(phase)*36:0);
   if(!this.reduced)hazard.sprite.y+=Math.sin(phase*2)*4;
   if(!hazard.sprite.visible)continue;
   const contacts=[this.player,s.partner].filter(hero=>hero&&Math.abs(hero.x-hazard.sprite.x)<=32&&Math.abs(hero.y-hazard.sprite.y)<=37);
   if(!contacts.length)continue;
   if(contacts.some(hero=>this.cashHeroDashing(hero))){
    hazard.sprite.setVisible(false);
    continue;
   }
   if(s.bumpGrace)continue;
   const hitHero=contacts[0];
   s.bumpGrace=1100;
   this.resetCashStreak(hitHero);
   if(--s.hearts<=0)this.showCashGameOver();
   else{
    hitHero.body.setVelocityY(-175);
    this.updateShowcaseHud();
    setStatus('Jump or dash past the roaming echoes.');
   }
   return;
  }
  const body=this.player.body;
  if(!body.blocked.down)return;
  if([s.spring,s.extraSpring,...s.springs].some(pad=>Math.abs(this.player.x-pad.x)<28)&&this.player.y>460){
   body.setVelocityY(-565);
   cashCue(this,'dash');
  }
  if(Math.abs(this.player.x-s.speedStrip.x)<39&&this.player.y>460&&this.dashTime<=0){
   this.dashCarry=260;this.dashCarryDirection=1;
  }
 }
 updateShowcase(dt){
  const s=this.showcase;
  if(this.echoStep==='course'||this.echoStep==='duel'){
   const ready=s.cleanMs>=LIGHTNING_CHARGE_MS;
   s.cleanMs=Math.min(LIGHTNING_CHARGE_MS,s.cleanMs+dt);
   let tsunamiCharged=false;
   for(const [index,hero] of [this.hero,s.partnerHero].entries()){
    if(hero!=='kairo'&&hero!=='ninja')continue;
    const prior=s.heroCleanMs[index];
    s.heroCleanMs[index]=Math.min(LIGHTNING_CHARGE_MS,prior+dt);
    if(prior<LIGHTNING_CHARGE_MS&&s.heroCleanMs[index]===LIGHTNING_CHARGE_MS)tsunamiCharged=true;
   }
   if(tsunamiCharged||!ready&&s.cleanMs>=LIGHTNING_CHARGE_MS)this.updateShowcaseHud();
  }
  this.updateCashPartner(s,dt);
  this.updateCashIndicators(s);
  if(this.echoStep!=='course'){
   if(this.echoStep==='duel'){
    for(const entry of s.arenaShadows||[]){
     const {actor,shadow}=entry;
     const onGround=actor.body?.blocked.down;
     if(onGround&&entry.onGround===false&&!this.reduced){
      const dust=this.obj(this.add.ellipse(actor.x,actor.body.bottom-2,25,6,0xe4c79b,.48).setDepth(8));
      this.tweens.add({targets:dust,scaleX:2.1,alpha:0,duration:210,
       onComplete:()=>{if(dust.active)dust.destroy();}});
     }
     entry.onGround=onGround;
     const elevation=Math.max(0,484-actor.y);
     shadow.setX(actor.x).setAlpha(Math.max(.15,.63-elevation/420))
      .setScale(Math.max(.57,1-elevation/520),1);
    }
    if(s.challengeFinish)this.updateShowcaseHud();
   }
   return;
  }
  if(this.echoStep==='course'){
   this.updateCashCourseHazards(s,dt);
   if(this.echoStep==='course')this.cashCourseCombat(s,dt);
   if(this.echoStep==='retry')return;
  }
  for(const [index,{marker,sign}] of s.medals.entries()){
   if(!marker.visible||![this.player,s.partner].some(hero=>hero&&Math.hypot(hero.x-marker.x,hero.y-marker.y)<36))continue;
   marker.setVisible(false);
   sign.setText('✓');
   s.earnedMedals|=1<<index;
   try{localStorage.setItem(s.medalKey,String(s.earnedMedals));}catch{}
   setStatus(s.districtNames[index]+' medal earned!');
   tone(this,1047,.25,.08);
   this.cashShockwave(marker.x,marker.y,0xffdb72,65);
   this.updateShowcaseHud();
  }
  const portal=this.cashChallenge==null&&s.portals.find(gate=>!gate.entered&&this.player.x>=gate.x);
  if(portal){
   portal.entered=true;
   s.district=s.portals.indexOf(portal)+1;
   this.arriveCashPortal(s,portal);
   try{localStorage.setItem('sparkle-play-lab:cash-portal:'+this.level,String(s.district));}catch{}
   const reveal=()=>{if(this.showcase===s){this.showCashDistrict(s);this.showCashPortalStamp(s);}};
   if(this.reduced)reveal();
   else{
    const camera=this.cameras.main;
    camera.once('camerafadeoutcomplete',()=>{reveal();camera.fadeIn(300,28,16,49);});
    camera.fadeOut(230,28,16,49);
   }
  }
  if(s.lanternCoin){
   const coin=s.lanternCoin;
   const dx=s.lantern.x-coin.x,dy=s.lantern.y-coin.y;
   const distance=Math.hypot(dx,dy),step=720*Math.min(dt,40)/1000;
   if(distance<=step){
    coin.destroy();s.lanternCoin=null;
    s.lantern.setFillStyle(0x9cf5b1);
    this.events.emit('coin:target-hit',{x:s.lantern.x,y:s.lantern.y});
    s.lamps.shift();s.lit=!s.lamps.length;
    if(!s.lit)s.lantern=s.lamps[0];
    setStatus(s.lit?'Lantern lit! Run right to face the Ogre.':'First lantern lit. Find the next one.');
   }else coin.setPosition(coin.x+dx*step/distance,coin.y+dy*step/distance);
  }
  if(this.level===0&&!s.lanternAlley&&this.player.x>=1440){
   s.lanternAlley=true;
   setStatus('Lantern Alley. Keep moving toward the Ogre.');
  }
  for(const [index,star] of [...s.stars,...s.powerStars].entries()){
   if(!star.visible||![this.player,s.partner].some(hero=>hero&&Math.hypot(hero.x-star.x,hero.y-star.y)<38))continue;
   star.setVisible(false);
   s.starPower=true;
   if(index<s.stars.length){
    s.saved|=1<<index;
    try{localStorage.setItem(s.starKey,String(s.saved));}catch{}
   }
   this.updateShowcaseHud();
   setStatus('Sun Cuff equipped! Scout hits cancel Star Power.');
   tone(this,980,.19);
   this.cashShockwave(star.x,star.y,0xffdf70,84);
  }
  if(this.player.y>560){
   this.resetCashStreak(this.player);
   if(--s.hearts<=0)this.showCashGameOver();
   else{this.player.body.reset(s.checkpoint,455);this.updateShowcaseHud();}
   return;
  }
  if(this.echoStep==='course'&&!s.lit&&!s.lanternCoin&&this.player.x>s.lantern.x+210){
   s.lamps.shift();s.lit=!s.lamps.length;
   if(!s.lit)s.lantern=s.lamps[0];
  }
  this.updateShowcaseHud();
  if(s.challengeFinish&&this.player.x>=s.challengeFinish){
   if(this.cashChallenge===2)this.enterCashArena();
   else this.finishCashChallenge();
   return;
  }
  if(this.echoStep==='course'&&this.player.x>=s.exitX){
   this.enterCashArena();
  }
 }
 enterCashArena(practice=false){
  const s=this.showcase;
  if(!s||this.echoStep!=='course')return;
  s.practiceDuel=practice;
  this.player.body.reset(s.exitX,455);
  s.partner?.body.reset(s.exitX-48,455);
  for(const shot of [...s.bolts,...s.scoutCoins])shot.sprite.destroy();
  s.bolts=[];s.scoutCoins=[];
   // Reuse the arena objects on retries instead of accumulating hidden HUDs.
   for(const item of [this.ogre,this.duelMeter,this.duelReadout,this.echoCue,this.duelGlow])if(item?.active)item.destroy();
   this.setupCoinOgre();
   if(!s.arenaFloor){
    const left=s.width-W;
    const framing=this.obj(this.add.graphics().setDepth(-2));
    for(const x of [left+42,left+W-42]){
     framing.fillStyle(0x18273c,.84).fillRoundedRect(x-21,210,42,302,12);
     framing.fillStyle(0x384f63,.76).fillRoundedRect(x-14,222,8,279,4);
     framing.fillStyle(0x75ded8,.22).fillCircle(x,218,33);
     framing.fillStyle(0xffdf98,.84).fillCircle(x,218,10);
    }
    framing.lineStyle(4,0x647d87,.5).lineBetween(left+42,236,left+W-42,236);
    const floor=this.obj(this.add.graphics().setDepth(4));
    floor.fillStyle(0x263752).fillRect(left,512,W,28);
    floor.fillStyle(0x556b79).fillRect(left,512,W,5);
    floor.lineStyle(1,0xa0afac,.55).lineBetween(left,512,left+W,512);
    floor.fillStyle(0x141e36).fillRect(left,533,W,7);
    for(let x=left+30;x<left+W;x+=64){
     floor.lineStyle(2,0x1b2941).lineBetween(x,517,x+12,534);
     floor.fillStyle(0xb29765,.72).fillCircle(x-9,524,2);
    }
    s.arenaFloor=floor;
   }
   s.arenaShadows=[this.player,s.partner,this.ogre].filter(Boolean).map(actor=>({
    actor,shadow:this.obj(this.add.ellipse(actor.x,510,actor===this.ogre?120:68,12,0x161329,.38).setDepth(5))
   }));
   if(this.cashChallenge===2){
    this.duel.ogreLives=1;
    this.duel.hitsPerLife=12;
    this.drawDuelMeters();
   }
   this.physics.world.setBounds(s.width-W,0,W,H+90);
   this.cameras.main.stopFollow().setScroll(s.width-W,0);
   if(!s.arenaRoofs){
    s.arenaRoofs=true;
    for(const x of [s.width-565,s.width-310]){
     const roof=this.box(x,397,125,14,0x537475).setVisible(false);
     const ledge=this.obj(this.add.graphics().setDepth(6));
     ledge.fillStyle(0x192944).fillRoundedRect(x-62.5,390,125,19,4);
     ledge.fillStyle(0x748690).fillRoundedRect(x-61,390,122,5,2);
     ledge.fillStyle(0x2b435b).fillRect(x-58,397,116,8);
     for(const offset of [-44,-15,15,44]){
      ledge.fillStyle(0x8ee6d9,.28).fillCircle(x+offset,401,4);
      ledge.fillStyle(0xffdb8c).fillCircle(x+offset,401,1.75);
     }
     this.levelColliders.push(this.physics.add.collider(this.player,roof));
     if(s.partner)this.levelColliders.push(this.physics.add.collider(s.partner,roof));
    }
   }
   s.checkpoint=s.exitX;
   setStatus('Hold COIN. Jump the Ogre’s bolts.');
  this.updateShowcaseHud();
 }
 setupCashRoute(){
  this.cashRoofBonus=false;
  this.label('STREET ROUTE →',354,485,16).setDepth(12);
  this.label('★ →',580,305,16).setDepth(12);
  this.cashRoofStar=this.obj(this.add.star(704,305,5,10,23,0xffd472)
   .setStrokeStyle(3,0xfff4cb).setDepth(13));
 }
 collectCashRoofStar(){
  if(this.cashRoofBonus||Math.hypot(this.player.x-704,this.player.y-305)>36)return;
  this.cashRoofBonus=true;
  this.cashRoofStar.setVisible(false);
  this.score+=50;
  this.updateHUD();
  emit(this,704,305,0xffd472,20);
  tone(this,880,.14);
  setStatus('Rooftop bonus! Keep firing at the Echo Ogre.');
 }
 setupGardenPuzzle(){
  this.puzzleSolved=false;
  this.secretFound=false;
  this.sailRising=false;
  this.wheel=null;
  this.lift=null;
  this.exit=this.obj(this.add.rectangle(905,463,42,96,0x265558,.8).setStrokeStyle(4,0x95f4c1));
  this.label('EXIT',905,399,18);
  if(this.level<2){
   const start=this.level===0?480:450;
   this.box(start/2,527,start,26,0x274e50);
   this.box(808,527,304,26,0x274e50);
   this.obj(this.add.rectangle((start+656)/2,526,656-start,28,0x101d36));
  }else{
   this.box(480,527,960,26,0x274e50);
   this.gate=this.box(810,454,28,120,0x35666c);
  }
  if(this.level===1){
   for(const x of [468,636])this.obj(this.add.rectangle(x,491,20,24,0xffd375).setStrokeStyle(3,0xffffff));
  }
  if(this.level===2){
   this.obj(this.add.rectangle(345,500,350,22,0x347d9c,.75));
   this.wheel=this.obj(this.add.star(515,420,8,24,53,0x93603d).setStrokeStyle(5,0xffd68f));
  }
  if(this.level===3){
   for(const [x,color,title] of [[540,0x73e7ff,'UPDRAFT'],[360,0xd5a1ff,'SIDE CURRENT']]){
    this.obj(this.add.rectangle(x,344,100,250,color,.17).setStrokeStyle(2,color,.75));
    this.label('↑ '+title,x,213,17);
   }
  }
 }
 openGardenRoute(){
  this.puzzleSolved=true;
  this.crateDelivered=true;
  this.holding=false;
  this.bubble.setVisible(false);
  this.crate.body.stop();
  this.crate.body.enable=false;
  this.exit.setFillStyle(0x6ce7a6,.8);
  if(this.level===0)this.bloom();
  if(this.level<2){
   const start=this.level===0?480:450;
   const bridge=this.box((start+656)/2,520,656-start+4,12,this.level===0?0x69b84d:0xb9804e);
   this.levelColliders.push(this.physics.add.collider(this.player,bridge));
   if(this.level===1)this.crate.setVisible(false);
  }else if(this.level===2){
   this.lift=this.box(747,498,68,16,0xf0bb62);
   this.levelColliders.push(this.physics.add.collider(this.player,this.lift));
   this.liftTime=0;
  }
  emit(this,this.goal.x,this.goal.y,0x79e6b2,24);
  tone(this,920,.16);
  setStatus(['The planter bloomed a vine bridge! Cross to the exit.','The panel snapped into place! Cross the repaired bridge.','Water is flowing! Ride the lift to clear the gate.','The sail opened the gate! Head to the exit.'][this.level]);
 }
 updateGardenPuzzle(dt){
  const cargo=this.crate;
  if(this.puzzleSolved){
   if(this.wheel&&!this.reduced)this.wheel.angle+=dt*.17;
   if(this.lift){
    this.liftTime+=dt;
    const previous=this.lift.y;
    const riding=this.player.body.blocked.down&&Math.abs(this.player.x-this.lift.x)<43
       &&Math.abs(this.player.body.bottom-(previous-8))<6;
    this.lift.y=440+58*Math.cos(this.liftTime*Math.PI/1900);
    this.lift.body.updateFromGameObject();
    if(riding){
     const travel=this.lift.y-previous;
     this.player.y+=travel;
     this.player.body.position.y+=travel;
    }
   }
   if(this.level===2&&this.player.x>814){this.gate.body.enable=false;this.gate.setVisible(false)}
   if(this.player.x>878&&this.player.y>395)this.victory();
   return;
  }
  if(this.sailRising){
   cargo.y=Math.max(115,cargo.y-dt*.28);
   if(cargo.y<=115){
    this.sailRising=false;
    this.gate.body.enable=false;
    this.gate.setVisible(false);
    this.openGardenRoute();
   }
   return;
  }
  if(cargo.y>510||this.player.y>498){
   this.holding=false;this.bubble.setVisible(false);
   cargo.setScale(1);cargo.body.setAllowGravity(true);
   cargo.body.reset(...this.dataLevel.crate);
   if(this.player.y>498)this.player.body.reset(95,455);
   setStatus(this.instruction());
   return;
  }
  const near=Phaser.Math.Distance.Between(cargo.x,cargo.y,this.goal.x,this.goal.y);
  if(this.level===0&&near<34){
   cargo.body.reset(this.goal.x,this.goal.y);
   this.openGardenRoute();
  }else if(this.level===1&&!this.holding&&Math.abs(cargo.x-552)<48&&Math.abs(cargo.y-482)<30){
   this.openGardenRoute();
  }else if(this.level===2&&this.holding&&cargo.y<370){
   this.openGardenRoute();
  }else if(this.level===3&&!this.holding&&cargo.y>235&&cargo.y<442){
   if(Math.abs(cargo.x-360)<50&&!this.secretFound){
    this.secretFound=true;
    this.obj(this.add.ellipse(360,250,130,36,0x74be78)).setDepth(4);
    this.label('HIDDEN GARDEN',360,237,16).setDepth(5);
    emit(this,360,250,0xffb4ef,30);
    this.score+=50;this.updateHUD();
    cargo.body.reset(...this.dataLevel.crate);
    setStatus('Hidden garden found! Now release the sail in the blue updraft.');
   }else if(Math.abs(cargo.x-540)<50){
    this.sailRising=true;
    cargo.body.stop();cargo.body.enable=false;
   }
  }
 }
 seedTrial(){return kind==='bubble'&&this.level===0}
 makeCargo(){
  if(kind==='bubble'){
   if(this.level===1)return [this.add.rectangle(0,0,52,24,0xb9804e).setStrokeStyle(4,0xffd091)];
   if(this.level===2)return [this.add.rectangle(0,0,59,16,0x9a673f).setAngle(-20),this.add.ellipse(17,-13,23,13,0x78ba58)];
   if(this.level===3)return [this.add.triangle(0,0,0,43,0,0,39,43,0xffe6ab).setStrokeStyle(3,0xffab69)];
  }
  if(!this.seedTrial())return [this.add.rectangle(0,0,42,42,0xc98756).setStrokeStyle(4,0xffe1a3)];
  return [
   this.add.ellipse(0,0,38,41,0xdf9b52).setStrokeStyle(3,0xffdf91),
   this.add.ellipse(-7,1,8,24,0xb57240),
   this.add.ellipse(8,-2,7,25,0xffca83),
   this.add.ellipse(-5,-18,15,8,0x75c469).setAngle(28),
   this.add.ellipse(5,-18,15,8,0x73bf69).setAngle(-28),
  ];
 }
 bloom(){
  const {x,y}=this.goal;
  const petals=[];
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3;
   petals.push(this.obj(this.add.ellipse(x+Math.cos(angle)*16,y-22+Math.sin(angle)*16,18,18,0xffbfeb)).setDepth(13));
  }
  petals.push(this.obj(this.add.circle(x,y-22,10,0xffdb76)).setDepth(14));
  if(!this.reduced){
   petals.forEach(p=>p.setScale(0));
   this.tweens.add({targets:petals,scale:1,duration:380,ease:'Back.Out'});
  }
 }
 loadLevel(resumeCheckpoint=false){updateChapterSelect(this.level);this.clearLevel();this.showcase=null;this.ogre=null;this.cameras.main.stopFollow().setBounds(0,0,W,H).setScroll(0,0);this.physics.world.setBounds(0,0,W,H);this.secretWall=null;this.facing=1;const l=levels[kind][this.level];this.dataLevel=l;this.score=0;this.hero=kind==='cash'&&Object.hasOwn(roster,$('cash-hero')?.value)?$('cash-hero').value:kind==='cash'?'cash':kind==='ninja'?'ninja':'kairo';this.player=this.obj(this.add.container(95,455));this.physics.add.existing(this.player);this.player.body.setSize(30,kind==='ninja'?30:56).setOffset(-15,kind==='ninja'?-15:-28).setCollideWorldBounds(true).setGravityY(kind==='ninja'?0:750);this.player.body.setMaxVelocity(650,800);this.drawHero();if(kind==='ninja'){this.buildMaze(l)}else{if(kind==='bubble')this.setupGardenPuzzle();else if(kind==='cash')this.setupShowcase(resumeCheckpoint);else this.box(480,527,960,26,0x274e50);if(!this.showcase)for(const [x,y,w,h] of l.walls)this.box(x+w/2,y+h/2,w,h);if(kind==='bubble'||kind==='echo'&&l.crate){this.crate=this.obj(this.add.container(...l.crate));this.crate.add(this.makeCargo());this.physics.add.existing(this.crate);this.crate.body.setSize(42,42).setOffset(-21,-21).setGravityY(550).setCollideWorldBounds(true).setBounce(.1);this.goal=this.obj(this.add.circle(...l.goal,30,0xffd56e,.12).setStrokeStyle(6,0xffd56e));this.label(kind==='bubble'?['PLANTER','RELEASE PANEL','CLEAR CHANNEL','RELEASE SAIL'][this.level]:'LAND HERE',l.goal[0],l.goal[1]-45,15);
 if(this.seedTrial()){
  this.obj(this.add.rectangle(l.goal[0],l.goal[1]+28,64,22,0x926348).setStrokeStyle(3,0xf2bd78));
  this.obj(this.add.ellipse(l.goal[0],l.goal[1]+17,62,16,0x69524b).setStrokeStyle(3,0xefb675));
 }this.bubble=this.obj(this.add.circle(...l.crate,32,0x77ebff,.19).setStrokeStyle(3,0xaaf7ff).setDepth(5).setVisible(false))}else{this.crate=null;this.goal=null}if(l.targets&&kind!=='cash'){for(const [x,y] of l.targets){const t=this.obj(this.add.circle(x,y,24,0x8c74d6,.8).setStrokeStyle(5,0xffdb86));t.hit=false;this.targets.push(t)}}if(kind==='echo'){this.ogre=this.obj(this.add.container(845,415));const body=this.add.ellipse(0,0,110,128,0x8e6ac5).setStrokeStyle(5,0xc8a6f3);const eyes=this.add.text(0,-20,'◉  ◉',{fontSize:'28px',color:'#ffffff'}).setOrigin(.5);const mouth=this.add.arc(0,22,15,0,180,false,0xffe7bd).setStrokeStyle(3,0xffffff);this.ogre.add([body,eyes,mouth]);if(this.textures.exists('canon-ogre')){const img=this.add.image(0,-7,'canon-ogre');const source=this.textures.get('canon-ogre').getSourceImage();img.setScale(Math.min(100/source.width,100/source.height));this.ogre.add(img);body.setAlpha(.22);eyes.setVisible(false);mouth.setVisible(false)}}}this.walls.forEach(w=>{this.levelColliders.push(this.physics.add.collider(this.player,w));if(this.crate)this.levelColliders.push(this.physics.add.collider(this.crate,w))});if(this.crate)this.levelColliders.push(this.physics.add.collider(this.player,this.crate));if(kind==='cash'){if(!this.showcase)this.setupCoinOgre();}else this.setupVillain();if(kind==='echo')this.setupEcho();this.updateHUD();portrait(this.hero);if(kind==='cash')$('power').textContent=roster[this.hero].shot;setStatus(this.instruction());tone(this,470,.08)}
 drawHero(){
  this.player.removeAll(true);
  const key=makeHeroAtlas(this,this.hero);
  const scale=kind==='cash'?(CASH_HERO_SCALE[this.hero]??.78):.78;
  const baseline=kind==='cash'?28-39*scale:0;
  const sprite=this.add.sprite(0,baseline,key).setScale(scale);
  this.player.add(sprite);this.heroMotion={sprite,baseline};
  sprite.play(key+'-idle');this.player.setDepth(10);
  this.heroTag?.destroy();this.heroTag=this.obj(this.add.text(22,25,this.hero.toUpperCase(),{fontSize:'16px',fontFamily:'system-ui',fontStyle:'bold',color:'#fff0bd'}));
 }

 updateHUD(){this.heroTag?.setText(this.hero.toUpperCase());this.hud?.destroy();this.hud=this.obj(this.add.text(22,45,`CHAPTER ${this.level+1}/${levels[kind].length}    ✨ ${this.score}`,{fontSize:'17px',fontFamily:'system-ui',fontStyle:'bold',color:'#ffe4a0'}).setScrollFactor(0).setDepth(40));}
 instruction(){
 if(kind==='cash'&&this.cashChallenge!=null){
  if(this.cashChallenge===1)return this.showcase.partner?'Bubble a scout, then hit it with a coin.':'Bank a coin off the blue shield.';
  return this.cashChallenge===0?'Race to the flag.':'Reach the arena, then dodge and counter.';
 }
 if(kind==='echo')return 'Read the Ogre’s warning and jump. His first attack reveals the lantern.';if(kind==='bubble')return this.dataLevel.tip;return this.seedTrial()?'Press BUBBLE or J near the seed pod. Guide it into the garden planter.':kind==='bubble'?'Press BUBBLE or J near the crate. Use the arrows to guide it into the golden ring.':kind==='cash'&&this.showcase?'Run right. Jump gaps. Collect three stars.':kind==='cash'?'Fire coins at the Echo Ogre. Watch his windup and dodge low bolts, spreads, and chasing orbs.':kind==='ninja'?'Find the golden switch, then reach the mint door. Press SCAN or J for a clue.':this.dataLevel?.crate?'Guide the crate into the golden ring with Kairo.':'Switch to Captain Cash with HERO or Q and light all the targets.'}
 buildMaze(l){this.player.body.setGravityY(0);this.player.setPosition(95,455);this.maze=[];const size=46,ox=135,oy=80;this.mazeOffset={size,ox,oy};for(let r=0;r<l.grid.length;r++)for(let c=0;c<l.grid[r].length;c++){let v=l.grid[r][c],x=ox+c*size,y=oy+r*size; if(v==='#'){this.box(x,y,size-1,size-1,0x3c5478)}else{this.obj(this.add.rectangle(x,y,size-2,size-2,0x244b68,.35))}if(v==='S'){this.player.setPosition(x,y)}if(v==='K'){this.switchCell={x,y};this.switchMarker=this.obj(this.add.star(x,y,5,9,20,0xffe78c).setStrokeStyle(2,0xffffff))}if(v==='E'){this.exitCell={x,y};this.exitMarker=this.obj(this.add.rectangle(x,y,30,36,0x47768a).setStrokeStyle(3,0xffe68d))}}this.label('Find the golden switch • reach the mint door',480,35,18);this.switchOn=false;
 if(this.level===0){
  this.secretWall=this.walls.find(wall=>wall.x===ox+6*size&&wall.y===oy+size);
  this.secretWall?.setStrokeStyle(3,0x829ab6);
 }
 }
 swap(){if(kind!=='echo'||this.completed||(this.echoStep==='duel'&&this.hero==='cash'))return;if(this.holding){this.holding=false;this.crate.body.setAllowGravity(true);this.crate.setScale(1);this.bubble.setVisible(false)}
 this.hero=this.hero==='kairo'?'cash':this.hero==='cash'?'ninja':'kairo';this.drawHero();this.updateHUD();portrait(this.hero);emit(this,this.player.x,this.player.y,0xb4f4ff,10);tone(this,650)}
 action(){if(this.completed){this.next();return}
 if(kind==='cash'){if(this.echoStep==='retry')this.loadLevel(true);else if(this.echoStep==='duel')this.fireDuelCoin();
 else if(this.showcase&&!this.showcase.lit&&Math.abs(this.player.x-this.showcase.lantern.x)<210&&(this.level!==2||this.dashTime>0)){
  if(!this.showcase.lanternCoin){
   const x=this.player.x,y=this.player.y+26;
   this.showcase.lanternCoin=this.obj(this.add.circle(x,y,9,0xffd36e).setDepth(15));
   this.events.emit('cash:coin-fired',{x,y,charged:false});
  }
 }else if(this.showcase&&this.echoStep==='course')this.fireScoutShot(this.player,this.hero,this.facing||1);
 return;}

 if(kind==='echo'){
  if(['stop','choose','repair'].includes(this.echoStep))return;
  if(this.hero==='ninja'){this.echoScan();return;}
  if(this.hero==='kairo'&&this.echoStep==='wait'){setStatus('Watch the Ogre’s windup. The first attack reveals the lantern.');return;}
  if(this.echoStep==='retry'){this.loadLevel();return;}
  if(this.echoStep==='breathe'){setStatus('Hold Breathe or B. Fill the ring.');return;}
  if(this.hero==='cash'){
   if(this.echoStep==='duel')this.fireDuelCoin();
   else setStatus('Use Kairo’s bubble to place the lantern before the duel.');
   return;
  }
 }if(kind==='ninja'){
 showMethodCallout('Notice');
 const wall=this.secretWall;
 if(this.level===0&&wall?.body.enable&&Math.hypot(this.player.x-wall.x,this.player.y-wall.y)<80){
  wall.body.enable=false;wall.setFillStyle(0x5cb195,.22).setStrokeStyle(3,0x88e9c0);
  this.score+=50;this.updateHUD();emit(this,wall.x,wall.y,0x88e9c0,20);tone(this,880);
  setStatus('Secret shortcut found! Slip through the passage.');
  return;
 }
 this.ninjaScan=110;const scan=this.add.circle(this.player.x,this.player.y,15,0xb5f4ff,.12).setStrokeStyle(3,0x8ceaff).setDepth(3);this.tweens.add({targets:scan,scale:5,alpha:0,duration:550,onComplete:()=>scan.destroy()});const marker=this.switchOn?this.exitMarker:this.switchMarker;
 const originalX=marker.x,originalY=marker.y;
 const clue=this.label(this.switchOn?'EXIT':'SWITCH',originalX,originalY-31,14).setDepth(30);
 this.time.delayedCall(1600,()=>{if(clue.active)clue.destroy()});
 setStatus(this.switchOn?'Scan found the exit. Follow the maze to the mint door.':'Scan found the switch. Follow the maze to the golden star.');tone(this,730);return}if(this.hero==='kairo'){if(kind==='bubble'&&(this.puzzleSolved||this.sailRising))return;if(!this.crate||this.crateDelivered){setStatus('Switch to Captain Cash to charge the remaining lights.');return;}if(!this.holding&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.crate.x,this.crate.y)<190){this.holding=true;this.crate.body.setAllowGravity(false);this.crate.body.setVelocity(0);this.crate.setScale(1.12);this.bubble.setPosition(this.crate.x,this.crate.y).setVisible(true);tone(this,760);emit(this,this.crate.x,this.crate.y,palette.blue,12);setStatus(kind==='bubble'&&!this.seedTrial()?this.dataLevel.tip:this.seedTrial()?'Seed pod lifted! Guide it to the planter with the arrows.':'Anti-gravity activated! Move with the arrows, and raise or lower the crate.')}else if(this.holding){this.holding=false;this.crate.body.setAllowGravity(true);this.crate.setScale(1);this.bubble.setVisible(false);setStatus('Bubble released. Press BUBBLE again to lift.');tone(this,330)}else setStatus('Move closer to the object to capture it in a bubble.');return}if(this.hero==='cash'){let dir=this.facing||1;let coin=this.obj(this.add.circle(this.player.x+dir*26,this.player.y+15,10,0xffd36e).setStrokeStyle(2,0xfff3bd));this.physics.add.existing(coin);coin.body.setAllowGravity(false);const targets=this.targets.filter(t=>!t.hit&&(t.x-coin.x)*dir>=0);
const available=targets.filter(target=>!this.projectiles.some(shot=>shot.active&&shot.aim===target));
const aim=(available.length?available:targets).reduce((nearest,t)=>!nearest||Math.hypot(t.x-coin.x,t.y-coin.y)<Math.hypot(nearest.x-coin.x,nearest.y-coin.y)?t:nearest,null);
if(aim){const angle=Math.atan2(aim.y-coin.y,aim.x-coin.x);coin.body.setVelocity(Math.cos(angle)*690,Math.sin(angle)*690)}
else coin.body.setVelocityX(dir*690);
coin.aim=aim;coin.life=1600;this.projectiles.push(coin);tone(this,970,.065);emit(this,coin.x,coin.y,0xffd77c,6);return}if(this.hero==='ninja'){this.ninjaScan=90;setStatus('Ninja Nugs discovered a clue! Look for the golden ring and purple targets.');tone(this,800)}}
 dash(){if(this.completed||(kind==='cash'&&this.echoStep==='retry'))return;if(kind!=='cash'&&this.hero!=='cash'){if(kind==='echo')this.swap();return}if(kind==='cash'&&(this.dashTime>0||this.dashRecovery>0))return;if(this.charge<30){setStatus('Dash is recharging.');return;}this.charge-=30;this.dashTime=tuning.dashMs;this.dashDirection=this.facing||1;this.lastDashTrail=0;this.player.body.setVelocityX((this.facing||1)*620);if(kind==='cash'){cashCue(this,'dash');this.cashDashPower(this.player,this.hero,this.dashDirection);}else tone(this,240,.14);emit(this,this.player.x,this.player.y,palette.gold,18)}
 finishCashChallenge(){
  if(this.completed)return;
  this.completed=true;
  const elapsed=this.showcase.challengeElapsedMs;
  const seconds=(elapsed/1000).toFixed(1);
  const recordKey='sparkle-play-lab:cash-best:'+this.cashChallenge+':'+this.echoMode+':'+(this.showcase.partner?'duo':'solo');
  let record='';
  try{
   const prior=Number(localStorage.getItem(recordKey));
   if(!prior||elapsed<prior){
    localStorage.setItem(recordKey,String(elapsed));
    record='  ·  ★ New best';
   }else record='  ·  Best '+(prior/1000).toFixed(1)+'s';
  }catch{}
  this.player.body.stop().setAllowGravity(false);
  this.showcase.partner?.body.stop().setAllowGravity(false);
  this.label('CHALLENGE CLEAR · '+seconds+'s'+record,480,225,35).setScrollFactor(0).setDepth(60);
  if(this.cashChallenge===1)this.label(this.showcase.trickShotEarned?'★ Trick shot earned':'◇ Try a ricochet',480,265,20).setScrollFactor(0).setDepth(60);
  this.label('↻ Enter or Fire',480,306,20).setScrollFactor(0).setDepth(60);
  setStatus(CASH_CHALLENGES[this.cashChallenge]+' cleared.');
  cashCue(this,'victory');
 }
 next(){if(this.finalePending)return;if(this.cashChallenge!=null||this.showcase?.practiceDuel){this.loadLevel(true);return;}if(this.level<levels[kind].length-1){this.level++;this.loadLevel()}else{this.level=0;this.loadLevel()}}
 victory(){
 if(this.showcase?.practiceDuel){
  this.completed=true;
  this.player.body.stop().setAllowGravity(false);
  this.showcase.partner?.body.stop().setAllowGravity(false);
  this.label('PRACTICE CLEAR',480,225,36).setScrollFactor(0).setDepth(60);
  this.label('↻ Enter or Fire',480,274,20).setScrollFactor(0).setDepth(60);
  setStatus('Practice duel cleared!');
  return;
 }
 if(this.cashChallenge!=null){this.finishCashChallenge();return;}if(this.completed)return;this.completed=true;
 if(kind==='cash'){try{localStorage.removeItem('sparkle-play-lab:cash-portal:'+this.level);}catch{}}
 saveProgress(this.level+1);updateChapterSelect(this.level);
 const finale=this.level===levels[kind].length-1;
 const tune={bubble:[523,659,784],cash:[392,784,988],ninja:[440,587,880],echo:[392,523,659]}[kind];
 if(kind!=='cash')tune.forEach((pitch,index)=>this.time.delayedCall(index*100,()=>{if(this.completed)tone(this,pitch,.16)}));

 if(this.villain){this.villain.zones.forEach(zone=>zone.setVisible(false));this.villain.label.setText('OUTSMARTED!');this.villain.mask.setAngle(0);}this.holding=false;this.player.body.setVelocity(0);this.player.body.setAllowGravity(false);this.motionState='celebrate';if(!this.reduced)this.heroMotion?.sprite?.play('atlas-'+this.hero+'-celebrate',true);this.score+=100;if(kind==='cash'&&finale){this.celebrateCashFinale();return;}if(!this.reduced)this.tweens.add({targets:this.player,scaleX:(this.facing||1)*1.13,scaleY:1.13,duration:170,yoyo:true,repeat:2});this.updateHUD();emit(this,this.player.x,this.player.y,palette.gold,42);tone(this,880,.18);this.label(this.level===levels[kind].length-1?'SPARKLE SUCCESS!':'CHAPTER COMPLETE!',480,220,40,'#ffe5a0').setScrollFactor(0).setDepth(55);this.label(finale?'Tap POWER or press ENTER to replay':'Tap POWER or press ENTER to continue',480,274,19,'#ffffff').setScrollFactor(0).setDepth(55);setStatus(this.level===levels[kind].length-1?({bubble:'You restored the Floating Garden!',cash:'You helped the Echo Ogre settle down!',ninja:'You found the secret switches and outsmarted Shadow Fox!',echo:'You restored the Sparkle Grid!'}[kind]+' Replay or choose an unlocked chapter.'):kind==='bubble'?'Route cleared! Press BUBBLE for the next chapter.':'Great work! Press POWER to continue.')}
 celebrateCashFinale(){
  this.finalePending=true;
  const player=this.player;
  const partner=this.showcase?.partner;
  if(partner){
   partner.body.stop();
   partner.body.setAllowGravity(false);
   if(!this.reduced)partner.play(this.showcase.partnerAtlas+'-celebrate',true);
  }
  const heroes=[player,partner].filter(Boolean);
  if(!this.reduced){
   for(const [index,hero] of heroes.entries()){
    this.tweens.add({targets:hero,y:hero.y-24,angle:index?9:-9,
     duration:175,yoyo:true,repeat:4,delay:index*90,ease:'Sine.easeInOut'});
    emit(this,hero.x,hero.y,palette.gold,22);
   }
  }
  this.updateHUD();
  this.label('CAMPAIGN CLEARED!',480,220,36,'#ffe5a0').setScrollFactor(0).setDepth(55);
  setStatus('Victory! You cleared the campaign.');
  const fanfare=[523,659,784,1047,784,1047,1319];
  fanfare.forEach((pitch,index)=>this.time.delayedCall(index*145,()=>{
   if(this.player!==player||!this.finalePending)return;
   tone(this,pitch,.24,.085,'triangle');
   tone(this,pitch/2,.19,.045,'sine');
  }));
  this.time.delayedCall(this.reduced?1250:2200,()=>{
   if(this.player!==player||!this.finalePending)return;
   const flyer=$('cash-finale');
   if(flyer&&!flyer.open)flyer.showModal();
   this.finalePending=false;
  });
 }
 animateHero(dt,dir,up,down){
  const m=this.heroMotion;if(!m?.sprite)return;const b=this.player.body;
  if(kind==='cash'){
   this.cashFirePose=Math.max(0,(this.cashFirePose||0)-dt);
   m.sprite.setTint(this.duel?.grace>650?0xffb8b0:this.cashFirePose?0xffe5aa:0xffffff);
   if(b.blocked.down&&!this.cashWasGrounded){
    emit(this,this.player.x,this.player.y+25,0xffdf9a,5);
    cashCue(this,'land');
   }
   const recoil=this.reduced?0:this.cashFirePose/120;
   m.sprite.setAngle(-7*recoil).setY(m.baseline-3*recoil);
   this.cashWasGrounded=b.blocked.down;
  }
  const state=this.completed?'celebrate':this.dashTime>0?'dash':this.holding?'power':kind!=='ninja'&&!b.blocked.down?(b.velocity.y<0?'jump':'fall'):Math.abs(b.velocity.x)>25||kind==='ninja'&&Math.abs(b.velocity.y)>25?'run':'idle';
  if(kind==='cash'&&this.showCashAttack(this.player,m.sprite)){this.motionState='attack';m.strideX=null;return;}
  if(kind==='cash'&&!this.reduced&&state==='run'){
   this.motionState=state;
   m.sprite.anims.stop();
   m.sprite.setFrame(strideFrame(m,this.player.x)*7+1);
   return;
  }
  m.strideX=null;
  if(state!==this.motionState){this.motionState=state;m.sprite.play('atlas-'+this.hero+'-'+(this.reduced?'idle':state),true)}
 }

 steerBubble(horizontal,vertical,dt){
  const cargo=this.crate;
  const seconds=Math.min(dt,34)/1000;
  const diagonal=horizontal&&vertical?Math.SQRT1_2:1;
  const x=clamp(cargo.x+horizontal*260*seconds*diagonal,30,930);
  const y=clamp(cargo.y+vertical*230*seconds*diagonal,75,475);
  const clear=(cx,cy)=>!this.walls.some(w=>w.body.enable
   &&Math.abs(cx-w.x)<(w.width+42)/2&&Math.abs(cy-w.y)<(w.height+42)/2);
  cargo.body.setVelocity(0);
  // Test each axis independently so a diagonal input can slide along a wall.
  if(clear(x,cargo.y))cargo.x=x;
  if(clear(cargo.x,y))cargo.y=y;
  this.bubble.setPosition(cargo.x,cargo.y);
 }
 update(_,dt){if(!this.player||this.completed||(kind==='cash'&&this.echoStep==='retry'))return;if(this.showcase?.challengeFinish)this.showcase.challengeElapsedMs+=dt;
 if(kind!=='cash')playMusicBeat(this,dt,kind);if(kind==='cash'&&this.echoStep==='duel')this.updateDuel(dt);else this.updateVillain(dt);const b=this.player.body;let left=buttons.left||this.keys.A.isDown||this.keys.LEFT.isDown,right=buttons.right||this.keys.D.isDown||this.keys.RIGHT.isDown,up=buttons.up||this.keys.W.isDown||this.keys.UP.isDown,down=buttons.down||this.keys.S.isDown||this.keys.DOWN.isDown;const cashIntent=kind==='cash'?movementIntent(buttons,this.keys,!!this.showcase?.partner):null;let dir=cashIntent?.direction??((right?1:0)-(left?1:0));if(dir){if(this.dashCarryDirection!==dir)this.dashCarry=0;this.facing=dir;this.player.setScale(dir<0?-1:1,1)}this.charge=Math.min(100,this.charge+dt*.016);if(kind==='ninja'){const vertical=(down?1:0)-(up?1:0);const speed=dir&&vertical?175*Math.SQRT1_2:175;b.setVelocity(dir*speed,vertical*speed);this.animateHero(dt,dir,up,down);if(this.switchCell&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.switchCell.x,this.switchCell.y)<30&&!this.switchOn){this.switchOn=true;this.exitMarker.setFillStyle(0x6bbda2);this.switchMarker.setFillStyle(0x7ee8a5);this.score+=50;this.updateHUD();emit(this,this.switchCell.x,this.switchCell.y,0xffdb70,25);tone(this,900);setStatus('Secret switch activated! Find the mint door.')}if(this.switchOn&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.exitCell.x,this.exitCell.y)<28)this.victory();return}this.dashRecovery=Math.max(0,this.dashRecovery-dt);if(this.dashTime>0){this.dashTime-=dt;if(kind==='cash'&&this.dashTime<=0)this.dashRecovery=tuning.recoveryMs;this.lastDashTrail+=dt;if(!this.reduced&&this.lastDashTrail>=48){this.lastDashTrail=0;const trail=this.add.circle(this.player.x,this.player.y,23,palette.gold,.25).setDepth(4);this.tweens.add({targets:trail,alpha:0,scale:1.8,duration:260,onComplete:()=>trail.destroy()})}b.setVelocityX((kind==='cash'?this.dashDirection:(this.facing||1))*tuning.dashSpeed);if(!this.reduced&&Math.random()<.5){const spark=this.add.circle(this.player.x,this.player.y,8,palette.gold,.5).setDepth(2);this.tweens.add({targets:spark,alpha:0,scale:.2,duration:220,onComplete:()=>spark.destroy()})} }else if(kind==='cash'&&this.dashCarry>0&&(dir===0||dir===this.dashCarryDirection)){
 this.dashCarry=Math.max(0,this.dashCarry-dt);
 b.setVelocityX(this.dashCarryDirection*(320+230*this.dashCarry/260));
 }else b.setVelocityX(this.hero==='cash'&&kind==='cash'?runVelocity(b.velocity.x,dir,dt):dir*(this.hero==='cash'?280:205));const jumpDown=cashIntent?.jump??(buttons.jump||this.keys.SPACE.isDown||(!this.holding&&up));
if(jumpDown&&!this.jumpWasDown)this.jumpBuffer=130;
if(kind==='cash'&&this.jumpWasDown&&!jumpDown&&b.velocity.y<-190)b.setVelocityY(-190);
this.jumpWasDown=jumpDown;
this.groundGrace=b.blocked.down?110:Math.max(0,this.groundGrace-dt);
if(b.blocked.down&&b.velocity.y>=0)this.nugsAirJumpUsed=false;
if(this.jumpBuffer>0&&this.groundGrace>0){b.setVelocityY(-460);this.groundGrace=0;this.jumpBuffer=0;if(kind==='cash'&&this.dashTime>0){this.dashCarry=260;this.dashCarryDirection=this.facing;}tone(this,500,.055)}
else if(kind==='cash'&&this.hero==='ninja'&&this.jumpBuffer>0&&!b.blocked.down&&!this.nugsAirJumpUsed){
 this.nugsAirJumpUsed=true;
 this.jumpBuffer=0;
 b.setVelocityY(-tuning.jumpSpeed);
 this.nugsJumpFeedback(this.player);
}
this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);if(this.holding&&this.crate)this.steerBubble(dir,(down?1:0)-(up?1:0),dt);
if(kind==='bubble'){this.updateGardenPuzzle(dt);this.animateHero(dt,dir,up,down);return}
if((kind!=='echo'||this.echoStep==='lift')&&this.crate&&this.goal&&!this.crateDelivered&&Phaser.Math.Distance.Between(this.crate.x,this.crate.y,this.goal.x,this.goal.y)<32){
 this.crateDelivered=true;this.holding=false;this.bubble.setVisible(false);
 this.crate.body.setVelocity(0);this.crate.body.setAllowGravity(false);this.crate.body.setImmovable(true);this.crate.setPosition(this.goal.x,this.goal.y).setScale(1);
 if(this.seedTrial())this.bloom();
 this.goal.setFillStyle(0x79e6b2,.25).setStrokeStyle(6,0x79e6b2);
 emit(this,this.goal.x,this.goal.y,0x79e6b2,24);tone(this,920,.16);
 if(kind==='echo'){
  this.addSparkle('repair');
  this.echoStep='duel';
  this.echoWave.setVisible(false);
  this.villain.zones.forEach(zone=>zone.setVisible(false));
  this.echoCue.setText(kind==='cash'?'GUARD OPEN · FIRE':'COIN DUEL');
  if(this.hero!=='cash')this.swap();
  setStatus('Cash: fire coins at the Echo Ogre. Jump or move to dodge his orbs.');
 }else if(this.targets.every(target=>target.hit)){this.victory();return}
 if(kind!=='echo')setStatus('Crate delivered! Switch to Captain Cash to light the remaining targets.');
}if(this.showcase)this.updateShowcase(dt);
for(const coin of [...this.projectiles]){if(!coin.active)continue;coin.life-=dt;for(const t of this.targets){if(!t.hit&&Phaser.Math.Distance.Between(coin.x,coin.y,t.x,t.y)<32){t.hit=true;t.setFillStyle(0x69dcae);this.score+=25;this.updateHUD();emit(this,t.x,t.y,palette.gold,22);coin.destroy();tone(this,1100,.13);break}}if(coin.life<=0||coin.x<0||coin.x>W)coin.destroy()}this.projectiles=this.projectiles.filter(p=>p.active);this.animateHero(dt,dir,up,down);if(kind==='echo'){
 if(this.echoStep==='switch'&&this.hero==='ninja'&&Math.hypot(this.player.x-730,this.player.y-469)<46)this.startStop();
 if(this.echoStep==='breathe')this.updateBreathe(dt);
 return;
}if(kind!=='cash'&&this.targets.length&&this.targets.every(t=>t.hit)){if(!this.crate||this.crateDelivered)this.victory();
else if(!this.targetsAnnounced){this.targetsAnnounced=true;setStatus('All targets lit! Switch to Kairo and guide the crate into the ring.')}}if(kind==='echo'&&this.ogre&&!this.reduced&&this.villain.phase==='rest'){this.ogreMood+=dt*.001;this.ogre.setScale(1.35+Math.sin(this.ogreMood*2)*.035)}}
}
let practiceOnBoot=false;
let challengeOnBoot=-1;
const cashMusic=kind==='cash'?new Audio('../../assets/runtime/superhero-motif.mp3'):null;
let cashMusicEnabled=true;
let cashMenuPaused=false;
if(cashMusic){
 cashMusic.preload='none';
 cashMusic.loop=true;
 cashMusic.volume=.18;
}
function syncCashMusic(){
 if(!cashMusic)return;
 if(cashMusicEnabled&&!cashMenuPaused&&!document.hidden&&!cashMusic.muted){
  cashMusic.play().catch(()=>{});
 }else cashMusic.pause();
}
function init(){if(game)return;game=new Phaser.Game({type:kind==='cash'?Phaser.CANVAS:Phaser.AUTO,parent:'stage',width:W,height:H,backgroundColor:'#142b55',render:{antialias:true,pixelArt:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{y:0},debug:false}},scene:[Adventure]});const bindHold=(id,key)=>{const el=$(id);if(!el||id==='power'&&kind!=='cash'&&kind!=='echo')return;const off=()=>{buttons[key]=false;el.classList.remove('pressed')};el.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();buttons[key]=true;el.classList.add('pressed')}});el.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')off()});el.addEventListener('blur',off);el.addEventListener('pointerdown',e=>{e.preventDefault();buttons[key]=true;el.classList.add('pressed');try{el.setPointerCapture(e.pointerId)}catch(_){}});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,off))};['left','right','up','down','jump','power','breathe'].forEach(k=>bindHold(k,k));$('power')?.addEventListener('click',()=>game.scene.getScene('Adventure').action());$('dash')?.addEventListener('click',()=>game.scene.getScene('Adventure').dash());$('switch')?.addEventListener('click',()=>game.scene.getScene('Adventure').swap());document.querySelectorAll('.hero-option').forEach(b=>b.addEventListener('click',()=>{const s=game.scene.getScene('Adventure');if(kind!=='echo'||s.completed)return;let count=0;while(s.hero!==b.dataset.hero&&count++<3)s.swap()}));$('mute')?.addEventListener('click',e=>{let s=game.scene.getScene('Adventure');s.muted=!s.muted;if(cashMusic){cashMusic.muted=s.muted;syncCashMusic();}e.currentTarget.textContent=s.muted?'🔇 Sound off':'🔊 Sound on'});$('music')?.addEventListener('click',event=>{const scene=game.scene.getScene('Adventure');scene.musicOn=cashMusic?(cashMusicEnabled=!cashMusicEnabled):!scene.musicOn;if(cashMusic)syncCashMusic();event.currentTarget.setAttribute('aria-pressed',String(scene.musicOn));event.currentTarget.textContent=scene.musicOn?'Music on':'Music off';});const clearInputs=()=>{for(const key of Object.keys(buttons)){buttons[key]=false;$(key)?.classList.remove('pressed')}const active=game.scene.getScene('Adventure');if(active.showcase){active.showcase.partnerDashPressed=false;active.showcase.partnerJumpPressed=false;}active.input.keyboard?.resetKeys()};window.addEventListener('blur',clearInputs);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInputs();syncCashMusic()});const scene=()=>game.scene.getScene('Adventure');
$('cash-boss-shortcut')?.addEventListener('click',()=>scene()?.enterCashArena(true));
$('cash-combo-retry')?.addEventListener('click',()=>{
 const active=scene();
 if(!active?.player)return;
 active.cashChallenge=null;
 active.level=0;
 active.loadLevel();
});
$('cash-hero')?.addEventListener('change',()=>{if(scene()?.player)scene().loadLevel();});
$('cash-partner')?.addEventListener('change',()=>{if(scene()?.player)scene().loadLevel();});
$('cash-coop')?.addEventListener('change',()=>{if(scene()?.player)scene().loadLevel();});
bindCheckIn();
document.addEventListener('ssb-feeling',event=>{
 const active=scene();
 if(active)active.feeling=event.detail;
});
document.querySelector('#dismiss-callout')?.addEventListener('click',()=>{
 $('method-callout').hidden=true;
});
bindGameUI({
 pause(){clearInputs();cashMenuPaused=true;syncCashMusic();game.scene.pause('Adventure');},
 resume(){clearInputs();cashMenuPaused=false;syncCashMusic();game.scene.resume('Adventure');},
 restart(){scene().loadLevel();},
 resetProgress(){progress.reset();if(kind==='cash'){try{for(const suffix of ['',':1',':2',':3'])localStorage.removeItem('sparkle-play-lab:cash-stars'+suffix);for(let chapter=0;chapter<levels.cash.length;chapter++){localStorage.removeItem('sparkle-play-lab:cash-portal:'+chapter);localStorage.removeItem('sparkle-play-lab:cash-medals:'+chapter);}localStorage.removeItem('sparkle-play-lab:maplewood-medal');for(const key of Object.keys(localStorage))if(key.startsWith('sparkle-play-lab:cash-best:'))localStorage.removeItem(key);}catch{}}scene().level=0;scene().loadLevel();},
 getDashCharge(){const active=scene();return active&&(kind==='cash'||active.hero==='cash')?active.charge:null;}
});
$('echo-method')?.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');
 if(button&&!button.hidden)scene()?.methodAction(button.dataset.action);
});
if(new URLSearchParams(location.search).get('test')==='1'){
 window.__SSB_TEST__=Object.freeze({
  state(){const active=scene();return {ready:!!active?.player,chapter:active?.level,hero:active?.hero,partner:active?.showcase?.partnerHero,scoutTypes:[...new Set(active?.showcase?.hazards.map(h=>h.type))],completed:!!active?.completed,step:active?.echoStep,lamps:active?.showcase?.lamps.length,cameraX:active?.cameras.main.scrollX,x:active?.player?.x,y:active?.player?.y};},
  hold(action,down){if(['left','right','up','down','jump','power','breathe'].includes(action))buttons[action]=!!down;},
  press(action){const active=scene();if(active?.player&&['action','dash','swap','loadLevel'].includes(action))active[action]();}
 });
}
setStatus(info.desc)}
if(kind==='cash'){
 const difficulty=$('echo-mode');
 const difficultyKey='sparkle-play-lab:cash:tier';
 try{
  const saved=localStorage.getItem(difficultyKey);
  if([...difficulty.options].some(option=>option.value===saved))difficulty.value=saved;
 }catch{}
 const syncPartner=()=>{$('cash-player-two').hidden=!$('cash-coop').checked;};
 $('cash-partner').value='kairo';
 $('cash-coop').addEventListener('change',syncPartner);
 syncPartner();
 const start=(practice,challenge=-1)=>{
  challengeOnBoot=challenge;
  try{localStorage.setItem(difficultyKey,difficulty.value);}catch{}
  if(challenge===1){$('cash-hero').value='cash';$('cash-partner').value='kairo';}
  practiceOnBoot=practice;
  document.body.classList.add('cash-playing');
  $('status').hidden=false;
  $('cash-playfield').hidden=false;
  $('load-panel').hidden=false;
  $('cash-start').hidden=true;
  $('cash-playfield').querySelector('.arena-menu').append($('cash-boss-shortcut'));
  setStatus('Loading game engine…');
  unlockEffects();
  syncCashMusic();
  init();
 };
 $('cash-start').addEventListener('click',()=>start(false),{once:true});
 document.querySelectorAll('[data-cash-challenge]').forEach(button=>button.addEventListener('click',()=>start(false,Number(button.dataset.cashChallenge))));
 $('cash-boss-shortcut').addEventListener('click',()=>{if(!game)start(true);});
}else init();
})();
