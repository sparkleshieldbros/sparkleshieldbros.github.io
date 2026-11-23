import {EVENTS,eventFields,campaignFields} from './analytics-fields.js';
const ID='G-LD7XH6WBYE';
const KEY='ssb:analytics-choice';
let enabled=false;
let installed=false;
function choice(){try{return localStorage.getItem(KEY);}catch{return null;}}
export function track(name,params={}){
 if(!enabled||!EVENTS.has(name))return;
 const clean={game_name:'coin_dash',page_location:location.origin+location.pathname,page_referrer:'',send_to:ID};
 Object.assign(clean,campaignFields(location.search),eventFields(params));
 window.gtag('event',name,clean);
}
function enable(){
 if(enabled||!['sparkleshieldbros.github.io','127.0.0.1','localhost'].includes(location.hostname))return;
 enabled=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('js',new Date());
 window.gtag('config',ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,ignore_referrer:true,cookie_expires:86400,cookie_update:false,page_location:location.origin+location.pathname,page_referrer:''});
 // Local verification exercises the queue without sending developer traffic.
 if(location.hostname==='sparkleshieldbros.github.io'){
  const script=document.createElement('script');script.async=true;
  script.src='https://www.googletagmanager.com/gtag/js?id='+ID;
  document.head.append(script);
 }
 window['ga-disable-'+ID]=false;
 track('page_view');
}
export function installAnalytics(){
 if(installed)return;
 installed=true;
 const details=document.createElement('details');
 const title=document.createElement('summary');title.textContent='Usage measurement & privacy';
 const text=document.createElement('p');
 text.textContent='We use Google Analytics to understand game use. Analytics uses browser cookies and identifiers, plus connection and device information. Analytics cookies expire after one day. Advertising features are disabled. You can turn measurement off below. Gameplay does not require names or accounts.';
 const stop=document.createElement('button');stop.type='button';stop.textContent='Turn usage measurement off';
 const status=document.createElement('p');status.setAttribute('role','status');
 details.append(title,text,stop,status);document.querySelector('main')?.append(details);
 // Preserve an explicit prior refusal rather than reversing the visitor choice.
 if(choice()!=='no')enable();
 status.textContent=enabled?'Google Analytics measurement is on.':'Usage measurement is off.';
 stop.hidden=!enabled;
 stop.onclick=()=>{
  try{localStorage.setItem(KEY,'no');}catch{}
  enabled=false;window['ga-disable-'+ID]=true;location.reload();
 };
 window.addEventListener('error',()=>track('game_error'));
 window.addEventListener('unhandledrejection',()=>track('game_error'));
}
