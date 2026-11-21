import {EVENTS,eventFields,campaignFields} from './analytics-fields.js';
const ID='G-LD7XH6WBYE';
const KEY='ssb:analytics-choice';
let enabled=false;
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
 const details=document.createElement('details');
 const title=document.createElement('summary');title.textContent='For grown-ups · Usage measurement';
 const text=document.createElement('p');text.textContent='Optional Google Analytics helps us measure game use. Google processes usage data and may use analytics cookies. Advertising features are disabled. Only allow this if you are a grown-up choosing for this browser.';
 const allow=document.createElement('button');allow.type='button';allow.textContent='Allow usage measurement';
 const decline=document.createElement('button');decline.type='button';decline.textContent='Keep measurement off';
 const status=document.createElement('p');status.setAttribute('role','status');
 details.append(title,text,allow,decline,status);document.querySelector('main')?.append(details);
 const update=()=>{status.textContent=enabled?'Usage measurement is on.':'Usage measurement is off.';};
 allow.onclick=()=>{try{localStorage.setItem(KEY,'yes');}catch{}enable();update();};
 decline.onclick=()=>{try{localStorage.setItem(KEY,'no');}catch{}enabled=false;window['ga-disable-'+ID]=true;location.reload();};
 if(choice()==='yes')enable();
 update();
 window.addEventListener('error',()=>track('game_error'));
 window.addEventListener('unhandledrejection',()=>track('game_error'));
}
