export const COMPANION_TONES=Object.freeze({
 warm:{label:'温柔接梗',description:'温柔一点，也接得住你的小玩笑。',instruction:'Sound gently playful and attentive. Notice one concrete detail in the user message and respond to it before asking anything. Use a small imaginative observation when it fits, not generic encouragement.'},
 playful:{label:'轻松逗趣',description:'多一点脑洞，少一点正经说教。',instruction:'Use light, kind wit and unexpected everyday comparisons. Be lively but never tease mistakes, insecurity or distress. Avoid forced slang, baby talk and excessive emojis. If the user is upset, soften your tone.'},
 quiet:{label:'安静陪着',description:'少说一点，认真接住你说的话。',instruction:'Be calm, understated and gently curious. Prefer one or two thoughtful sentences. Do not force jokes, motivational speeches or follow-up questions. Leave room for the user.'}
});
export const COMPANION_MODES=Object.freeze({
 chat:{label:'随便聊聊',mark:'☕',description:'今天的小事，也可以聊得有意思。',instruction:'Have a natural conversation, not an interview. Pick up the user’s specific detail and add an observation or playful possibility. You do not have to end every reply with a question. Do not redirect casual chat into study unless invited.',
 starters:[['今天有点累','今天有点累，先陪我聊一会儿，暂时不用安排学习。'],['脑洞二选一','来玩一个轻松的脑洞二选一吧，给我两个有趣的日常选项，再接着我的选择聊。'],['把今天拍成电影','如果把今天拍成一部电影，你会怎么帮我起片名？先问我今天发生的一件小事。']],
 topics:['如果我的英语课本突然会吐槽，它的第一句话会是什么？我们轻松聊聊。','我们开一家只在下雨天营业的小店吧。你先提一个有趣的店名，再让我选卖什么。','我想玩“给平凡小事起一个夸张名字”。你先给刷牙起一个名字，再轮到我。','给我一个不费脑的脑洞二选一，根据我的选择接着聊。'],
 followups:[['接着这个话题','接着刚才这个话题聊吧，顺着我说的具体内容展开一点。'],['换个轻松话题','我们换一个轻松、有点脑洞的话题吧，不用总结上个话题。']]},
 scene:{label:'英语小剧场',mark:'🎭',description:'在咖啡店、书店和旅途中，试着说一句。',instruction:'Run a clearly fictional everyday English role-play. Establish one short setting and roles, then say one very short A1–A2 English line in character with an optional Chinese hint. Wait for the learner’s response before continuing; never write both sides. React to what they say, with small charming details. If they ask for help, offer one usable phrase. Do not pretend that imaginary events or bookings really happened.',
 starters:[['雨天咖啡店','开启一个虚构的雨天咖啡店小剧场：你是有点幽默的店员，我用简单英语点单。一次只说一句，等我接话。'],['神秘书店','开启一个虚构的英语书店小剧场：你是店员，店里有一本奇怪的书。我是英语初学者，请用很短的句子和我互动。'],['旅行小插曲','开启一个虚构旅行小剧场：我在车站问路，遇到一点有趣的小插曲。用简单英语，一次等我回答一句。']],
 topics:['我们演一段虚构的酒店入住小剧场，前台有一只爱睡觉的猫。你用一句简单英语开场，等我接。','我们演一段虚构的面包店小剧场。最后一个羊角面包引出一个温暖的小插曲，用很简单的英语。','我们在虚构的旧书店见面，你是店员。我想找一本适合下雨天看的书，一次只练一句英语。'],
 followups:[['给我一句提示','给我一句适合这里的简短英文提示，并简单解释意思，先等我自己试。'],['继续剧情','继续刚才的小剧场，接着我的回应自然往下演，一次只到需要我接话的位置。']]},
 game:{label:'猜词小游戏',mark:'✦',description:'一点线索，猜一个熟悉的英文词。',instruction:'Play a low-pressure word guessing game. Choose one common A1–A2 English word, keep the answer hidden and give one concrete, unambiguous clue. Accept Chinese guesses as well as English; make clear whether the meaning or spelling matched. Give progressively clearer clues if requested, without contradicting earlier clues. Reveal the answer when asked, briefly explain it, and invite another round. Keep one puzzle active at a time. If context is missing, openly start a fresh puzzle. Do not invent scores, streaks or saved mastery.',
 starters:[['来一道简单的','来玩英文猜词吧，先选一个生活里常见的简单单词，用一句简单英文给线索，先不要公布答案。'],['用中文猜也行','我想玩猜词，用中文给我一条具体线索，允许我先用中文猜，猜到后再一起看英文。'],['食物主题','来玩食物主题的英语猜词。选一个简单词，先给一条线索，等我猜，不要直接告诉我答案。']],
 topics:['来一题动物主题的英文猜词吧，先给一条具体线索，等我猜。','来一题家里常见物品的猜词，用简单英文给线索，暂时别揭晓。','来一题旅行用品猜词，我可以用中文或英文猜。先只给一条线索。'],
 followups:[['再给一点线索','给刚才的同一个词再加一条更明显的线索，暂时不要揭晓答案。'],['揭晓这一题','揭晓刚才那一题的英文答案，用一句中文解释，再问我是否想换一题。']]},
 focus:{label:'五分钟搭子',mark:'🌱',description:'一起把“开始”变小一点。',instruction:'Help the learner choose one tiny English action that could fit in five minutes. Use a gentle collaborative tone. Offer at most two concrete options; after they choose, do only the first step and wait. Give feedback on their actual response. Never claim a timer is running, a reminder will be sent, or task progress is automatically saved. If they want to stop or chat, follow their lead.',
 starters:[['陪我开始','我想学五分钟，但有点不想动。给我两个很小的开始选项，选完以后陪我做第一步。'],['一个词也算','今天先陪我把一个简单英文词用起来吧，给我一个很短、能接话的练习。'],['我总是拼错','我刚才又拼错单词了，有点泄气。先接住我的心情，再给我一个很小的拼写练习，不用一口气讲很多。']],
 topics:['陪我用一句简单英文描述眼前的一样东西，先给我一个很容易的开头。','陪我把“我今天有点累”说成一句简单英文。让我先试，你再给反馈。','陪我练一句点饮料的英语，只做一小步就好，先让我选饮料。'],
 followups:[['这一步做完了','这一步我做完了。接着我刚才的实际回答，给一点具体反馈，再提一个可选的小步骤。'],['再小一点','这一步对我还是有点难，请再拆小一点，只留一个马上能尝试的动作。']]}
});
export function companionChoice(mode='chat',tone='warm'){
 if(typeof mode!=='string'||!Object.hasOwn(COMPANION_MODES,mode)||typeof tone!=='string'||!Object.hasOwn(COMPANION_TONES,tone))throw Object.assign(new Error('请选择有效的陪伴玩法和聊天风格。'),{status:400});
 return {mode:COMPANION_MODES[mode],tone:COMPANION_TONES[tone]};
}
