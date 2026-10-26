// Original learning templates for the detector's fixed COCO object classes.
// People are intentionally omitted. These sentences are not generated scene descriptions.
const entries=`bicycle|自行车|/ˈbaɪsɪkl/
car|汽车|/kɑː/
motorcycle|摩托车|
airplane|飞机|/ˈeəpleɪn/
bus|公共汽车|/bʌs/
train|火车|/treɪn/
truck|卡车|/trʌk/
boat|船|/bəʊt/
traffic light|交通信号灯|
fire hydrant|消防栓|
stop sign|停车标志|
parking meter|停车计费器|
bench|长椅|/bentʃ/
bird|鸟|/bɜːd/
cat|猫|/kæt/
dog|狗|/dɒɡ/
horse|马|/hɔːs/
sheep|绵羊|/ʃiːp/
cow|奶牛|/kaʊ/
elephant|大象|/ˈelɪfənt/
bear|熊|/beə/
zebra|斑马|/ˈzebrə/
giraffe|长颈鹿|/dʒəˈrɑːf/
backpack|背包|/ˈbækpæk/
umbrella|雨伞|/ʌmˈbrelə/
handbag|手提包|/ˈhændbæɡ/
tie|领带|/taɪ/
suitcase|行李箱|/ˈsuːtkeɪs/
frisbee|飞盘|
skis|滑雪板|
snowboard|单板滑雪板|
sports ball|运动球|
kite|风筝|/kaɪt/
baseball bat|棒球棒|
baseball glove|棒球手套|
skateboard|滑板|
surfboard|冲浪板|
tennis racket|网球拍|
bottle|瓶子|/ˈbɒtl/
wine glass|葡萄酒杯|
cup|杯子|/kʌp/
fork|叉子|/fɔːk/
knife|刀|/naɪf/
spoon|勺子|/spuːn/
bowl|碗|/bəʊl/
banana|香蕉|/bəˈnɑːnə/
apple|苹果|/ˈæpl/
sandwich|三明治|/ˈsænwɪdʒ/
orange|橙子|/ˈɒrɪndʒ/
broccoli|西兰花|
carrot|胡萝卜|/ˈkærət/
hot dog|热狗|
pizza|披萨|/ˈpiːtsə/
donut|甜甜圈|
cake|蛋糕|/keɪk/
chair|椅子|/tʃeə/
couch|沙发|/kaʊtʃ/
potted plant|盆栽植物|
bed|床|/bed/
dining table|餐桌|
toilet|马桶|/ˈtɔɪlət/
tv|电视|/ˈtelɪvɪʒn/|television
laptop|笔记本电脑|/ˈlæptɒp/
mouse|电脑鼠标|/maʊs/
remote|遥控器|/rɪˌməʊt kənˈtrəʊl/|remote control
keyboard|键盘|/ˈkiːbɔːd/
cell phone|手机||mobile phone
microwave|微波炉|/ˈmaɪkrəweɪv/
oven|烤箱|/ˈʌvn/
toaster|烤面包机|/ˈtəʊstə/
sink|水槽|/sɪŋk/
refrigerator|冰箱|/rɪˈfrɪdʒəreɪtə/
book|书|/bʊk/
clock|时钟|/klɒk/
vase|花瓶|/vɑːz/
scissors|剪刀|/ˈsɪzəz/
teddy bear|泰迪熊玩偶|
hair drier|吹风机||hair dryer
toothbrush|牙刷|/ˈtuːθbrʌʃ/`;
export const LOCAL_OBJECTS=Object.fromEntries(entries.split('\n').map(line=>{const [label,meaning,ipa,word]=line.split('|');return[label,{word:word||label,meaning,ipa:ipa||''}];}));
const expressions={
 cup:['I usually start my morning with a cup of tea.','我通常喝杯茶开始早晨。'],
 book:['I enjoy reading in my spare time.','我喜欢在空闲时间阅读。'],
 'potted plant':['Having plants around makes a room feel more relaxing.','周围有植物会让房间更让人放松。'],
 bicycle:['Cycling is a convenient way to get around.','骑自行车是一种方便的出行方式。'],
 'mobile phone':['I use my mobile phone to keep in touch with friends.','我用手机和朋友保持联系。'],
 laptop:['A laptop is useful for studying wherever I am.','笔记本电脑让我在不同地方都能学习。'],
 chair:['A comfortable chair helps me focus when I study.','一把舒适的椅子有助于我学习时集中注意力。'],
 backpack:['I like to pack light when I go out.','我喜欢出门时轻装上阵。'],
 umbrella:['I often carry an umbrella, just in case it rains.','我经常带伞，以防下雨。']
};
export function localObjectCards(predictions,width,height){
 if(!Array.isArray(predictions)||!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1)throw new Error('本地识别画面无效，请重新拍摄。');
 const used=new Set(),items=[];
 for(const p of [...predictions].sort((a,b)=>b.score-a.score)){
  const entry=Object.hasOwn(LOCAL_OBJECTS,p.class)?LOCAL_OBJECTS[p.class]:null;
  if(!entry||!Number.isFinite(p.score)||p.score<.55||!Array.isArray(p.bbox)||p.bbox.length!==4||p.bbox.some(n=>!Number.isFinite(n))||p.bbox[2]<=0||p.bbox[3]<=0||used.has(entry.word))continue;
  const word=entry.word,pair=['skis','scissors'].includes(word),mass=word==='broccoli',article=pair?'a pair of ':mass?'some ':/^(apple|orange|umbrella|elephant|oven|airplane)$/.test(word)?'an ':'a ';
  const expression=expressions[word]||[`I noticed ${article}${word} while I was looking around.`,`我四处看时注意到了${entry.meaning}。`];
  used.add(word);items.push({...entry,origin:'local',example:`I can see ${article}${word} here.`,translation:`这里可以看到${entry.meaning}。`,expression:expression[0],expressionTranslation:expression[1],point:[Math.max(0,Math.min(1,(p.bbox[0]+p.bbox[2]/2)/width)),Math.max(0,Math.min(1,(p.bbox[1]+p.bbox[3]/2)/height))]});if(items.length===5)break;
 }
 return {scene:'身边的发现 · 设备本地识别',items};
}
