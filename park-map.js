(function(){
 'use strict';
 const D=window.PARK_MAP;
 const svgNS='http://www.w3.org/2000/svg';
 const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const line=pts=>pts.map((p,i)=>`${i?'L':'M'}${p.join(',')}`).join(' ');
 const symbol={wc:'WC',food:'餐',cable:'缆',rest:'歇'};
 const pathFor=p=>`<path d="${line(p)}"/>`;
 function arrow(points,color){
   const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
   let mid=lengths.reduce((a,b)=>a+b,0)*.55, i=0;
   while(i<lengths.length-1&&mid>lengths[i])mid-=lengths[i++];
   const a=points[i],b=points[i+1],t=mid/(lengths[i]||1),x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
   const angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
   return `<path d="M-8,-7 L3,0 -8,7" transform="translate(${x},${y}) rotate(${angle})" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
 }
 class DayTwoMap extends HTMLElement{
  connectedCallback(){
   if(this.initialized)return;this.initialized=true;this.layer=null;this.current=null;this.target=null;this.focusReturn=null;this.geo=null;this.pendingLocation=false;this.locationRequest=0;this.pointers=new Map();this.view={x:0,y:0,w:1200,h:900};
   try{const s=JSON.parse(localStorage.getItem('changlong-map-current'));if(s&&Date.now()-s.at<6*3600000&&D.nodes.some(n=>n.id===s.id)){this.current=s.id;this.currentAt=s.at;}}catch{}
   this.innerHTML=`<section class="pm-frame" aria-label="Day2园内互动地图"><header class="pm-heading"><div><h3>今天，跟着这条线走</h3><p>长隆野生动物世界 · 9月25日 · 12站亲子慢游</p></div><span>15:30 收尾 · 20:00 大马戏</span></header>
    <div class="pm-status"><div class="pm-current-text"></div><button type="button" data-action="calibrate">校准位置</button></div>
    <div class="pm-stage"><svg class="pm-map" viewBox="0 0 1200 900" role="group" aria-label="园区互动路线示意图，可拖拽和双指缩放"><image href="assets/park-illustration.svg" width="1200" height="900"/><g class="pm-paths"></g><g class="pm-nodes"></g><g class="pm-facilities"></g><g class="pm-you"></g></svg><div class="pm-map-key"><i></i><span>① → ⑫ · 单向游览顺序</span></div><div class="pm-zoom"><button type="button" data-action="zoom-in" aria-label="放大地图">＋</button><button type="button" data-action="zoom-out" aria-label="缩小地图">−</button><button type="button" data-action="fit" aria-label="显示全图">全图</button></div><div class="pm-hint">区域示意 · 按现场路牌行走 · 可拖拽 / 双指缩放</div><section class="pm-sheet" aria-label="点位详情" hidden></section></div>
    <div class="pm-layers" role="group" aria-label="地图图层，每次只显示一类设施"><button type="button" data-layer="route" aria-pressed="true"><span class="pm-glyph">↗</span>主路线</button><button type="button" data-layer="wc" aria-pressed="false"><span class="pm-glyph">WC</span>厕所</button><button type="button" data-layer="food" aria-pressed="false">${icon('tools-kitchen-2')}餐饮</button><button type="button" data-layer="cable" aria-pressed="false">${icon('route')}缆车</button><button type="button" data-layer="rest" aria-pressed="false">${icon('coffee')}休息点</button><button type="button" data-action="locate">${icon('map-pin')}定位</button></div>
    <div class="pm-info" aria-live="polite"></div><div class="pm-guidance" aria-live="polite" hidden></div>
    <div class="pm-controls"><label>找一站 <select aria-label="选择地图节点"><option value="">点击地图或选择节点</option>${D.nodes.map(n=>`<option value="${n.id}">${n.number} · ${n.name}</option>`).join('')}</select></label><button type="button" data-action="offline">保存到离线</button></div><p class="pm-message" role="status" aria-live="polite"></p></section>
    <details class="pm-source"><summary>地图、定位与离线说明</summary><p>底图根据<a href="${D.source}" target="_blank" rel="noopener">官网园区导览图</a>转绘为空间关系示意，不是比例地图。设施标记为所在区域，未核验精确入口、距离与实时开放状态；休息点是建议停留区域。<a href="${D.mapSource}" target="_blank" rel="noopener">对照官网原图</a>。整理于2026-09-22。</p><p>浏览器定位仅在点击后申请，坐标仅在本机内存中使用。插画无可靠经纬度配准，获取GPS后需手动校准到节点；蓝点表示你确认的位置，不自动跟随。手动位置最多保留6小时，移动后请更新。路线是游览顺序，实际步道以路牌为准。</p><p>首次联网打开并显示“离线已就绪”后，可离线使用地图、节点详情和文字攻略。外部地图、官网与实时定位不保证离线可用。浏览器清理站点数据会移除缓存。原“保存离线版”仍是文字攻略文件；互动地图请使用此处离线缓存。</p></details>`;
   this.svg=this.querySelector('.pm-map');this.sheet=this.querySelector('.pm-sheet');
   this.addEventListener('click',this.onClick=e=>this.click(e));
   this.addEventListener('change',this.onChange=e=>{if(e.target.matches('.pm-controls select')&&e.target.value)this.openNode(e.target.value,e.target);});
   this.addEventListener('keydown',this.onKey=e=>{if(e.key==='Escape'&&!this.sheet.hidden){this.closeSheet();e.stopPropagation();}if(['Enter',' '].includes(e.key)&&e.target.matches('[data-node],[data-facility]')){e.preventDefault();this.dragged=false;e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
   this.setupGestures();this.render();this.resizeObserver=new ResizeObserver(()=>{if(!this.target&&this.sheet.hidden)this.fit();});this.resizeObserver.observe(this.querySelector('.pm-stage'));
  }
  disconnectedCallback(){this.locationRequest++;this.resizeObserver?.disconnect();this.removeEventListener('click',this.onClick);this.removeEventListener('change',this.onChange);this.removeEventListener('keydown',this.onKey);}
  say(t){this.querySelector('.pm-message').textContent=t;}
  render(){
   const c=D.nodes.find(n=>n.id===this.current),next=c&&D.nodes[c.number];
   this.querySelector('.pm-current-text').innerHTML=c?`<strong>当前 ${c.number} · ${html(c.name)}</strong><br><span>${next?`下一站 ${next.number} · ${html(next.name)}`:'15:30 收尾，按当日出口回酒店'} · 手动确认</span>`:'<strong>从北门开始，慢慢玩</strong><br><span>当前位置尚未确认 · 点节点可校准</span>';
   this.renderPaths();
   this.querySelector('.pm-nodes').innerHTML=D.nodes.map(n=>{const left=n.x>980;return `<g class="pm-node ${this.selected===n.id?'selected':''}" data-node="${n.id}" role="button" tabindex="0" aria-label="${n.number} ${html(n.name)} ${n.time}" transform="translate(${n.x},${n.y})"><circle r="28" fill="transparent"/><circle class="pm-pin" r="20"/><text class="pm-number">${n.number}</text><text class="pm-label" x="${left?-30:30}" y="-3" text-anchor="${left?'end':'start'}">${html(n.name)}</text><text class="pm-time" x="${left?-30:30}" y="18" text-anchor="${left?'end':'start'}">${n.time}</text></g>`}).join('');
   this.querySelector('.pm-facilities').innerHTML=D.facilities.filter(f=>f.type===this.layer).map(f=>`<g class="pm-facility" data-facility="${f.id}" data-type="${f.type}" role="button" tabindex="0" aria-label="${html(f.name)}，区域示意" transform="translate(${f.x},${f.y})"><circle r="24"/><text>${symbol[f.type]}</text></g>`).join('');
   this.querySelector('.pm-you').innerHTML=c?`<g transform="translate(${c.x},${c.y})"><circle r="30" fill="none" stroke="#1754c7" stroke-width="3" stroke-dasharray="5 4"/><circle cx="-25" cy="-24" r="7" fill="#1754c7" stroke="white" stroke-width="3"/><text x="-15" y="-31">你在这里 · 已校准</text></g>`:'';
   this.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layer===(this.layer||'route'))));
   const info=this.layer?`${D.labels[this.layer]} · ${D.facilities.filter(f=>f.type===this.layer).length}个${this.layer==='rest'?'建议区域':'参考点'} · ${this.layer==='cable'?'15:00–15:30可选，线路 / 上下站以当天为准':'点标记看详情；具体入口与开放以现场为准'}`:'只显示主路线与12个核心节点 · 时间为计划，随客流顺延';
   this.querySelector('.pm-info').textContent=info;
  }
  renderPaths(){
   const f=D.facilities.find(f=>f.id===this.target),dest=f?f.anchor:this.target,r=this.current&&dest?D.routeBetween(this.current,dest):null;
   const main=D.segments.map(s=>pathFor(s.points)).join('');
   let out=`<g fill="none" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">${main}</g><g fill="none" stroke="${r?'#c9cec2':'#c5532a'}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${main}</g>`;
   if(r){out+=`<g fill="none" stroke="#1754c7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${r.segments.map(s=>pathFor(s.points)).join('')}</g>`;out+=r.segments.map(s=>arrow(s.points,'#1754c7')).join('');if(f){const a=D.nodes.find(n=>n.id===f.anchor);out+=`<path d="M${a.x},${a.y}L${f.x},${f.y}" fill="none" stroke="#1754c7" stroke-width="3" stroke-dasharray="5 7"/>`;}}
   else out+=D.segments.map(s=>arrow(s.points,'#c5532a')).join('');
   this.querySelector('.pm-paths').innerHTML=out;
   this.querySelector('.pm-map-key span').textContent=r?'蓝色高亮 · 当前点 → 目标点':'① → ⑫ · 单向游览顺序';
  }
  click(e){
   const el=e.target.closest('[data-action],[data-layer],[data-node],[data-facility]');if(!el)return;
   if((el.dataset.node||el.dataset.facility)&&this.dragged){return;}
   if(el.dataset.node)return this.openNode(el.dataset.node,el);
   if(el.dataset.facility)return this.openFacility(el.dataset.facility,el);
   if(el.dataset.layer){this.layer=el.dataset.layer==='route'||this.layer===el.dataset.layer?null:el.dataset.layer;this.target=null;this.selected=null;this.querySelector('.pm-guidance').hidden=true;this.closeSheet(false);this.render();this.fit();return;}
   const a=el.dataset.action;
   if(a==='close')this.closeSheet();
   if(a==='fit')this.fit();
   if(a==='zoom-in')this.zoom(.72);
   if(a==='zoom-out')this.zoom(1.4);
   if(a==='calibrate')this.calibration(el);
   if(a==='set-current')this.setCurrent(el.dataset.id);
   if(a==='confirm-current')this.setCurrent(this.querySelector('.pm-calibration select').value);
   if(a==='clear-current'){this.current=null;this.target=null;this.pendingTarget=null;this.geo=null;try{localStorage.removeItem('changlong-map-current');}catch{}this.querySelector('.pm-guidance').hidden=true;this.closeSheet(false);this.render();this.fit();this.say('当前位置已清除，到达园区后再校准。');}
   if(a==='guide')this.guide(el.dataset.id);
   if(a==='route'){this.target=null;this.querySelector('.pm-guidance').hidden=true;this.render();this.fit();}
   if(a==='locate')this.locate();
   if(a==='offline')this.offline();
  }
  showSheet(content,trigger){this.focusReturn=trigger||this.focusReturn;this.sheet.innerHTML=`<button type="button" class="pm-sheet-close" data-action="close" aria-label="关闭点位详情">×</button>${content}`;this.sheet.hidden=false;this.querySelector('.pm-stage').scrollIntoView({block:'start',behavior:'instant'});this.sheet.querySelector('h4')?.focus({preventScroll:true});}
  closeSheet(restore=true){this.sheet.hidden=true;if(restore){const saved=this.focusReturn;if(saved?.isConnected)saved.focus({preventScroll:true});else this.querySelector('.pm-controls select').focus({preventScroll:true});}}
  openNode(id,trigger){
   const n=D.nodes.find(n=>n.id===id);if(!n)return;this.selected=id;this.render();
   const nearby=D.facilities.filter(f=>['wc','food'].includes(f.type)).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y));
   const near=['wc','food'].map(type=>nearby.find(f=>f.type===type));
   this.showSheet(`<p class="pm-overline">DAY 2 · 第 ${n.number} / 12 站</p><h4 tabindex="-1">${html(n.name)}</h4><div class="pm-facts"><div><small>建议到达</small><b>${n.time}</b></div><div><small>建议停留</small><b>${n.duration}</b></div></div><p>${n.note}</p><div class="pm-next">${D.nodes[n.number]?`下一站 → ${n.number+1} · ${D.nodes[n.number].name}`:'收尾 → 按当天可用出口与酒店接驳回程'}</div><p>附近设施参考 · 按插画区域，非实测步行距离</p><div class="pm-near">${near.map(f=>`<button type="button" data-facility="${f.id}">${symbol[f.type]} · ${f.name}</button>`).join('')}</div><div class="pm-actions"><button type="button" class="pm-primary" data-action="guide" data-id="${id}">从当前位置去这里</button><button type="button" data-action="set-current" data-id="${id}">我在这里</button></div>`,trigger);
   this.center(n,true);
  }
  openFacility(id,trigger){
   const f=D.facilities.find(f=>f.id===id);if(!f)return;this.layer=f.type;this.selected=null;this.render();
   const notes={wc:'厕所位置取自官网插画导览图的区域关系，具体入口、无障碍与开放情况请看路牌或询问工作人员。',food:'优先选择当前区域开放、等位短的餐厅。菜单、营业与供应以当天为准。',cable:'15:00–15:30可选休息观景。先确认当天开放线路、上下车站、预计乘坐与排队总时长，再决定是否乘坐；不预设返回南门。若无法在15:30前开始收尾，就跳过。',rest:'这是建议停留区域，不代表已核实的固定长椅或室内休息室；在现场选择有遮阴且不妨碍通行的位置。'};
   this.showSheet(`<p class="pm-overline">${D.labels[f.type]} · 区域参考</p><h4 tabindex="-1">${html(f.name)}</h4><p>${notes[f.type]}</p><div class="pm-next">靠近 ${D.nodes.find(n=>n.id===f.anchor).name} · 最后一段按现场指示</div><div class="pm-actions"><button type="button" class="pm-primary" data-action="guide" data-id="${id}">引导到附近区域</button><a href="https://uri.amap.com/search?keyword=${encodeURIComponent('广州长隆野生动物世界 '+f.name)}&city=广州&view=map" target="_blank" rel="noopener">在高德查找 ↗</a></div>`,trigger);this.center(f,true);
  }
  calibration(trigger){
   this.showSheet(`<div class="pm-calibration"><p class="pm-overline">位置校准</p><h4 tabindex="-1">你现在在哪一站？</h4><p>${this.geo?`GPS已获取，设备报告精度约 ${this.geo.accuracy} 米。插画不是比例地图，请确认所在节点后显示“你在这里”。`:'按身旁的园区路牌选择所在节点，地图将从这里引导。'}</p><label>当前位置<select aria-label="校准当前位置">${D.nodes.map(n=>`<option value="${n.id}" ${n.id===this.current?'selected':''}>${n.number} · ${n.name}</option>`).join('')}</select></label><p>请在到达该节点后确认；移动后需要更新，不会自动跟随。</p><div class="pm-actions"><button type="button" class="pm-primary" data-action="confirm-current">确认当前位置</button>${this.current?'<button type="button" data-action="clear-current">清除当前位置</button>':''}</div></div>`,trigger);
  }
  setCurrent(id){
   const n=D.nodes.find(n=>n.id===id);if(!n)return;this.current=id;this.currentAt=Date.now();
   try{localStorage.setItem('changlong-map-current',JSON.stringify({id,at:this.currentAt}));}catch{}
   this.closeSheet(false);this.render();this.center(n,false);this.say(`你在这里：${n.name}。已手动确认；移动后请更新位置。`);
   if(this.pendingTarget){const target=this.pendingTarget;this.pendingTarget=null;this.guide(target);}else if(this.target)this.guide(this.target);
  }
  guide(id){
   if(!this.current){this.pendingTarget=id;this.calibration(this.sheet.querySelector('[data-action=guide]'));this.say('先确认当前位置，再为你高亮路线。');return;}
   const f=D.facilities.find(f=>f.id===id),target=f||D.nodes.find(n=>n.id===id);if(!target)return;
   this.target=id;this.closeSheet(false);this.render();
   const r=D.routeBetween(this.current,f?f.anchor:id),guide=this.querySelector('.pm-guidance');guide.hidden=false;
   guide.innerHTML=`<b>${html(r.nodes[0].name)} → ${html(target.name)}</b><p>${r.segments.length?r.nodes.map(n=>`${n.number} ${html(n.name)}`).join(' → '):'已在目标所在区域。'}${f?' → 按路牌找设施入口（虚线仅指向区域）':''}</p><p>${r.reverse?'目标在已走过的路线上，蓝色箭头单独表示返回顺序；请核对现场可通行步道。':'蓝线表示建议游览顺序，转弯与步道按园内路牌；不提供未经核实的距离和分钟数。'}</p><button type="button" data-action="route">返回完整主路线</button>`;
   this.center(target,false);this.say('路线已高亮，可拖动查看途经节点。');
  }
  locate(){
   if(this.pendingLocation)return;if(!window.isSecureContext||!navigator.geolocation){this.say('此环境无法使用定位；请在HTTPS网站打开，或手动校准位置。');this.calibration();return;}
   this.pendingLocation=true;const request=++this.locationRequest;this.say('正在获取设备位置…');const btn=this.querySelector('[data-action=locate]');btn.disabled=true;
   const done=()=>{this.pendingLocation=false;btn.disabled=false;};
   navigator.geolocation.getCurrentPosition(p=>{if(request!==this.locationRequest)return;done();try{this.geo=D.locationResult(p);this.say(`GPS已获取，精度约${this.geo.accuracy}米。请确认所在节点完成插画定位。`);this.calibration(btn);}catch{this.say('定位结果无效，请手动校准。');}},e=>{if(request!==this.locationRequest)return;done();this.say(({1:'未获得定位授权',2:'暂时无法取得位置',3:'定位超时'})[e.code]+'，可使用“校准位置”继续。');},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
  }
  async offline(){
   if(!('serviceWorker' in navigator)||!window.isSecureContext){this.say('离线缓存需要HTTPS或本机预览环境。');return;}
   this.say('正在保存地图与攻略…');
   try{const reg=await navigator.serviceWorker.register('./sw.js');await Promise.race([navigator.serviceWorker.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),20000))]);const worker=reg.active||reg.waiting;if(!worker)throw new Error('not ready');const channel=new MessageChannel();const result=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('timeout')),20000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data.ok?resolve():reject(new Error('cache failed'));};});worker.postMessage({type:'CACHE_OFFLINE'},[channel.port2]);await result;this.say('离线已就绪：地图、点位详情和文字攻略已保存。可添加到手机主屏幕。');}catch{this.say('离线保存未完成，请保持联网后重试。');}
  }
  applyView(){const v=this.view;v.x=Math.max(-1200,Math.min(1800,v.x));v.y=Math.max(-900,Math.min(1350,v.y));this.svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);}
  fit(){const box=this.svg.getBoundingClientRect();if(!box.width||!box.height)return;const aspect=box.width/box.height;this.view=aspect>1200/900?{x:(1200-900*aspect)/2,y:0,w:900*aspect,h:900}:{x:0,y:(900-1200/aspect)/2,w:1200,h:1200/aspect};this.baseWidth=this.view.w;this.applyView();}
  center(n,sheet){const box=this.svg.getBoundingClientRect(),aspect=box.width/box.height||1;const w=Math.min(780,Math.max(440,box.width*1.25)),h=w/aspect;const desktop=window.matchMedia('(min-width:1000px)').matches;this.view={x:n.x-w*(sheet&&desktop?.72:.48),y:n.y-h*(sheet&&!desktop?.24:.45),w,h};this.applyView();}
  zoom(factor,point){const v=this.view,w=Math.max(260,Math.min((this.baseWidth||1200)*1.6,v.w*factor)),f=w/v.w;const p=point||{x:v.x+v.w/2,y:v.y+v.h/2};this.view={x:p.x-(p.x-v.x)*f,y:p.y-(p.y-v.y)*f,w,h:v.h*f};this.applyView();}
  mapPoint(x,y){const m=this.svg.getScreenCTM();return new DOMPoint(x,y).matrixTransform(m.inverse());}
  setupGestures(){
   this.svg.addEventListener('wheel',e=>{e.preventDefault();this.zoom(Math.exp(Math.max(-100,Math.min(100,e.deltaY))*.003),this.mapPoint(e.clientX,e.clientY));},{passive:false});
   this.svg.addEventListener('pointerdown',e=>{this.dragged=false;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});(e.target.closest('[data-node],[data-facility]')||this.svg).setPointerCapture(e.pointerId);this.gesture={view:{...this.view},pts:[...this.pointers.values()]};});
   this.svg.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...this.pointers.values()],g=this.gesture;if(!g)return;const b=this.svg.getBoundingClientRect();const ratio=g.view.w/b.width;
    if(pts.length===1&&g.pts.length===1){const dx=pts[0].x-g.pts[0].x,dy=pts[0].y-g.pts[0].y;if(Math.hypot(dx,dy)>5)this.dragged=true;this.view={...g.view,x:g.view.x-dx*ratio,y:g.view.y-dy*ratio};this.applyView();}
    else if(pts.length===2&&g.pts.length===2){this.dragged=true;const dist=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);const f=dist(g.pts)/Math.max(1,dist(pts));const w=Math.max(260,Math.min((this.baseWidth||1200)*1.6,g.view.w*f)),actual=w/g.view.w;const old={x:(g.pts[0].x+g.pts[1].x)/2-b.left,y:(g.pts[0].y+g.pts[1].y)/2-b.top},cur={x:(pts[0].x+pts[1].x)/2-b.left,y:(pts[0].y+pts[1].y)/2-b.top};this.view={x:g.view.x+old.x*ratio-cur.x*ratio*actual,y:g.view.y+old.y*ratio-cur.y*ratio*actual,w,h:g.view.h*actual};this.applyView();}
   });
   const end=e=>{this.pointers.delete(e.pointerId);if(this.pointers.size)this.gesture={view:{...this.view},pts:[...this.pointers.values()]};else this.gesture=null;};this.svg.addEventListener('pointerup',end);this.svg.addEventListener('pointercancel',end);this.svg.addEventListener('lostpointercapture',end);
  }
 }
 customElements.define('day-two-map',DayTwoMap);
 if(location.hash==='#day2-map'){setMode('detail',false);renderDay(1,false);requestAnimationFrame(()=>document.querySelector('day-two-map')?.scrollIntoView({block:'start'}));}
})();
