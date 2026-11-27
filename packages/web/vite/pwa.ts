import { createHash } from "node:crypto";
import type { Plugin } from "vite";
export default function pwa(): Plugin {
  return {
    name: "keycrown-offline",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .filter((p) => p.startsWith("assets/"))
        .sort();
      const key = createHash("sha256").update(files.join(",")).digest("hex").slice(0, 12);
      const assets = [
        "/",
        "/manifest.webmanifest",
        "/crown.svg",
        "/crown-192.png",
        "/crown-512.png",
        "/fonts/manrope.woff2",
        "/fonts/jetbrains.woff2",
        ...files.map((x) => `/${x}`),
      ];
      this.emitFile({
        type: "asset",
        fileName: "keycrown-sw.js",
        source: `
 const CACHE='keycrown-${key}';const FILES=${JSON.stringify(assets)};
 self.addEventListener('install', e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
 self.addEventListener('activate', e=>e.waitUntil(caches.keys().then(list=>Promise.all(list.filter(x=>x.startsWith('keycrown-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
 self.addEventListener('fetch', e=>{
   const r=e.request;const u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
   if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.open(CACHE).then(c=>c.match('/'))));return;}
   if(FILES.includes(u.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(u.pathname))||fetch(r)));
 });`,
      });
    },
  };
}
