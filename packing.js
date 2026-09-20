// Stable item IDs keep the two packing lists independent of the booking checklist.
const packingLists = {
  departure: {
    intro: '按3天2晚准备；每家整理自己的衣物，充电、纸巾等公用物品由3位成人分担。',
    groups: [
      ['证件与随身包', [
        ['documents','成人与儿童出行证件','按车票、酒店和套票登记资料带齐原件，集中放在随身证件袋。'],
        ['orders','车票、酒店与套票订单','手机保存订单和攻略；截图供查阅，入园验证按现场要求。'],
        ['phone','手机、充电线与充电头','出门前充好电，每家带够常用接口即可。'],
        ['power','充电宝（选带）','提前核对铁路携带规定；不需要可确认后勾选。'],
        ['train','高铁途中饮水与晚餐','晚饭上车前或车上解决，少量零食供途中吃；不要默认可带入动物园。']
      ]],
      ['衣物与洗漱', [
        ['clothes','换洗衣物、内衣袜与睡衣','成人按3天2晚；孩子额外备1—2套，按人分装。'],
        ['layers','薄外套与舒适步行鞋','车厢、酒店和晚间可加一层；穿已经走惯的鞋。'],
        ['wash','牙刷牙膏与个人洗漱用品','儿童用品单独装小袋，按需带毛巾和个人护理用品。'],
        ['weather','遮阳帽、防晒用品与雨具','防晒用品选平时用惯的；雨衣或折叠伞按天气分配。'],
        ['bags','入园小背包与收纳袋','准备脏衣袋、备用密封袋，24日晚先分出次日入园包。']
      ]],
      ['儿童与按需用品', [
        ['care','纸巾、湿巾与个人常用药品','常用药保留原包装；随身备少量创可贴，按自家需要准备。'],
        ['stroller','轻便折叠推车（选带）','小朋友平时需要就带，并提前向司机说明推车与行李数量。'],
        ['comfort','安抚小物、耳罩（选带）','一个熟悉的小玩具或绘本；看马戏可按孩子习惯带耳罩。'],
        ['childcare','孩子专用水杯及护理用品（按需）','有需要再带尿裤、隔尿垫等；不用照单买齐。']
      ]]
    ],
    note: '装包顺序：大件衣物进箱子 → 当晚洗漱包放上层 → 证件、手机、饮水留在随身包。出门前再清点5人的证件和行李件数。'
  },
  park: {
    intro: '25日先登记寄存，再轻装入园；26日退房寄存后沿用此表。建议每家一个小背包，公用物品分担携带。',
    groups: [
      ['必须留在身边', [
        ['documents','入园所需证件与验证凭证','不要随箱寄存；按前台确认的5人实名验证方式准备。'],
        ['phone','手机与少量备用电量','带好手机，充电宝和短线按需；保存当日路线及家人联系方式。'],
        ['claim','寄存凭证、房卡（如已领取）','登记后暂未拿房卡也没关系；记好回酒店的站点与取行李位置。'],
        ['water','本人适量饮用水与孩子水杯','成人分担携带，缺水及时补充，不把全部饮水压在一个人身上。']
      ]],
      ['防晒、下雨与孩子换洗', [
        ['weather','帽子、防晒小装与轻便雨具','出门前先做好防晒；按当天预报选雨衣或折叠伞。'],
        ['tissues','纸巾、湿巾与小垃圾袋','只带当天用量，方便饭前清洁、擦汗及收纳。'],
        ['clothes','孩子备用衣物1套与密封袋','含内衣袜；汗湿或弄脏后可更换，脏衣单独装。'],
        ['layer','轻薄外套或小汗巾（选带）','按孩子习惯和天气选，不必把全家备用衣物都背入园。'],
        ['care','个人必需药品与少量创可贴（按需）','当天可能用到的留在随身包，其余放酒店。'],
        ['stroller','折叠推车及儿童护理用品（按需）','上下小火车、缆车时听现场指引；离开推车时带走贵重物品。']
      ]],
      ['寄存前的最后检查', [
        ['store','大件行李已寄存','箱子、洗漱包、多余衣物与大充电头留酒店；贵重物品随身。'],
        ['food','普通零食与其他饮品已留酒店','当前园方仅例外允许婴儿食品和本人适量饮用水；普通儿童零食不属于婴儿食品。'],
        ['night','晚间用品留到回酒店时再取','马戏耳罩、晚间外套等按需整理好，下午回房休息时再拿。']
      ]]
    ],
    note: '26日补漏时只带短时游览所需物品。离园取行李后，再补好去广州南及返程车上的饮水和食品。',
    source: true
  }
};
const packingDialog=document.querySelector('#packing-dialog');
for(const [key,list] of Object.entries(packingLists)){
  document.querySelector('#packing-'+key).innerHTML=`<p class="packing-intro">${esc(list.intro)}</p>${list.groups.map(([title,items])=>`<fieldset class="packing-group"><legend>${esc(title)}</legend>${items.map(([id,title,note])=>`<label class="check-item packing-item"><input type="checkbox" data-pack="${key}-${id}"><span><b>${esc(title)}</b><small>${esc(note)}</small></span></label>`).join('')}</fieldset>`).join('')}<p class="packing-note">${esc(list.note)}</p>${list.source?'<a class="packing-source" href="https://www.chimelong.com/gz/safaripark/notice/" target="_blank" rel="noopener">查看园方入园及携带物品须知 ↗</a>':''}`;
}
let activePacking='departure';
function updatePackingProgress(){
  const items=[...document.querySelectorAll('#packing-'+activePacking+' input')];
  const done=items.filter(i=>i.checked).length;
  document.querySelector('#packing-progress').textContent=`已核对 ${done} / ${items.length} 项`;
  document.querySelector('#packing-meter').value=done;
  document.querySelector('#packing-meter').max=items.length;
}
function selectPacking(key){
  if(!packingLists[key])return;
  activePacking=key;
  document.querySelectorAll('[data-packing-tab]').forEach(b=>{const selected=b.dataset.packingTab===key;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});
  for(const k of Object.keys(packingLists))document.querySelector('#packing-'+k).hidden=k!==key;
  packingDialog.scrollTop=0;
  updatePackingProgress();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.packingOpen){selectPacking(b.dataset.packingOpen);packingDialog.showModal()}
  if(b.dataset.packingTab)selectPacking(b.dataset.packingTab);
});
document.querySelectorAll('[data-pack]').forEach(b=>{
  const key='changlong2026-packing-'+b.dataset.pack;
  try{b.checked=localStorage.getItem(key)==='1'}catch{}
  b.addEventListener('change',()=>{try{localStorage.setItem(key,b.checked?'1':'0')}catch{}updatePackingProgress()});
});
selectPacking('departure');
