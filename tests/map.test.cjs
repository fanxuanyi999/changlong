const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const D=require('../park-map-data.js');
test('12 unique nodes and an unbroken, forward-only itinerary',()=>{
 assert.equal(D.nodes.length,12);assert.equal(new Set(D.nodes.map(n=>n.id)).size,12);assert.equal(D.segments.length,11);
 for(let i=0;i<11;i++){const s=D.segments[i];assert.equal(s.from,D.nodes[i].id);assert.equal(s.to,D.nodes[i+1].id);assert.deepEqual(s.points[0],[D.nodes[i].x,D.nodes[i].y]);assert.deepEqual(s.points.at(-1),[D.nodes[i+1].x,D.nodes[i+1].y]);}
});
test('all 144 source/destination pairs are continuous, correctly oriented, and do not mutate base route',()=>{
 const before=JSON.stringify(D.segments);
 for(let a=0;a<12;a++)for(let b=0;b<12;b++){
  const r=D.routeBetween(D.nodes[a].id,D.nodes[b].id);
  assert.equal(r.segments.length,Math.abs(b-a));assert.equal(r.nodes[0].id,D.nodes[a].id);assert.equal(r.nodes.at(-1).id,D.nodes[b].id);
  r.segments.forEach((e,i)=>{assert.equal(e.from,r.nodes[i].id);assert.equal(e.to,r.nodes[i+1].id);if(i)assert.deepEqual(r.segments[i-1].points.at(-1),e.points[0]);});
 }
 assert.equal(JSON.stringify(D.segments),before);assert.equal(D.routeBetween('missing','north'),null);
});
test('facilities have valid anchors and categories; schematic coordinates cannot masquerade as GPS',()=>{
 for(const f of D.facilities){assert.ok(D.nodes.some(n=>n.id===f.anchor));assert.ok(D.labels[f.type]);assert.equal(f.approximate,true);assert.ok(!('latitude' in f));}
 assert.throws(()=>D.locationResult({coords:{latitude:NaN,longitude:113,accuracy:20}}));
 assert.equal(D.locationResult({coords:{latitude:23,longitude:113,accuracy:23.7},timestamp:123}).accuracy,24);
});
function worker(){
 const handlers={},stores=new Map();let online=true;const origin='https://example.test',scope=origin+'/changlong/';
 const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {async addAll(urls){for(const u of urls){const file=new URL(u).pathname.replace('/changlong/','')||'index.html';assert.ok(fs.existsSync(path.join(__dirname,'..',file)),file+' exists');store.set(u,new Response(file));}},async match(req){const key=typeof req==='string'?req:req.url;return store.get(key)?.clone();},async put(req,res){store.set(typeof req==='string'?req:req.url,res);}};},async keys(){return [...stores.keys()]},async delete(key){stores.delete(key)}};
 const self={registration:{scope},location:{origin},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(n,fn)=>handlers[n]=fn};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),{self,caches,URL,Response,fetch:async()=>{if(!online)throw new Error('offline');return new Response('network');}});
 return {handlers,stores,caches,setOffline:()=>online=false,async event(type,event={}){let promise;handlers[type]({...event,waitUntil:p=>promise=p,respondWith:p=>promise=p});return promise;},scope};
}
test('PWA caches every local dependency including the registration script and works at /changlong/',async()=>{
 const w=worker();await w.event('install');w.stores.set('other-site-cache',new Map());await w.event('activate');assert.ok(w.stores.has('other-site-cache'));w.setOffline();
 for(const file of ['index.html','park-map.js','park-map-data.js','park-map.css','pwa.js','assets/park-illustration.svg']){
  const res=await w.event('fetch',{request:{url:w.scope+file,method:'GET',mode:file.endsWith('html')?'navigate':'cors'}});assert.ok(res.ok);assert.equal(await res.text(),file);
 }
 const fallback=await w.event('fetch',{request:{url:w.scope+'unknown-page',method:'GET',mode:'navigate'}});assert.equal(await fallback.text(),'index.html');
 assert.equal(await w.event('fetch',{request:{url:'https://thirdparty.test/map.js',method:'GET',mode:'cors'}}),undefined);
 assert.equal(await w.event('fetch',{request:{url:w.scope+'missing.js',method:'GET',mode:'cors'}}),undefined);
});
test('GPS success requests node calibration; denial, unavailable and timeout leave manual location usable',()=>{
 for(const result of ['success',1,2,3]){
  let Element,options,calibrations=0;
  const button={disabled:false};
  const navigator={geolocation:{getCurrentPosition(success,error,opts){options=opts;result==='success'?success({coords:{latitude:23,longitude:113,accuracy:30},timestamp:123}):error({code:result});}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../park-map.js'),'utf8'),{window:{PARK_MAP:D,isSecureContext:true},location:{hash:''},HTMLElement:class{},customElements:{define(name,cls){Element=cls;}},navigator});
  const el=new Element();el.locationRequest=0;el.pendingLocation=false;el.querySelector=()=>button;el.say=t=>el.lastMessage=t;el.calibration=()=>calibrations++;
  el.locate();assert.equal(button.disabled,false);assert.equal(el.pendingLocation,false);assert.equal(options.timeout,12000);assert.equal(options.enableHighAccuracy,true);
  if(result==='success'){assert.equal(calibrations,1);assert.equal(el.geo.accuracy,30);assert.equal(el.current,undefined);}else {assert.equal(calibrations,0);assert.match(el.lastMessage,/校准位置/);assert.equal(el.current,undefined);}
 }
});
