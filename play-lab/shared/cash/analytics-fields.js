export const EVENTS=new Set(['page_view','game_loaded','game_started','chapter_started','chapter_completed','game_completed','game_restarted','game_over','score_submitted','share_clicked','share_completed','score_image_saved','checkpoint_reached','life_lost','hero_selected','game_error']);
const enums={
 difficulty:['practice','adventurer','challenge'],
 mode:['solo','co-op'],rank:['S','A','B','C','D'],
 hero:['cash','kairo','mom','dad','ninja'],
 cause:['scout shot','scout contact','missed landing','escort shot','Ogre shot'],
};
export function eventFields(params={}){
 const clean={};
 for(const [key,values] of Object.entries(enums))if(values.includes(params[key]))clean[key]=params[key];
 for(const [key,max] of Object.entries({chapter:10,score:32800,checkpoint:3,duration_seconds:86400,life_losses:1000})){
  if(typeof params[key]==='number'&&Number.isFinite(params[key]))clean[key]=Math.min(max,Math.max(0,Math.round(params[key])));
 }
 return clean;
}
export function campaignFields(search=''){
 const query=new URLSearchParams(search),clean={};
 const values={
  utm_source:['facebook','instagram','linkedin','substack','qr','youtube'],
  utm_medium:['organic_social','email','referral','qr'],
  utm_campaign:['coin_dash_high_score_v1','coin_dash_gameplay_v1','coin_dash_family_v1'],
 };
 for(const [key,allowed] of Object.entries(values)){
  const value=query.get(key);if(allowed.includes(value))clean[key==='utm_campaign'?'campaign_name':key.replace('utm_','campaign_')]=value;
 }
 return clean;
}
