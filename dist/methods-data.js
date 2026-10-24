import {LISTENING_TIMING} from './methods-timing.js';
export {LISTENING_TIMING};
export const REASONS={word:'不认识词',sound:'听不出声音',spelling:'拼写容易错',tense:'时态没用稳',negative:'漏看或漏写否定',locate:'没有定位到信息',unsure:'暂时说不清'};
// Original constrained learning examples, not IELTS questions or AI grading.
const rows=[
 ['o01','一般现在时否定','她不喜欢咖啡。','She does not like coffee.','She _____ coffee.','does not like',"She doesn't like coffee.",'does not 后面用 like 原形。','she / like / coffee'],
 ['o02','一般现在时否定','他星期天不上班。','He does not work on Sundays.','He _____ on Sundays.','does not work',"He doesn't work on Sundays.",'he 借助 does not，work 不加 s。','he / work / on Sundays'],
 ['o03','一般现在时否定','他们不住这里。','They do not live here.','They _____ here.','do not live',"They don't live here.",'they 使用 do not。','they / live / here'],
 ['o04','一般过去时','我昨天学了英语。','I studied English yesterday.','I _____ English yesterday.','studied','','study 的过去式是 studied。','I / study / English / yesterday'],
 ['o05','一般过去时','她上周参观了图书馆。','She visited the library last week.','She _____ the library last week.','visited','','visit 的过去式加 ed。','she / visit / the library / last week'],
 ['o06','一般过去时','我们昨晚看了一部电影。','We watched a film last night.','We _____ a film last night.','watched','','last night 对应过去时。','we / watch / a film / last night'],
 ['o07','过去时否定','他昨天没去上学。','He did not go to school yesterday.','He _____ to school yesterday.','did not go',"He didn't go to school yesterday.",'did not 已经表示过去，后面用 go。','he / go / to school / yesterday'],
 ['o08','过去时否定','我昨天没买书。','I did not buy a book yesterday.','I _____ a book yesterday.','did not buy',"I didn't buy a book yesterday.",'did not 后用 buy，不用 bought。','I / buy / a book / yesterday'],
 ['o09','过去时否定','他们没有完成这项工作。','They did not finish the work.','They _____ the work.','did not finish',"They didn't finish the work.",'本题练习一般过去时；did not 后用 finish。','they / finish / the work'],
 ['o10','一般疑问句','她需要更多时间吗？','Does she need more time?','_____ she need more time?','Does','','Does 放句首，need 用原形。','she / need / more time'],
 ['o11','一般疑问句','你昨天给他打电话了吗？','Did you call him yesterday?','_____ you call him yesterday?','Did','','过去的疑问句使用 Did，call 用原形。','you / call / him / yesterday'],
 ['o12','be 动词问句','他们在家吗？','Are they at home?','_____ they at home?','Are','','be 动词问句将 are 放在主语前。','they / be / at home']
];
export const OUTPUTS=rows.map(([id,topic,chinese,english,mask,gap,alternative,tip,hint])=>({id,topic,chinese,english,mask,gap,alternatives:alternative?[alternative]:[],tip,hint}));
export function earRef(ref){const m=/^ear:(l0[1-4]):(\d+)$/.exec(String(ref));if(!m||Number(m[2])>=LISTENING_TIMING[m[1]].sentences.length)return null;return {lesson:m[1],index:Number(m[2])};}
export const outputRef=ref=>typeof ref==='string'&&ref.startsWith('out:')?OUTPUTS.find(q=>q.id===ref.slice(4))||null:null;
