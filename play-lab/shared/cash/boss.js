const tiers={practice:[1150,1250],adventurer:[880,800],challenge:[690,520]};
export function advanceBossClock(state,elapsed,tier,random=Math.random){
 state.clock-=elapsed;
 if(state.clock>0)return null;
 const [warning,recovery]=tiers[tier]||tiers.practice;
 const finalLife=state.ogreLives===1;
 if(!state.warning){
  state.warning=true;
  state.clock=warning*(finalLife?.88:1);
  return 'windup';
 }
 state.warning=false;
 state.clock=recovery*(finalLife?.78:1)+random()*210;
 return 'fire';
}
export function nextBossPattern(current,lives,random=Math.random){
 const choices=(lives===2?[0,1]:[0,1,2,3,4]).filter(pattern=>pattern!==current);
 return choices[Math.floor(random()*choices.length)];
}
export const OGRE_HITS_PER_LIFE=50;
export function bossHit(damage,guarded,charged,superDash=false,hitsPerLife=OGRE_HITS_PER_LIFE){
 const blocked=guarded&&!charged&&!superDash;
 const next=damage+(superDash?5:charged?4:blocked?0:1);
 return {damage:next,energy:Math.max(0,Math.ceil((hitsPerLife-next)*100/hitsPerLife)),blocked};
}

const chapterArsenals=[
 [0,1,5], // Ground bolts, fan, returning crescent
 [3,6,7], // Falling crystals, rising sparks, diagonal rain
 [2,4,8], // Tracking orbs, crossfire, rotating nova
 [5,7,8]  // Factory remix
];
export function chapterBossPattern(chapter,current,lives,random=Math.random){
 const arsenal=chapterArsenals[chapter]||chapterArsenals[0];
 if(lives===1&&!arsenal.slice(0,2).includes(current)&&current!==arsenal[2])return arsenal[2];
 const choices=arsenal.slice(0,lives===2?2:3).filter(pattern=>pattern!==current);
 return choices[Math.floor(random()*choices.length)];
}
