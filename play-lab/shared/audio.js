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
export function tone(scene,f=440,d=.09,volume=.055,wave='sine'){if(scene.muted)return;try{const ctx=scene.sound.context;if(ctx.state==='suspended')ctx.resume();let o=ctx.createOscillator(),g=ctx.createGain();o.type=wave;o.frequency.setValueAtTime(f,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(80,f*.65),ctx.currentTime+d);g.gain.setValueAtTime(volume,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
