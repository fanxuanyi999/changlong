/* Scoped to the existing GitHub Pages /changlong/ site; no CDN dependencies. */
const VERSION='day2-map-v1-20260922-2';
const PREFIX='changlong-'+self.registration.scope;
const CACHE=PREFIX+VERSION;
const FILES=['./','./index.html','./style.css','./icons.js','./itinerary.js','./app.js','./packing.js','./park-map-data.js','./park-map.js','./park-map.css','./pwa.js','./manifest.webmanifest','./assets/park-illustration.svg','./assets/app-icon-192.png','./assets/app-icon-512.png','./assets/safari.webp','./assets/tiger.webp','./assets/restaurant.webp','./assets/panda.webp','./assets/lobby.webp','./assets/koala.webp','./assets/hotel.webp','./assets/giraffe.webp','./assets/circus.webp','./assets/cable.webp','./assets/cablewide.webp','./offline.html'];
const urls=FILES.map(f=>new URL(f,self.registration.scope).href);
async function precache(){const cache=await caches.open(CACHE);await cache.addAll(urls);}
self.addEventListener('install',event=>event.waitUntil(precache().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 // Never return HTML for missing JS/images; only same-scope navigation gets the shell fallback.
 const known=urls.includes(url.origin+url.pathname);
 if(!known&&req.mode!=='navigate')return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try{const fresh=await fetch(req);if(fresh.ok){try{await cache.put(req,fresh.clone());}catch{/* A full cache must not break a successful online response. */}return fresh;}const saved=await cache.match(req,{ignoreSearch:true});return saved||fresh;}
   catch{const saved=await cache.match(req,{ignoreSearch:true});if(saved)return saved;if(req.mode==='navigate')return (await cache.match(new URL('index.html',self.registration.scope).href))||Response.error();return Response.error();}
 })());
});
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_OFFLINE')event.waitUntil(precache().then(()=>event.ports[0]?.postMessage({ok:true})).catch(()=>event.ports[0]?.postMessage({ok:false})));});
