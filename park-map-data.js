/* Coordinates are illustration units, NOT latitude/longitude. Source relationships:
 * https://www.chimelong.com/gz/safaripark/ (official illustrated visitor map).
 * No geographic transform is claimed for this non-surveyed illustration. */
(function (root) {
  'use strict';
  const nodes = [
    ['north','北门','09:00','约10分钟',120,420,'先确认住客入口与小火车开机时间。提前入园不等于设施已经运行。'],
    ['train','小火车','09:10排队','预留至10:10',245,470,'先排队；原攻略乘坐窗口为09:30–10:10，按当天开机和客流调整。图中连线不代表小火车行车路线。'],
    ['dragon','青龙山','10:10','约30分钟',470,690,'沿现场路牌进入青龙山；孩子怕恐龙可缩短停留。'],
    ['tiger','百虎山','10:50','约30分钟',620,510,'看动物后喝水休息，给长颈鹿留足时间。'],
    ['giraffe','长颈鹿广场','11:30','约30分钟',820,675,'互动投喂只参加现场开放项目，使用工作人员提供的饲料。'],
    ['koala','考拉园 / 午餐','12:00','午餐60分钟＋看考拉',770,525,'先就近用餐，至少坐下休息20–30分钟。13:00再看考拉，不为吃饭横穿园区。'],
    ['elephant','大象园','13:30','约20分钟',1020,530,'按孩子状态取舍；不追求每个展区都打卡。'],
    ['children','儿童动物园','14:00','约20分钟',1090,375,'儿童动物区域与游乐设施分开确认，开放项目以当天为准。'],
    ['panda','熊猫乐园','14:30','约15分钟',700,350,'先询问开放的熊猫观赏区。熊猫村与熊猫乐园不能混为一谈。'],
    ['africa','非洲发现','14:50','约10分钟',940,250,'轻松看一小段；如15:00选择缆车，可跳过后续步行点。'],
    ['flamingo','火烈鸟','15:10','约10分钟',1030,160,'停下来拍照、喝水。选缆车时可跳过这里，不与缆车叠加赶行程。'],
    ['decision','体力判断点','15:30','约5分钟',900,110,'这是行程决策点，不是园区实体设施。停止新增项目，确认当日出口和酒店回程乘车点。']
  ].map((n,i)=>({id:n[0],name:n[1],time:n[2],duration:n[3],x:n[4],y:n[5],note:n[6],number:i+1}));
  const bends = [ [[145,460]], [[310,525],[345,625]], [[500,610],[540,545]], [[640,600],[720,655]], [[800,605]], [[875,490],[950,505]], [[1100,470]], [[990,405],[845,400]], [[775,295],[855,285]], [[1010,215]], [[980,115]] ];
  const segments = nodes.slice(0,-1).map((n,i)=>({from:n.id,to:nodes[i+1].id,points:[[n.x,n.y],...bends[i],[nodes[i+1].x,nodes[i+1].y]]}));
  const facilities = [
    ['wc-north','北门区域厕所','wc',165,385,'north'],
    ['wc-train','小火车入口区域厕所','wc',315,470,'train'],
    ['wc-dragon','青龙山区域厕所','wc',525,725,'dragon'],
    ['wc-tiger','百虎山区域厕所','wc',655,470,'tiger'],
    ['wc-koala','考拉区域厕所','wc',840,555,'koala'],
    ['wc-giraffe','长颈鹿区域厕所','wc',745,705,'giraffe'],
    ['wc-panda','熊猫乐园区域厕所','wc',645,335,'panda'],
    ['wc-south','南侧区域厕所','wc',1100,145,'flamingo'],
    ['food-koala','考拉食街','food',865,585,'koala'],
    ['food-panda','熊猫餐厅','food',780,370,'panda'],
    ['food-swan','天鹅湖餐厅','food',380,475,'train'],
    ['cable-swan','天鹅湖站','cable',180,610,'train'],
    ['cable-panda','熊猫乐园站','cable',735,235,'panda'],
    ['cable-africa','非洲草原站','cable',860,815,'giraffe'],
    ['rest-lunch','午餐坐下休息','rest',875,640,'koala'],
    ['rest-panda','熊猫区域休息','rest',590,355,'panda'],
    ['rest-swan','天鹅湖区域休息','rest',350,380,'train']
  ].map(f=>({id:f[0],name:f[1],type:f[2],x:f[3],y:f[4],anchor:f[5],approximate:true}));
  const labels={wc:'厕所',food:'餐饮',cable:'缆车',rest:'休息点'};
  function routeBetween(from,to){
    const a=nodes.findIndex(n=>n.id===from), b=nodes.findIndex(n=>n.id===to);
    if(a<0||b<0)return null;
    const reverse=b<a;
    const routeNodes=nodes.slice(Math.min(a,b),Math.max(a,b)+1);
    const edges=segments.slice(Math.min(a,b),Math.max(a,b));
    return {reverse,nodes:reverse?routeNodes.reverse():routeNodes,segments:reverse?edges.reverse().map(e=>({...e,from:e.to,to:e.from,points:[...e.points].reverse()})):edges};
  }
  function locationResult(position){
    const c=position.coords;
    if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||!Number.isFinite(c.accuracy))throw new Error('无效定位');
    return {latitude:c.latitude,longitude:c.longitude,accuracy:Math.round(c.accuracy),timestamp:position.timestamp};
  }
  root.PARK_MAP={nodes,segments,facilities,labels,routeBetween,locationResult,source:'https://www.chimelong.com/gz/safaripark/',mapSource:'https://cdn.chimelong.com/upload/11aec41545b0408e/5f527c8de2142284.png'};
  if(typeof module!=='undefined')module.exports=root.PARK_MAP;
})(typeof window==='undefined'?globalThis:window);
