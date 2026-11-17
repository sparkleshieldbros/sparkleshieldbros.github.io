export const expansion=[
 {title:'Sparkle Grid Gardens', districts:['Glowing Allotments','Trellis Run','Lantern Beds','Garden Heart'],pages:[3,9,3,25],scout:'trellis-scout',color:0x94e4a2,reach:50,lift:18,spread:[-.38,.38],spring:460},
 {title:'Mural Flight',districts:['Painted Alley','Kite Bridges','Wall of Heroes','Mural Summit'],pages:[11,25,11,9],scout:'kite-scout',color:0x95edff,reach:102,lift:65,spread:[-.18,0,.18],spring:560},
 {title:'Echo Storm',districts:['Violet Front','Thunder Steps','Sparkline','Storm Eye'],pages:[13,17,13,21],scout:'storm-scout',color:0xdb9fff,reach:70,lift:32,spread:[-.55,0,.55],spring:480},
 {title:'Shadow Courtyard',districts:['Moon Gate','Shadow Passage','Broken Ring','Midnight Court'],pages:[21,17,21,13],scout:'veil-scout',color:0x9ab6ff,reach:88,lift:9,spread:[-.11,.11],spring:585},
 {title:'Lantern Homecoming',districts:['Golden Walk','Jubilee Crossing','Lantern Canopy','Maplewood Heart'],pages:[25,27,9,3],scout:'jubilee-scout',color:0xffc883,reach:68,lift:51,spread:[-.45,-.15,.15,.45],spring:510}
];

const attacks=[
 ['SEED RAIN','LOW THORN FAN','TRELLIS CROSS'],
 ['KITE DIVE','MURAL VOLLEY','SKY PINCER'],
 ['LIGHTNING LANES','THUNDER BURST','STORM WHEEL'],
 ['SHADOW STAIRS','MOON ARC','MIDNIGHT PINCER'],
 ['LANTERN CASCADE','JUBILEE FAN','GOLDEN CROWN'],
 ['CONVEYOR BARRAGE','FORGE SPRAY','CORE COLLISION']
];

export function expansionAttack(pattern,left,playerX){
 const index=pattern-12;
 const right=left+960;
 const x=Math.max(left+240,Math.min(right-240,playerX));
 const shot=(x,y,angle)=>({x,y,angle});
 const fans=(x,y,start,step,count)=>Array.from({length:count},(_,i)=>shot(x,y,start+(i-(count-1)/2)*step));
 const lanes=(offsets,y,angle)=>offsets.map(offset=>shot(x+offset,y,angle));
 const forms=[
  ()=>lanes([-168,-76,79,175],64,1.38),
  ()=>fans(left+66,482,-.22,.14,4),
  ()=>[...fans(left+60,326,.15,.22,3),...fans(right-60,449,Math.PI+.14,.22,3)],
  ()=>lanes([-215,-107,107,215],90,1.12),
  ()=>[...fans(left+72,225,.41,.2,4),...fans(right-75,292,2.68,.2,4)],
  ()=>lanes([-200,-120,0,120,200],492,-1.36),
  ()=>lanes([-220,-115,-28,76,190],42,Math.PI/2),
  ()=>fans(x,225,Math.PI/2,.39,6),
  ()=>fans(x,320,Math.PI/2,Math.PI/5,10),
  ()=>[358,405,458,488].map((y,i)=>shot(left+50+i*45,y,-.08)),
  ()=>fans(right-90,179,2.26,.23,6),
  ()=>[...fans(left+55,474,-.22,.17,4),...fans(right-55,335,2.92,.19,4)],
  ()=>[-225,-150,-75,75,150,225].map((offset,i)=>shot(x+offset,50+i*23,1.38+i*.07)),
  ()=>fans(x,503,-Math.PI/2,.32,7),
  ()=>[...lanes([-213,-70,70,213],52,Math.PI/2),...lanes([-152,0,152],501,-Math.PI/2)],
  ()=>[315,382,474].flatMap(y=>[shot(left+40,y,.08),shot(right-42,y-20,Math.PI-.08)]),
  ()=>[...fans(x-120,483,-1.25,.28,4),...fans(x+120,483,-1.9,.28,4)],
  ()=>[-188,0,188].flatMap(offset=>[shot(x+offset,64,Math.PI/2+offset/490),shot(x+offset,499,-Math.PI/2-offset/490)])
 ];
 return {label:attacks[Math.floor(index/3)][index%3],origins:forms[index]()};
}
