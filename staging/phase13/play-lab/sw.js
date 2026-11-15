importScripts('./offline-files.js');
const scope=new URL(self.registration.scope);
const prefix='ssb-offline:'+scope.pathname+':';
const version=prefix+self.OFFLINE_VERSION;
const assets=new Set(self.OFFLINE_FILES);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(version).then(cache=>cache.addAll(
  [...assets].map(path=>new Request(new URL(path,scope),{cache:'reload'}))
 )).catch(async error=>{await caches.delete(version);throw error;}));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(prefix)&&key!==version)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{if(event.data==='activate-update')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 let path=url.pathname.slice(scope.pathname.length);
 if(!path||path.endsWith('/'))path+='index.html';
 if(!assets.has(path))return;
 event.respondWith(caches.open(version).then(async cache=>
  (await cache.match(new URL(path,scope)))||fetch(event.request)));
});
