const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const D=require('../park-map-data.js');
function mapHarness(){
 let Element;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../park-map.js'),'utf8'),{window:{PARK_MAP:D},location:{hash:''},HTMLElement:class{},customElements:{define(name,cls){Element=cls}}});
 const map=new Element(),events={},attrs={};map.dataset={};map.pointers=new Map();map.view={x:0,y:0,w:1200,h:900};map.baseWidth=1200;
 map.svg={addEventListener:(name,fn)=>events[name]=fn,getBoundingClientRect:()=>({left:0,top:0,width:600,height:450}),setAttribute:(key,value)=>attrs[key]=value,setPointerCapture:()=>{}};
 map.mapPoint=(x,y)=>({x:map.view.x+x*map.view.w/600,y:map.view.y+y*map.view.h/450});
 map.setupGestures();
 const event=(x,y,id=1)=>({clientX:x,clientY:y,pointerId:id,target:{closest:()=>null},preventDefault(){}});
 return {map,events,attrs,event};
}
test('shared viewport transforms all three layers; zoom changes label detail without modifying POIs',()=>{
 const {map,attrs}=mapHarness(),before=JSON.stringify(D);
 map.applyView();assert.equal(map.dataset.mapDetail,'area');
 map.zoom(.5);assert.equal(map.dataset.mapDetail,'detail');assert.equal(map.view.w,600);
 map.zoom(3);assert.equal(map.dataset.mapDetail,'overview');assert.ok(attrs.viewBox.includes(String(map.view.w)));
 assert.equal(JSON.stringify(D),before);
});
test('double-click and wheel preserve the map point under the pointer',()=>{
 const {map,events,event}=mapHarness();const fixed=map.mapPoint(200,180);
 events.dblclick(event(200,180));assert.ok(map.view.w<1200);
 assert.ok(Math.abs(map.mapPoint(200,180).x-fixed.x)<1e-8);assert.ok(Math.abs(map.mapPoint(200,180).y-fixed.y)<1e-8);
 events.wheel({...event(200,180),deltaY:-80});assert.ok(Math.abs(map.mapPoint(200,180).x-fixed.x)<1e-8);
 const w=map.view.w;events.dblclick({...event(200,180),target:{closest:()=>({})}});assert.equal(map.view.w,w,'POI double-click must not hijack point selection');
});
test('pan and pinch still share the original coordinate mapping; pointer cancellation cleans up',()=>{
 const {map,events,event}=mapHarness();
 events.pointerdown(event(100,100));events.pointermove(event(130,120));assert.equal(map.view.x,-60);assert.equal(map.view.y,-40);assert.equal(map.dragged,true);
 events.pointerup(event(130,120));assert.equal(map.pointers.size,0);
 map.view={x:0,y:0,w:1200,h:900};events.pointerdown(event(100,100,1));events.pointerdown(event(200,100,2));
 events.pointermove(event(300,100,2));assert.equal(map.view.w,600);assert.equal(map.view.h,450);
 events.pointercancel(event(100,100,1));events.pointerup(event(300,100,2));assert.equal(map.pointers.size,0);assert.equal(map.gesture,null);
});
test('fit and zoom respect bounds after visual layers are added',()=>{
 const {map}=mapHarness();map.fit();assert.equal(map.view.w,1200);assert.equal(map.view.h,900);
 map.zoom(.001);assert.equal(map.view.w,260);map.zoom(100);assert.equal(map.view.w,1920);
 map.view.x=99999;map.view.y=-99999;map.applyView();assert.equal(map.view.x,1800);assert.equal(map.view.y,-900);
});
