// All passages, questions, prompts and teaching notes below are original examples.
// They are not official IELTS materials, full practice tests, or band predictors.
const q=(prompt,options,answer,explanation)=>({prompt,options,answer,explanation});
const practice=(id,kind,title,level,text,questions,glossary)=>({id,kind,title,level,text,questions,glossary,minutes:kind==='阅读'?12:10});
export const PRACTICES=[
 practice('r01','阅读','A quieter library · 安静的图书馆','A2',
 `Last year, Hill Street Library changed its opening hours. It now opens at eight in the morning instead of nine. The manager wanted to help people who study before work. The library also created a quiet room on the first floor. Visitors can read there, but they cannot make phone calls.\n\nAt first, only a few people used the room. A local teacher then shared a photograph of it online. Within a month, the room was often full before ten. The library has not decided whether to create a second quiet room. Staff will ask visitors for their opinions next month.`,
 [q('What time does the library open now?',['Eight','Nine','Ten'],0,'now opens at eight；nine 是调整前的时间。'),q('Why did the manager change the hours?',['To reduce costs','To help people study before work','To close the library earlier'],1,'第一段说明 wanted to help people who study before work。'),q('What is NOT allowed in the quiet room?',['Reading','Studying','Making phone calls'],2,'cannot make phone calls 表示不能打电话。'),q('A second quiet room has already opened.',['True','False','Not Given'],1,'has not decided whether to create a second room 与已经开放相矛盾。'),q('The teacher works at a nearby primary school.',['True','False','Not Given'],2,'文章只说 local teacher，没有说明任教学段。')], 'instead of 代替；within a month 在一个月内；opinion 意见'),
 practice('r02','阅读','The repair café · 修理咖啡馆','A2–B1',
 `On the first Saturday of each month, a community hall becomes a repair café. Residents bring broken lamps, clothes and small toys. Volunteers help them repair these items. The service is free, although visitors pay for any new parts they need.\n\nThe organisers originally hoped to reduce waste. They soon noticed another benefit: people who lived alone stayed to talk after their repairs were finished. Tea is now available at a shared table. The café does not accept large electrical appliances because the hall has limited space. Last month, volunteers repaired 38 of the 50 items that visitors brought. The remaining items needed specialist attention.`,
 [q('How often does the repair café open?',['Every Saturday','Once a month','Twice a year'],1,'On the first Saturday of each month 表示每月一次。'),q('What do visitors pay for?',['New parts','Volunteer time','Entry'],0,'服务免费，但新零件由来访者付费。'),q('What unexpected benefit did organisers notice?',['Lower rent','More opportunities to talk','Faster bus journeys'],1,'住在独居家庭的人会留下聊天。'),q('Why are large appliances not accepted?',['They are too old','There is limited space','Nobody brings them'],1,'because 后直接说明空间有限。'),q('How many items were repaired last month?',['12','38','50'],1,'50 是带来的总数；38 是修好的数量。')], 'repair 修理；parts 零件；appliance 电器；remaining 剩余的'),
 practice('r03','阅读','Learning in short sessions · 短时学习','B1',
 `A college compared two ways of practising new vocabulary in one class. Twelve students studied for thirty minutes on Monday. Another twelve studied for ten minutes on Monday, Wednesday and Friday. Both groups used the same word list and spent thirty minutes studying in total.\n\nIn a test the following week, the second group remembered more words on average. However, the teacher warned against drawing a broad conclusion. The groups were small, and the students had chosen their own study schedule. Students who chose several short sessions may already have had stronger study habits. The teacher plans a larger trial in which schedules will be assigned randomly.`,
 [q('How many students took part?',['12','24','30'],1,'两组各12人，总共24人。'),q('Both groups spent the same total time studying.',['True','False','Not Given'],0,'both groups...spent thirty minutes studying in total。'),q('Which group remembered more words on average?',['The Monday-only group','The short-session group','The passage does not say'],1,'second group 指分三次学习的组。'),q('Why should the result be interpreted carefully?',['The words were different','The groups were small and schedules were self-selected','The test was cancelled'],1,'small 和 chosen their own schedule 是两个限制。'),q('The larger trial will involve 200 students.',['True','False','Not Given'],2,'文中未给下一次试验的具体人数。')], 'on average 平均；trial 试验；randomly 随机地；conclusion 结论'),
 practice('r04','阅读','A new bus route · 新公交路线','B1',
 `The town of Eastford introduced bus route 16 in March. It connects the railway station with a business park. Before the route opened, workers without cars usually walked for twenty-five minutes from the station. The bus journey takes eight minutes, although waiting time can make the total trip longer.\n\nDuring the first month, only 90 passengers used the service each weekday. After the timetable was changed to match the arrival of morning trains, the daily figure rose to 160. The council will review the route after six months. Passenger numbers are one measure of success, but the council also wants to know whether the route helps people accept jobs at the business park.`,
 [q('What does route 16 connect?',['Two schools','A station and a business park','A hospital and a library'],1,'第一段第二句给出路线两端。'),q('How long is the bus journey itself?',['8 minutes','16 minutes','25 minutes'],0,'注意 journey 本身8分钟，不包括候车。'),q('What changed before passenger numbers rose?',['The ticket price','The timetable','The business park'],1,'班次时间表配合早班火车后人数上升。'),q('The number rose from 90 to ___.',['160','250','70'],0,'160 是新总数；70 是增量。'),q('What else does the council want to examine?',['Access to jobs','Train ticket colours','School holidays'],0,'whether the route helps people accept jobs。')], 'timetable 时刻表；council 地方议会；measure 衡量指标；weekday 工作日'),
 practice('r05','阅读','Growing food on a roof · 屋顶菜园','B1',
 `A hotel converted part of its flat roof into a vegetable garden. Before planting, engineers checked that the roof could carry the extra weight of soil and water. The garden now produces herbs and salad leaves for the hotel kitchen. It supplies only a small share of the kitchen's vegetables, so the hotel still buys most of its food from suppliers.\n\nThe manager says the project has encouraged staff to think about food waste. Kitchen workers now record how much food is thrown away each day. A study would be needed to find out whether the garden has reduced the building's energy use. The manager does not currently have evidence to support that claim.`,
 [q('What did engineers check?',['The roof’s ability to carry extra weight','The price of herbs','The number of guests'],0,'checked...carry the extra weight。'),q('The garden provides most of the hotel’s vegetables.',['True','False','Not Given'],1,'only a small share 与 most 相矛盾。'),q('What do kitchen workers now record?',['Daily food waste','Room temperature','Guest ages'],0,'record how much food is thrown away each day。'),q('The garden has been proved to reduce energy use.',['True','False','Not Given'],1,'明确说目前没有支持该说法的证据，并且需要研究，尚未被证明。'),q('When did the garden open?',['In March','Last summer','The passage does not say'],2,'没有给出具体开园时间。')], 'convert 改造；soil 土壤；share 份额；evidence 证据'),
 practice('r06','阅读','Flexible work, different needs · 弹性工作的不同需求','B1–B2',
 `A small design company tested a flexible starting time. Employees could arrive between seven and ten, provided that everyone was present from ten until three. Weekly working hours did not change. A survey after three months found that most employees valued the choice, especially those with long journeys or childcare responsibilities.\n\nThere were difficulties too. Junior staff sometimes had to wait for a colleague before they could ask a question. The company therefore introduced a shared calendar showing when each person expected to arrive. The director described the trial as promising but said that the survey measured satisfaction, not productivity. The company had not yet compared the quality or quantity of completed work.`,
 [q('When did everyone have to be present?',['From seven to ten','From ten to three','From three to seven'],1,'provided that 后说明共同在岗时间。'),q('Weekly working hours were reduced.',['True','False','Not Given'],1,'Weekly working hours did not change。'),q('Why was a shared calendar introduced?',['To help staff know when colleagues would arrive','To calculate salaries','To organise holidays only'],0,'帮助新人了解同事何时到岗，减少等待求助的不确定性。'),q('What did the survey measure?',['Productivity','Satisfaction','Profit'],1,'明确为 satisfaction, not productivity。'),q('What is the best title for this passage?',['Flexible hours: benefits and practical limits','Why all offices should close','A company doubles its output'],0,'文章同时描述了好处、问题与尚未衡量的指标。')], 'provided that 只要；junior 初级的；satisfaction 满意度；productivity 生产效率'),
 practice('l01','听力','A library membership · 办理借书证','A2',
 `Hello, I'd like to join the library. My name is Anna Green. That's Green, G R E E N. I live at 24 Lake Road. I moved here last Tuesday. My phone number is 07182 640 395. I would like to receive notices by email, not by post. I can collect my library card on Friday afternoon.`,
 [q('What is the family name?',['Gray','Green','Brown'],1,'注意逐字母拼读 G R E E N。'),q('What is the house number?',['24','42','14'],0,'24 Lake Road。'),q('When did Anna move?',['Last Thursday','Last Tuesday','Last Friday'],1,'last Tuesday，Friday 是领取卡的时间。'),q('How does she prefer to receive notices?',['By post','By phone','By email'],2,'by email, not by post。'),q('When will she collect her card?',['Friday morning','Friday afternoon','Tuesday afternoon'],1,'Friday afternoon。')], 'membership 会员资格；notice 通知；collect 领取'),
 practice('l02','听力','Booking a workshop · 预约研习班','A2',
 `Thank you for calling the arts centre. Our photography workshop was originally planned for Saturday the twelfth, but it will now take place on Sunday the thirteenth. It starts at ten thirty and finishes at one. The fee is eighteen pounds, including lunch. Please bring a camera. You do not need to bring a laptop. The workshop is in Room Four on the ground floor.`,
 [q('Which day will the workshop take place?',['Saturday the twelfth','Sunday the thirteenth','Monday the fourteenth'],1,'but 后更正为 Sunday the thirteenth。'),q('What time does it start?',['10:00','10:30','13:00'],1,'ten thirty，one 是结束时间。'),q('What is the fee?',['£8','£18','£80'],1,'eighteen pounds。'),q('What must participants bring?',['A laptop','Lunch','A camera'],2,'Please bring a camera；无需带电脑。'),q('Where is the workshop?',['Room Four, ground floor','Room Four, first floor','Room Five, ground floor'],0,'最后一句给出房间和楼层。')], 'originally 原来；fee 费用；ground floor 底层'),
 practice('l03','听力','A campus tour · 校园参观','B1',
 `Welcome to West College. We will begin our tour at the main entrance beside the clock tower. First, we will visit the science building. The library was going to be our second stop, but it is closed this morning. Instead, we will go to the sports centre. You can leave your bags at reception there. We will finish at the student café at twelve fifteen. Please keep your visitor badge visible during the tour.`,
 [q('Where does the tour start?',['At the student café','At the main entrance','At the sports centre'],1,'begin...at the main entrance。'),q('Which building is visited first?',['The science building','The library','The café'],0,'First, we will visit the science building。'),q('Why is the second stop changed?',['It is too far away','The library is closed','The guide is late'],1,'but it is closed this morning。'),q('Where can visitors leave bags?',['At sports centre reception','In the library','Beside the clock tower'],0,'there 指前一句 sports centre。'),q('When does the tour finish?',['12:50','12:05','12:15'],2,'twelve fifteen；练习区分 fifteen/fifty。')], 'entrance 入口；reception 接待处；badge 胸牌；visible 可见的'),
 practice('l04','听力','Changing a reservation · 更改预订','B1',
 `Hello, I'm calling about my reservation for six people on Friday evening. The booking is under the name Patel. We originally asked for a table at seven, but could we change that to half past seven? One person can no longer come, so there will be five of us. We would prefer a table away from the door. One guest does not eat dairy products, but nobody has requested a vegetarian meal. Please confirm the changes by text message.`,
 [q('What is the name on the booking?',['Patel','Peter','Patrick'],0,'under the name Patel。'),q('What time is now requested?',['7:00','7:30','6:30'],1,'从 seven 改为 half past seven。'),q('How many people are coming now?',['Six','Four','Five'],2,'one person...no longer come，最终 five。'),q('What does one guest avoid?',['All vegetables','Dairy products','All meat'],1,'does not eat dairy products；不可把未要求素餐理解为所有人都吃肉。'),q('How should the restaurant confirm?',['By text message','By email','By post'],0,'最后一句明确 by text message。')], 'reservation 预订；dairy 乳制品；confirm 确认')
];

const lesson=(id,title,body)=>({id,kind:'基础讲义',title,level:'A1–B1',minutes:8,body});
const task=(id,kind,title,prompt,steps)=>({id,kind,title,level:'基础 → 雅思',minutes:kind==='写作'?20:8,body:[prompt,...steps]});
export const NOTES=[
 lesson('n01','否定句先找动词：be / do / 情态动词',[
 '第一步：原句是 be 动词吗？I am tired. → I am not tired. She is busy. → She is not busy. They were late. → They were not late。不要写 She doesn’t busy。',
 '第二步：普通动词的一般现在时，用 do not / does not + 原形。I work. → I do not work. He works. → He does not work。doesn’t 后去掉 works 的 s。',
 '第三步：一般过去时用 did not + 原形。She went home. → She did not go home。不要写 didn’t went。',
 '情态动词后直接加 not：can’t swim、shouldn’t smoke、must not park。',
 '自己试：她昨天没去图书馆。参考：She did not go to the library yesterday。再试：这道题不难。参考：This question is not difficult。'
 ]),
 lesson('n02','三种时间线：平时、过去、现在正在',[
 '平时：I study English every day. 第三人称单数：She studies English every day。看到 every day、usually，要考虑一般现在时。',
 '过去：I studied English yesterday. 先检查动词是否不规则：go → went，write → wrote，buy → bought。',
 '此刻正在：I am studying now. 主语 + am/is/are + doing，不能漏掉 be。',
 '改错：He study yesterday. → He studied yesterday. She is learn now. → She is learning now。',
 '自测：他们平时乘公交。他们昨天乘公交。他们现在正等公交。参考：They usually take the bus. They took the bus yesterday. They are waiting for the bus now。'
 ]),
 lesson('n03','拼写不靠多看：遮住、写出、核对',[
 '看清一个词后，遮住英文，只看中文写出来。核对字母位置，再隔几分钟重写。这比只判断“好像认识”更能暴露拼写问题。',
 '本地易错组：receive 中 ei；environment 中有 n；necessary 一个 c、两个 s；accommodation 两个 c、两个 m。',
 '把错误拆成一处：studdy → study（多了 d），enviroment → environment（漏了 n）。每次只记清一个具体差别。',
 '今天选三个错词，各写一句短句。不会时标记“不会”，拼错后不要急着选择“记住”。'
 ]),
 lesson('n04','阅读判断题：True / False / Not Given',[
 'True：原文支持陈述。False：原文与陈述矛盾。Not Given：原文信息不足，既不能确认也不能否定。只根据文章判断，不用常识补全。',
 '原文：The library opens at eight. 陈述：The library opens at nine. → False，因为时间矛盾。陈述：The library has ten staff. → Not Given，因为原文没说人数。',
 '圈出陈述里的限定词：all、only、always、most、before。找到同义表达，再核对人物、时间、范围。',
 '不要因为“这句话看起来合理”就选 True。错题记录应包含原文证据和你漏看的限定词。'
 ]),
 lesson('n05','听力中的改口、数字和否定',[
 '听到 but、actually、instead、sorry，要留意后面是否更正了前面的信息。We booked for six, but now there are five. 最终人数是 five。',
 '先看题目预测答案类型：时间、日期、姓名、价格或地点。数字练习应同时核对单位。',
 'fifteen / fifty、thirteen / thirty 容易混淆。用上下文帮助判断，但不要凭猜测补写。',
 '练习流程：第一遍抓信息；第二遍核对；最后看文本。记下漏听的是连读、词义还是改口。本项目语音合成仅是文本听写辅助，不能替代官方录音。'
 ]),
 lesson('n06','图表基础：from、to、by',[
 '从20升到30：rose from 20 to 30。增加了10：rose by 10。两种说法描述同一个变化，但介词后的数字不同。',
 '20%升到30%：增加10个百分点（10 percentage points）；相对增幅是50%。别把百分点与百分比增幅混为一谈。',
 '过去的完整年份通常用过去时：In 2010, the figure was 20. By 2020, it had risen to 30。选择最容易准确控制的句子结构即可。',
 '先写整体趋势，再比较最大的差异。不要为图表捏造原因。单位、时间、类别都要核对。'
 ]),
 lesson('n07','写作段落：观点、解释、例子',[
 '先写一个清晰观点：Public libraries are useful for students。',
 '解释为什么：They provide a quiet place to study when homes are noisy。',
 '给一个具体但不过度夸大的例子：For example, a student who shares a small room can read at a library after school。',
 '最后检查：每一句是否支持同一个观点？有没有主语和谓语？否定与时态正确吗？不要为了“高级词”牺牲意思。',
 '练习：用3句英文解释“每天短时间学习的好处”。先自己写，再用 AI 检查基础错误。'
 ]),
 lesson('n08','口语起步：回答 + 原因 + 细节',[
 '问题：Do you enjoy reading? 回答：Yes, I do. 原因：It helps me relax. 细节：I usually read short stories before bed。',
 '不需要每题都背一段长答案。先保证回答相关，再加一个真实细节。',
 '过去经历要切换时间：Last weekend, I visited a park with my friend. We walked for an hour。',
 '文字反馈只能检查表达和内容；发音、停顿与流利度需要听实际录音。自己录一遍，听出最明显的一处问题，再重说。'
 ]),
 task('w01','写作','从 3 句话写起：学习习惯','原创微写作：Describe one habit that helps you learn English.', ['先写30–60词：习惯是什么、何时做、为什么有用。','检查每句主谓、第三人称 s 与拼写；写完后再看基础讲义 n07。']),
 task('w02','写作','Task 1 起步：交通方式比较','原创虚构数据：某学院学生通学方式，2010年公交40%、汽车40%、自行车20%；2020年公交50%、汽车20%、自行车30%。用英文概述主要变化。', ['先写两句 overview：公交与自行车增加，汽车减少。','再写具体比较；仅依据这组数据，不编造原因。完整练习可写150词以上，初学者先写60–100词。']),
 task('w03','写作','Task 1 起步：图书借阅趋势','原创虚构数据：某图书馆借阅量，2021年12,000本、2022年15,000本、2023年14,000本、2024年18,000本。描述总体趋势及明显变化。', ['检查单位是“本”，不是人数。','整体增加但2023年略降；区分 rose to 与 rose by。先写4句准确句子，再扩展。']),
 task('w04','写作','Task 2：公共图书馆','原创讨论题：Some people think public libraries are less useful because information is available online. To what extent do you agree or disagree?', ['先选择清楚立场，列两个理由；可承认在线信息的便利。','一个主体段只展开一个理由。完整练习可写250词以上，基础阶段先完成一个80词段落。']),
 task('w05','写作','Task 2：城市交通','原创讨论题：Should cities spend more money on public transport than on new roads? Discuss your view.', ['列出方便通勤、费用、拥堵等角度；选自己能用英文说清的两个。','避免所有人、永远等绝对化表达；举具体场景，不编造调查百分比。']),
 task('w06','写作','Task 2：在线学习','原创讨论题：What are the advantages and disadvantages of studying online?', ['先列一个优势和一个劣势，并各写解释。','检查对比连接词、单复数和时态。结尾概括观点，不加入突然的新理由。']),
 task('s01','口语','Part 1：家乡','原创练习：Where is your hometown? What do you like about it? Has it changed in recent years?', ['每题先说2–3句；给一个真实细节。','前两题一般现在时，变化题可用现在完成时或明确过去时。']),
 task('s02','口语','Part 1：日常学习','原创练习：When do you study best? Do you prefer studying alone? What do you find difficult about English?', ['回答 + 原因 + 具体例子。','可以诚实说困难，用 I find spelling difficult 起步。']),
 task('s03','口语','Part 1：交通','原创练习：How do you usually travel? Did you walk to school as a child? Would you like to cycle more?', ['注意 usually、as a child、would 对时间和语气的提示。','重说一次，修正最明显的动词错误。']),
 task('s04','口语','Part 2：帮助过你的人','原创话题卡：Describe a person who helped you. Say who the person was, what happened, how they helped and how you felt.', ['准备1分钟，只记关键词；尝试讲1–2分钟。','按事件先后组织，主要使用过去时；不要逐字背稿。']),
 task('s05','口语','Part 2：想学的技能','原创话题卡：Describe a skill you would like to learn. Say what it is, why you want to learn it, how you would learn it and when you could practise.', ['按四个提示列要点；每点加一个细节。','先使用 would like to、plan to、can 等自己能控制的结构。']),
 task('s06','口语','Part 2：安静的地方','原创话题卡：Describe a quiet place you enjoy visiting. Say where it is, when you go, what you do and why you like it.', ['准备地点、活动、感受三个具体词。','重复练习时换一个例子，避免完全背诵。']),
 task('s07','口语','Part 3：社区与公共空间','原创讨论：Why do cities need public spaces? How can libraries support a community? Who should pay for these services?', ['从个人例子扩展到群体；用 some people、many families 限定范围。','每题说明理由，再加一个可能的例外。']),
 task('s08','口语','Part 3：工作与科技','原创讨论：How has technology changed work? Can working from home suit everyone? What skills may workers need in the future?', ['比较优点和限制，不必使用复杂术语。','用 may、can 表达可能性；文字 AI 反馈不能判断你的发音。'])
];
export const LIBRARY=[...PRACTICES,...NOTES];
export const CONTENT_SOURCE='YAN 原创学习示例（AI 辅助编写）· 非雅思真题 · MIT';
