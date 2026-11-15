if('serviceWorker' in navigator&&window.isSecureContext){
 const status=document.createElement('p');
 status.setAttribute('role','status');
 document.querySelector('main')?.append(status);
 const script=new URL('./sw.js',import.meta.url);
 let updating=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload();});
 navigator.serviceWorker.register(script).then(registration=>{
  function showUpdate(){
   if(!registration.waiting||status.querySelector('button'))return;
   status.textContent='A Play Lab update is ready. ';
   const button=document.createElement('button');
   button.textContent='Reload to update';
   button.addEventListener('click',()=>{updating=true;registration.waiting?.postMessage('activate-update');});
   status.append(button);
  }
  showUpdate();
  registration.addEventListener('updatefound',()=>{
   registration.installing?.addEventListener('statechange',event=>{
    if(event.target.state==='installed')showUpdate();
    if(event.target.state==='redundant'&&!registration.active)status.textContent='Offline download incomplete. Reload while connected.';
   });
  });
  navigator.serviceWorker.ready.then(()=>{if(!registration.waiting)status.textContent='Ready to play offline on this browser.';});
 }).catch(()=>{status.textContent='Offline play is unavailable in this browser.';});
}
