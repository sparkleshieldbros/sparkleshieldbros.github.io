const musicThemes={
 bubble:[261.63,329.63,392,0,440,392,329.63,0],
 cash:[196,196,293.66,246.94,196,329.63,293.66,0],
 ninja:[220,0,261.63,293.66,0,261.63,196,0],
 echo:[164.81,0,196,246.94,220,0,196,0]
};
export function playMusicBeat(scene,dt,kind){
 if(!scene.musicOn||scene.muted||scene.completed)return;
 scene.musicWait=(scene.musicWait||0)-dt;
 if(scene.musicWait>0)return;
 scene.musicWait=scene.feeling==='busy'?400:kind==='cash'?220:330;
 const notes=musicThemes[kind];
 const step=scene.musicStep||0;
 scene.musicStep=(step+1)%notes.length;
 if(notes[step])tone(scene,notes[step],.19,.014);
}
let effectsContext;
export function unlockEffects(){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)return;
 try{
  effectsContext??=new Context();
  if(effectsContext.state!=='running')effectsContext.resume().catch(()=>{});
 }catch{}
}
export function tone(scene,f=440,d=.09,volume=.055,wave='sine'){
 if(scene.muted)return;
 const dedicated=document.body.dataset.game==='cash'&&effectsContext;
 const ctx=dedicated||scene.sound?.context;
 if(!ctx)return;
 try{
  if(ctx.state!=='running')ctx.resume().catch(()=>{});
  const now=ctx.currentTime;
  const oscillator=ctx.createOscillator();
  const gain=ctx.createGain();
  oscillator.type=wave;
  oscillator.frequency.setValueAtTime(f,now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(80,f*.65),now+d);
  gain.gain.setValueAtTime(Math.min(.18,volume*(dedicated?1.6:1)),now);
  gain.gain.exponentialRampToValueAtTime(.001,now+d);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  oscillator.start(now);
  oscillator.stop(now+d);
 }catch{}
}
