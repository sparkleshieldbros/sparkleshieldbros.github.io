export function bindCheckIn(){
 const panel=document.querySelector('#check-in');
 if(!panel)return;
 panel.addEventListener('click',event=>{
  const choice=event.target.closest('[data-feeling]');
  if(!choice)return;
  document.dispatchEvent(new CustomEvent('ssb-feeling',{detail:choice.dataset.feeling}));
  panel.hidden=true;
 });
}
let count=0,timer;
export function showMethodCallout(step){
 const panel=document.querySelector('#method-callout');
 if(!panel||count>=3)return;
 count++;
 panel.querySelector('span').textContent=step==='Breathe'?'◯ Breathe · Hold to fill':'✦ Notice · Look for clues';
 panel.hidden=false;
 clearTimeout(timer);
 timer=setTimeout(()=>{panel.hidden=true;},2600);
}
