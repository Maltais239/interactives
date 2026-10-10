const CACHE='darrens-rome-public-menus5';
const FILES=["./", "./index.html", "./styles.css?v=menus5", "./data.js?v=menus5", "./speaking-data.js?v=menus5", "./menu-data.js?v=menus5", "./app.js?v=menus5", "./buildings-data.js?v=menus5", "./buildings.js?v=menus5", "./manifest.webmanifest", "./assets/building-01.webp", "./assets/building-02.webp", "./assets/building-03.webp", "./assets/building-04.webp", "./assets/building-05.webp", "./assets/building-06.webp", "./assets/building-07.webp", "./assets/building-08.webp", "./assets/building-09.webp", "./assets/building-10.webp", "./assets/building-11.webp", "./assets/building-12.webp", "./assets/coffee.webp", "./assets/icon.svg", "./assets/place-baptistery.webp", "./assets/place-caracalla.webp", "./assets/place-caserta.webp", "./assets/place-constantine.webp", "./assets/place-croce.webp", "./assets/place-deste.webp", "./assets/place-forum.webp", "./assets/place-giotto.webp", "./assets/place-hadrian.webp", "./assets/place-lateran.webp", "./assets/place-maggiore.webp", "./assets/place-naples-cathedral.webp", "./assets/place-navona.webp", "./assets/place-novella.webp", "./assets/place-ostia-capitolium.webp", "./assets/place-ostia-theatre.webp", "./assets/place-ovo.webp", "./assets/place-paola.webp", "./assets/place-pisa-baptistery.webp", "./assets/place-pisa-cathedral.webp", "./assets/place-pisa-tower.webp", "./assets/place-pompeii-apollo.webp", "./assets/place-pompeii-arena.webp", "./assets/place-pompeii-forum.webp", "./assets/place-ponte.webp", "./assets/place-spanish.webp", "./assets/place-trajan.webp", "./assets/place-trastevere.webp", "./assets/place-trevi.webp", "./assets/place-vesta.webp", "./assets/rome-hero.webp"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('darrens-rome-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
