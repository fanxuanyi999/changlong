const photoNames={safari:'动物世界草原区',giraffe:'长颈鹿广场',tiger:'百虎山',panda:'熊猫观赏主题配图',koala:'考拉园',cable:'空中缆车与动物展区',hotel:'熊猫酒店外观',lobby:'熊猫酒店大堂',circus:'国际大马戏舞台',restaurant:'园内餐厅环境'};
const photoSources={hotel:'https://www.chimelong.com/gz/pandahotel/',lobby:'https://www.chimelong.com/gz/pandahotel/',circus:'https://www.chimelong.com/gz/circus/',restaurant:'https://www.chimelong.com/gz/safaripark/foodshopping/'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>(ICONS[n]||ICONS['map-pin']).replace('<svg ','<svg aria-hidden="true" focusable="false" class="icon" ');
const asset=n=>typeof EMBEDDED_PHOTOS!=='undefined'?EMBEDDED_PHOTOS[n]:`assets/${n}.webp`;
const image=(n,extra='')=>`<img src="${asset(n)}" alt="${photoNames[n]} · 长隆官网配图" loading="lazy" ${extra}>`;
const map=q=>`https://uri.amap.com/search?keyword=${encodeURIComponent(q)}&city=广州&view=map`;
function refs(keys){return `<div class="inline-source">${keys.map(k=>`<a href="${NOTES.sources[k][1]}" target="_blank" rel="noopener">${NOTES.sources[k][0]} ↗</a>`).join('')}</div>`}
const quickDays=[
 {day:1,date:'9月24日 · 周四',title:'广州，我们来啦',icon:'train',text:'<strong>17:18 厦门北 → 21:17 广州南</strong><br>商务7座前往宜程轻居，约22:00入住。今晚只做一件事：好好休息。',caption:'一夜过渡 · 宜程轻居',visual:'ticket'},
 {day:2,date:'9月25日 · 周五',title:'看动物，也看大马戏',icon:'sun',text:'<strong>07:50转熊猫酒店，约09:00入园</strong><br>小火车 → 百虎山 → 长颈鹿 → 考拉 / 熊猫 → 条件缆车。<br><strong>15:30回撤，20:00大马戏。</strong>',caption:'今天的主角 · 长颈鹿与小朋友',visual:'giraffe'},
 {day:3,date:'9月26日 · 周六',title:'吃顿早茶，再慢慢告别',icon:'coffee',text:'<strong>08:00早茶 → 退房寄存 → 补漏二刷</strong><br>10:30向出口走，11:00离园。<br><strong>11:40酒店出发，14:25广州南返程。</strong>',caption:'喜欢的动物 · 可以再看一遍',visual:'panda'}
];
document.querySelector('#quick-days').innerHTML=quickDays.map(d=>`<article class="journey-day"><div class="day-paper"><span class="day-label">DAY ${d.day}</span><span class="day-date">${d.date}</span><h2>${d.title}</h2><p>${d.text}</p><button class="read-day" data-open-day="${d.day-1}">看看这一天怎么走 ${icon('arrow-right')}</button></div><span class="day-pin">${icon(d.icon)}</span><div class="day-visual">${d.visual==='ticket'?`<div class="train-ticket"><small>${icon('train')} 出发车票 · 09.24</small><div class="ticket-stations"><div><b>17:18</b><span>厦门北</span></div>${icon('arrow-right')}<div><b>21:17</b><span>广州南</span></div></div><div class="ticket-bottom">车次编号请看12306订单<br>宜程轻居 · 富石路315号 · 万民城旁</div></div>`:`<figure>${image(d.visual)}<figcaption>${d.caption}</figcaption></figure>`}</div></article>`).join('');

const days=[
 {title:'抵达广州，今晚先好好休息',intro:'下了高铁就去酒店。把搬酒店和进园要用的东西提前分装好，第二天早晨会轻松很多。',stops:[
  {time:'16:15前抵达车站 · 17:18发车',title:'厦门北 → 广州南',icon:'train',text:'建议提前约一小时到厦门北。17:18出发，21:17到广州南；晚饭在上车前或列车上解决。',hint:'去程3张成人票 + 1张儿童票，小女儿未单独购票；核对随行儿童登记。车次编号以本人订单为准。'},
  {transfer:'21:17到站后 · 提前预约商务7座',text:'广州南 → 宜程轻居；按司机定位到指定上车点。'},
  {time:'约22:00',title:'宜程轻居 · 全员集合',icon:'bed',place:'宜程轻居 广州长隆野生动物世界店 富石路315号',text:'已订二室一厅三床家庭房1间，3大2小一起住。地址：番禺区大石街富石路315号，万民城旁。',hint:'提前告知晚到，确认房间保留至22:30以后。',more:'入住后把大件行李与次日随身包分开。证件、手机、饮用水、儿童用品留在随身包里；第二天到熊猫酒店直接寄存行李。'},
  {time:'睡前花5分钟',title:'为明天的早入园做准备',icon:'backpack',text:'核对07:50转酒店的车辆；问清附近哪家早餐店07:00已营业，确认熊猫酒店去动物园北门的首班接驳。',hint:'原计划08:30接驳尚未核实，不把“08:30发车、5分钟到”当成实际时刻表。',more:'银记肠粉（万民城店）是原计划候选，门店和早开时间待确认。备选是前一晚买好早餐，在酒店吃完；不依赖07:00的点都德外卖。'}
 ]},
 {title:'从小火车开始，把一天玩舒服',intro:'上午留给最想看的动物，中午认真坐下吃饭，下午走慢一点。晚上的大马戏值得我们提前回酒店休息。',stops:[
  {time:'06:40起床 · 07:00早餐 · 07:50出发',title:'吃好早餐，转熊猫酒店',icon:'coffee',text:'07:35早餐收尾，07:45全员带齐行李下楼，退房后乘商务7座去熊猫酒店。早餐优先选万民城周边已确认早开的店。'},
  {time:'08:10左右',title:'熊猫酒店 · 先寄存，再出发',icon:'building',place:'广州长隆熊猫酒店',text:'前台登记 → 寄存大件行李 → 激活5人套票。房间15:00后再回去领取，先带随身包去动物园。',photos:['hotel','lobby'],hint:'按你已确认的权益：可先登记寄存，25、26日多次入园，住客提前30分钟。现场确认实名绑定及马戏预约。',sources:['hotel'],more:'3人套票 + 2人套票覆盖同行5人。接驳首班、站点和北门住客入口需向礼宾部确认；不要等房间准备好才入园。'},
  {transfer:'酒店指定乘车点 → 野生动物世界北门',text:'目标08:45左右到北门；接驳按酒店确认的班次乘坐。'},
  {time:'约09:00入园 · 09:30—10:10小火车窗口',title:'北门入园，小火车优先',icon:'train',place:'长隆野生动物世界 北门',text:'入园先问清小火车开机时间，再去入口排队。坐着看草原上的动物，是今天的第一优先项目。',photos:['safari'],hint:'提前入园不等于设施同步启动或免排队。此时段是预留窗口，客流大时顺延并删减步行停留。',sources:['park'],more:'自驾车游览暂停不代表小火车一定停运。以当天设施公告及入口工作人员指引为准。'},
  {time:'10:10—11:30',title:'青龙山 → 百虎山',icon:'map-pin',text:'沿园内路牌单向推进。孩子怕恐龙或不想继续走，就缩短青龙山，把时间留给更喜欢的动物。',photos:['tiger'],hint:'每40—60分钟安排一次坐下、喝水或上厕所。'},
  {time:'11:30—12:00',title:'长颈鹿广场 · 多留一会儿',icon:'heart',text:'这段不急着赶路。孩子感兴趣就慢慢看；互动投喂仅参加现场开放项目，使用工作人员提供的饲料。',photos:['giraffe'],sources:['rules']},
  {time:'12:00—13:00',title:'午餐时间，认真休息',icon:'tools-kitchen-2',text:'首选路线附近的考拉食街或当前区域开放餐厅。不为了吃某一家横穿园区，留20—30分钟真正坐下来。',photos:['restaurant'],hint:'餐厅照片为园内环境示意，不是考拉食街定位图。具体菜单与供应以当天为准。',sources:['food'],more:'若已走到熊猫区域且体力充足，可选熊猫餐厅。动物世界当前仅允许婴儿食品及本人适量饮用水，其他食品饮料按官网须知执行。'},
  {time:'13:00—14:30',title:'考拉、大象与开放的熊猫展区',icon:'map-pin',text:'考拉园 → 大象园 → 儿童动物区域 → 开放的熊猫观赏区。大象和儿童区域按体力取舍，下午不用追求打卡数量。',photos:['koala','panda'],hint:'熊猫村有暂停公告；先询问当天哪里可以看熊猫。照片仅作主题配图，不代表该展区开放。',sources:['village']},
  {time:'15:00—15:30 · 可选休息观景',title:'缆车，放在这时候坐',icon:'route',text:'15:00先看当天开放线路、上下车站与排队总时长。把缆车作为可选休息观景项目，选择乘坐时删减同期步行节点；不预设回到南门。',photos:['cable'],hint:'停运、雷雨或排队与乘坐总时长会影响15:30收尾，就跳过并提前回酒店。',sources:['cable1','cable2'],more:'A｜确认环园线路开放，乘坐暂按约30分钟预留，另加排队。\nB｜仅部分线路开放：确认上下车站与回酒店出口顺路再坐，不默认能到北门。\nC｜停运：在开放熊猫或考拉区域慢看，或者直接回酒店。'},
  {transfer:'15:30开始向出口走 · 16:00—16:30回酒店',text:'按当天可用回程站点选择出口，预留步行与候车时间。'},
  {time:'16:00—17:15休息 · 17:20—18:15晚餐',title:'回房间，把体力充回来',icon:'bed',text:'领房卡、换衣、给孩子躺一会，至少安静休息40分钟。晚餐优先酒店内出餐快、孩子吃得惯的餐食。',hint:'跑腿先问取餐点；外出吃饭只作备选，不能影响18:30出发。'},
  {time:'18:30出发 · 18:45—19:00抵达',title:'普通座，早点到更从容',icon:'ticket',place:'广州长隆国际大马戏',text:'向酒店问清马戏入口与步行或接驳路线。先安检、上厕所，再找视野清楚的位置；入住时询问住客专区资格。',hint:'普通座通常先到先得，5人连座不保证。若分坐，按3人 + 2人安排，每名孩子身边有成人。两名孩子也需对应马戏票。',sources:['seat'],more:'前台核对5人的日期、场次、座席类型与权益。推车存放按现场要求办理，先取出随身贵重物品；儿童耳罩可作备选。'},
  {time:'20:00开演',title:'长隆国际大马戏 · 今晚的期待',icon:'moon',text:'当前官网9月25日17:00开园、20:00开演。看完按指引回熊猫酒店，不追加夜游，让孩子好好睡。',photos:['circus'],sources:['circus']}
 ]},
 {title:'一顿早茶，再见一次喜欢的动物',intro:'今天不重走完整路线。挑一个孩子最惦记的区域，慢慢告别，再留足去广州南的时间。',stops:[
  {time:'07:15起床 · 07:45出发',title:'行李先收好，再出门吃早茶',icon:'backpack',text:'先把所有行李收好。孩子晚起就改酒店或附近快速早餐，取消早茶堂食，保留后面的缓冲。'},
  {time:'08:00—08:45',title:'广式早茶 · 点都德候选',icon:'coffee',place:'点都德 长隆店 时代E-PARK',text:'候选为点都德（长隆店），时代E-PARK二楼。可点虾饺、烧卖、叉烧包、粥；按食量点，吃舒服就好。',hint:'公开信息08:00营业，出发前向门店确认。等位超过15分钟，改附近已营业早餐。',sources:['tea']},
  {time:'08:45—09:30',title:'回酒店，先退房寄存',icon:'bed',text:'回熊猫酒店办理退房、寄存，再确认退房后二次入园的验证方式，然后轻装去动物园。',hint:'官方退房时间11:00；不能11:00离园后再回去退房。',sources:['hotel']},
  {time:'约09:30—10:30',title:'补漏或二刷，只选一小段',icon:'camera',text:'选昨天最喜欢的1个区域，或从方便的入口看附近开放区域，补一张合影。小火车和缆车排队不可控，就不二刷。',photos:['giraffe','koala'],hint:'若到10:00后才准备二次入园，可直接取消补漏。'},
  {time:'10:30回撤 · 11:00前离园',title:'取行李，全员集合',icon:'backpack',text:'10:30开始向出口走。回熊猫酒店取行李、上厕所、清点5人；11:30前联系不到司机，就请礼宾部协助调车或启用备用交通。'},
  {transfer:'11:40目标上车 · 最迟12:00出发',text:'熊猫酒店 → 广州南。三大两小与行李，提前预约商务7座。'},
  {time:'目标12:30到站 · 14:25发车',title:'广州南 → 厦门方向',icon:'train',place:'广州南站',text:'先安检、找候车区，再在站内吃午饭。原记录13号检票口，当天以电子屏为准。14:25按订单乘车返程。',hint:'返程3张成人票 + 2张儿童票。车次、终到站名与到达时间待按订单补齐；开始和停止检票时间看车站公告。'}
 ]}
];
let currentDay=0,currentMode='quick';
function stopHTML(s){
 if(s.transfer)return `<div class="transfer">${icon('bus')}<div><b>${s.transfer}</b><span>${s.text}</span></div></div>`;
 return `<section class="stop"><span class="stop-marker">${icon(s.icon)}</span><div class="stop-head"><div><span class="time">${s.time}</span><h3>${s.title}</h3></div>${s.place?`<a class="map-link" href="${map(s.place)}" target="_blank" rel="noopener" aria-label="在地图中搜索${esc(s.place)}">${icon('map-pin')}地图</a>`:''}</div><p>${s.text}</p>${s.photos?`<div class="gallery ${s.photos.length===1?'single':''}">${s.photos.map(n=>`<button class="photo-button" data-photo="${n}" aria-label="放大查看${photoNames[n]}">${image(n)}<span>${icon('camera')}</span></button>`).join('')}</div>`:''}${s.hint?`<p class="hint">${s.hint}</p>`:''}${s.more?`<details><summary>展开实用提醒</summary><p>${esc(s.more).replace(/\n/g,'<br>')}</p></details>`:''}${s.sources?refs(s.sources):''}</section>`;
}
function renderDay(index,scroll=false){currentDay=index;const d=days[index];document.querySelector('#day-content').innerHTML=`<div class="day-intro"><h2><mark>DAY ${index+1}</mark> · ${d.title}</h2><p>${d.intro}</p></div>${index===1?'<day-two-map id="day2-map"></day-two-map>':''}<div class="timeline">${d.stops.map(stopHTML).join('')}</div>${index<2?`<button class="day-end" data-next="${index+1}">接着看 DAY ${index+2} ${icon('arrow-right')}</button>`:''}`;document.querySelector('#day-content').setAttribute('aria-labelledby','day-tab-'+index);document.querySelectorAll('[data-day]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.day)===index);if(b.getAttribute('role')==='tab')b.setAttribute('aria-selected',String(Number(b.dataset.day)===index))});if(scroll)document.querySelector('.day-tabs').scrollIntoView({block:'start',behavior:'instant'});}
function setMode(mode,scroll=true){currentMode=mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===mode)));document.querySelector('#quick').hidden=mode!=='quick';document.querySelector('#detail').hidden=mode!=='detail';document.querySelector('meta[name=theme-color]').content=mode==='quick'?'#1754c7':'#ffffff';if(scroll)window.scrollTo({top:0,behavior:'instant'});}
function notice(s){const t=document.querySelector('#toast');t.textContent=s;t.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>t.classList.remove('show'),3500)}
document.addEventListener('click',async e=>{const b=e.target.closest('button,a');if(!b)return;
 if(b.dataset.mode)setMode(b.dataset.mode);
 if(b.dataset.day!==undefined)renderDay(Number(b.dataset.day),true);
 if(b.dataset.openDay!==undefined){setMode('detail');renderDay(Number(b.dataset.openDay),true)}
 if(b.dataset.next!==undefined)renderDay(Number(b.dataset.next),true);
 if(b.dataset.photo){const n=b.dataset.photo;const d=document.querySelector('#photo-dialog');d.querySelector('img').src=asset(n);d.querySelector('img').alt=photoNames[n];d.querySelector('p').textContent=photoNames[n]+' · 配图来自长隆官网';d.showModal()}
 if(b.classList.contains('close-dialog'))b.closest('dialog').close();
 if(b.classList.contains('checklist-button'))document.querySelector('#check-dialog').showModal();
 if(b.classList.contains('brand')){e.preventDefault();setMode('quick')}
 if(b.classList.contains('share-btn')){const url=location.protocol==='file:'?'https://fanxuanyi999.github.io/changlong/':location.href.split('#')[0];try{if(navigator.share)await navigator.share({title:'广州长隆亲子行 · 家庭旅行手册',url});else{await navigator.clipboard.writeText(url);notice('攻略链接已复制，可以发给同行家人')}}catch(err){if(err.name!=='AbortError'){notice('可复制浏览器地址，或直接发送离线HTML文件')}}}
 if(b.classList.contains('download-button')&&typeof EMBEDDED_PHOTOS!=='undefined'){e.preventDefault();const original=document.querySelector('#offline-original');const content=original?original.textContent:document.documentElement.outerHTML;const url=URL.createObjectURL(new Blob(['<!doctype html>\n'+content],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='广州长隆亲子行_图文离线版.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
document.querySelectorAll('[role=tablist]').forEach(list=>list.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...list.querySelectorAll('[role=tab]')];let i=tabs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();tabs[i].click()}));
const groups=[{index:0,title:'车票与两晚住宿',icon:'ticket'},{index:6,title:'早餐、午餐和晚餐',icon:'tools-kitchen-2'},{index:7,title:'接驳、打车与酒店权益',icon:'bus'},{index:8,title:'各园开放时间与停运提醒',icon:'clock'},{index:9,title:'雨天、疲劳与返程应急',icon:'backpack'}];
document.querySelector('#note-groups').innerHTML=groups.map(g=>{const p=NOTES.detail[g.index];return `<details class="note-group"><summary><span class="summary-title">${icon(g.icon)}${g.title}</span>${icon('chevron-down')}</summary>${p.blocks.map(b=>`<section class="note-block"><h4>${esc(b.title)}</h4><p>${esc(b.text)}</p></section>`).join('')}${refs(p.sources)}</details>`}).join('');
const checkLabels=['已核对车次、终到站、证件和随行儿童登记','已告知宜程轻居晚到，确认保留房间','已预约三段7座车，告知人数、行李及推车','已确认北门首班接驳、住客入口及回程站点','已核对5人马戏日期、场次、座席与专区资格','9月24日已查看设施最新公告与天气','已确认26日退房寄存、二次入园验证方式','3位成人均已保存攻略与订单截图'];
document.querySelector('#check-items').innerHTML=checkLabels.map((x,i)=>`<label class="check-item"><input type="checkbox" data-check="${i}"><span>${x}</span></label>`).join('');
const boxes=[...document.querySelectorAll('[data-check]')];const updateProgress=()=>document.querySelector('.check-progress').textContent=`已完成 ${boxes.filter(b=>b.checked).length} / ${boxes.length} 项`;
boxes.forEach(b=>{try{b.checked=localStorage.getItem('changlong2026-check-'+b.dataset.check)==='1'}catch{}b.addEventListener('change',()=>{try{localStorage.setItem('changlong2026-check-'+b.dataset.check,b.checked?'1':'0')}catch{}updateProgress()})});updateProgress();
document.querySelector('#credits').innerHTML=Object.keys(photoNames).map(n=>`<a href="${photoSources[n]||'https://www.chimelong.com/gz/safaripark/'}" target="_blank" rel="noopener">${photoNames[n]} ↗</a>`).join('');
document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));renderDay(0);
