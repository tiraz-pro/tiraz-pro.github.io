/* طراز ريموت — كاش بسيط: الصدفة من الكاش، البيانات من الشبكة */
const V='tz-r-v1';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET') return;
  // بيانات الـAPI وصور جوجل: الشبكة الأول
  if(u.hostname.includes('script.google.com')||u.hostname.includes('drive.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      if(res.ok && u.origin===location.origin){
        const cl=res.clone(); caches.open(V).then(c=>c.put(e.request,cl));
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
