// RFC 4180 fields, including escaped quotes and embedded newlines.
export function* csvRows(text){
 let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else quoted=false;}else field+=c;}
  else if(c==='"'){if(field)throw new Error('Invalid CSV quote');quoted=true;}
  else if(c===','){row.push(field);field='';}
  else if(c==='\n'){row.push(field.replace(/\r$/,''));if(row.some(Boolean))yield row;row=[];field='';}
  else field+=c;
 }
 if(quoted)throw new Error('Unclosed CSV field');
 if(field||row.length){row.push(field.replace(/\r$/,''));yield row;}
}

export function dictionaryCandidates(text,existing){
 const iterator=csvRows(text),header=iterator.next().value;
 for(const key of ['word','translation','phonetic','definition','exchange','bnc','frq','tag'])if(!header?.includes(key))throw new Error('Missing dictionary field: '+key);
 const columns=Object.fromEntries(header.map((key,i)=>[key,i]));
 const seen=new Set(existing),result=[];
 const lines=value=>String(value||'').replace(/\\n/g,'\n').split('\n').map(x=>x.trim()).filter(Boolean);
 for(const fields of iterator){
  if(fields.length!==header.length)continue;
  const get=key=>fields[columns[key]]||'',word=get('word');
  if(!/^[a-z]{3,20}$/.test(word)||seen.has(word)||/(?:^|\/)0:/.test(get('exchange')))continue;
  const meaning=lines(get('translation')).filter(x=>/[\u4e00-\u9fff]/.test(x)&&!/^\[网络\]|人名|的(?:过去|现在|第三人称|复数)|变体|变形/.test(x)).slice(0,2).join('；');
  const definition=lines(get('definition')).slice(0,2).join('\n');
  const bnc=Number(get('bnc'))||Infinity,frequency=Number(get('frq'))||Infinity;
  if(!meaning||meaning.length>260||!definition||definition.length>600||Math.min(bnc,frequency)>18000)continue;
  if(!/(?:^| )(?:zk|gk|cet4|cet6|ielts|toefl)(?: |$)/.test(get('tag')))continue;
  const general=meaning.split('；').filter(part=>!/^\s*\[/.test(part));
  seen.add(word);result.push({word,meaning:general.length?general.join('；'):meaning,definition,phonetic:get('phonetic'),forms:get('exchange'),rank:Math.min(bnc,frequency),source:'ecdict',example:null,translation:null});
 }
 return result.sort((a,b)=>a.rank-b.rank||a.word.localeCompare(b.word,'en'));
}
