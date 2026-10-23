// Original learning examples written for YAN English Studio. MIT licensed.
// Stable IDs are appended to the v1 bank; never renumber existing entries.
const rows = `
accommodation|住宿|校园生活|The college offers affordable accommodation.|学院提供价格合理的住宿。
assignment|作业；任务|校园生活|I finished my assignment before dinner.|我在晚饭前完成了作业。
attendance|出勤|校园生活|Regular attendance helps students follow the course.|规律出勤有助于学生跟上课程。
campus|校园|校园生活|There is a small lake on campus.|校园里有一个小湖。
certificate|证书|校园生活|She received a certificate after the course.|课程结束后她获得了一张证书。
curriculum|课程体系|校园生活|The new curriculum includes practical skills.|新课程体系包括实用技能。
deadline|截止时间|校园生活|The deadline for this essay is Friday.|这篇文章的截止时间是星期五。
degree|学位|校园生活|He is studying for a degree in history.|他正在攻读历史学位。
dormitory|学生宿舍|校园生活|The dormitory is close to the library.|学生宿舍靠近图书馆。
enrol|报名；注册入学|校园生活|You can enrol online before Monday.|你可以在星期一之前在线报名。
faculty|院系；全体教员|校园生活|The faculty of science has a new laboratory.|理学院有了一个新实验室。
feedback|反馈|校园生活|Please read the feedback before rewriting your essay.|请在重写文章前阅读反馈。
graduate|毕业|校园生活|She hopes to graduate next summer.|她希望明年夏天毕业。
lecture|讲座；大学课堂|校园生活|The lecture begins at nine.|这堂课九点开始。
module|课程单元|校园生活|This module focuses on academic writing.|这个单元侧重学术写作。
scholarship|奖学金|校园生活|He applied for a scholarship to cover his fees.|他申请了奖学金来支付学费。
seminar|研讨课|校园生活|We discussed the article in a seminar.|我们在研讨课上讨论了这篇文章。
tutor|导师；辅导老师|校园生活|My tutor explained the difficult paragraph.|我的导师解释了那个难懂的段落。
undergraduate|本科生|校园生活|The workshop is open to all undergraduates.|这个工作坊面向所有本科生。
workshop|工作坊；研习班|校园生活|The writing workshop lasts two hours.|写作工作坊持续两小时。
biodiversity|生物多样性|环境与城市|The park protects local biodiversity.|这座公园保护当地的生物多样性。
carbon|碳|环境与城市|The factory wants to reduce its carbon emissions.|这家工厂希望减少碳排放。
conservation|保护；节约|环境与城市|Water conservation is important in dry areas.|在干旱地区节约用水很重要。
drought|干旱|环境与城市|The drought damaged many farms.|干旱损害了许多农场。
ecosystem|生态系统|环境与城市|A small change can affect the whole ecosystem.|一个小变化可能影响整个生态系统。
emission|排放；排放物|环境与城市|Cleaner buses can reduce harmful emissions.|更清洁的公交车可以减少有害排放。
flood|洪水|环境与城市|The flood closed the road for two days.|洪水使这条路封闭了两天。
habitat|栖息地|环境与城市|These birds are losing their natural habitat.|这些鸟正在失去天然栖息地。
landfill|垃圾填埋场|环境与城市|Less waste should go to landfill.|应该减少送往填埋场的垃圾。
renewable|可再生的|环境与城市|Wind is a renewable source of energy.|风是一种可再生能源。
reusable|可重复使用的|环境与城市|I carry a reusable bottle to class.|我带一个可重复使用的水瓶去上课。
species|物种|环境与城市|Several species of fish live in this river.|这条河里生活着几种鱼。
sustainable|可持续的|环境与城市|The city needs a sustainable transport plan.|这座城市需要一个可持续的交通方案。
urban|城市的|环境与城市|Urban parks give residents space to relax.|城市公园为居民提供放松的空间。
rural|乡村的|环境与城市|Some rural areas have limited public transport.|一些乡村地区公共交通有限。
pedestrian|行人|环境与城市|Drivers must stop for pedestrians at this crossing.|司机必须在这个人行横道前为行人停车。
congestion|拥堵|环境与城市|Traffic congestion is worse in the morning.|早上的交通拥堵更严重。
commute|通勤|环境与城市|I commute by train three days a week.|我每周有三天乘火车通勤。
infrastructure|基础设施|环境与城市|The town is investing in its infrastructure.|这座城镇正在投资基础设施。
resident|居民|环境与城市|Local residents asked for more trees.|当地居民要求增加树木。
analyse|分析|学术表达|We need to analyse the results carefully.|我们需要仔细分析结果。
approach|方法；途径|学术表达|This approach may help younger learners.|这种方法可能帮助更年轻的学习者。
assumption|假设；假定|学术表达|The argument is based on a weak assumption.|这个论点基于一个站不住脚的假设。
category|类别|学术表达|Put each answer in the correct category.|把每个答案放进正确的类别。
clarify|澄清；解释清楚|学术表达|Could you clarify the final point?|你能解释清楚最后一点吗？
conclude|得出结论|学术表达|We cannot conclude that the plan will succeed.|我们不能断定这个计划会成功。
consistent|一致的；持续的|学术表达|Her results are consistent with the earlier study.|她的结果与先前的研究一致。
criteria|标准（复数）|学术表达|The teacher explained the assessment criteria.|老师解释了评估标准。
demonstrate|证明；展示|学术表达|This example demonstrates the main problem.|这个例子展示了主要问题。
distribution|分布；分配|学术表达|The chart shows the distribution of income.|这张图显示了收入分布。
estimate|估计|学术表达|We estimate that the task will take an hour.|我们估计这项任务需要一小时。
evaluate|评价；评估|学术表达|The report evaluates two possible solutions.|报告评估了两种可能的解决方案。
factor|因素|学术表达|Cost is an important factor in this decision.|成本是这项决定中的重要因素。
indicate|表明|学术表达|The figures indicate a small improvement.|这些数字表明有小幅改善。
interpret|解释；理解|学术表达|Different readers may interpret the text differently.|不同读者可能对文本有不同的理解。
justify|证明合理；说明理由|学术表达|You should justify your opinion with an example.|你应该用一个例子说明观点的理由。
method|方法|学术表达|We used a simple method to count the birds.|我们用一种简单的方法数鸟。
relevant|相关的|学术表达|Choose evidence that is relevant to the question.|选择与问题相关的证据。
significant|显著的；重要的|学术表达|There was a significant fall in sales.|销售额显著下降。
source|来源|学术表达|Always check the source of the information.|始终检查信息的来源。
affordable|负担得起的|社会与工作|The centre provides affordable meals.|该中心提供价格实惠的饭菜。
benefit|好处；受益|社会与工作|Flexible hours can benefit working parents.|弹性工作时间可以使在职父母受益。
budget|预算|社会与工作|We need to stay within our monthly budget.|我们需要控制在每月预算之内。
colleague|同事|社会与工作|A colleague helped me solve the problem.|一位同事帮我解决了问题。
consumer|消费者|社会与工作|Consumers want clear information about prices.|消费者希望获得清晰的价格信息。
demand|需求|社会与工作|Demand for online courses has increased.|在线课程的需求增加了。
employment|就业|社会与工作|The project created new employment opportunities.|这个项目创造了新的就业机会。
entrepreneur|创业者；企业家|社会与工作|The young entrepreneur opened a repair shop.|这位年轻创业者开了一家维修店。
expense|开销|社会与工作|Travel is my largest monthly expense.|交通是我每月最大的开销。
flexible|灵活的|社会与工作|My employer offers flexible working hours.|我的雇主提供灵活的工作时间。
income|收入|社会与工作|Her income covers rent and food.|她的收入足以支付房租和食物。
inequality|不平等|社会与工作|Education can help reduce inequality.|教育可以帮助减少不平等。
investment|投资|社会与工作|The new school needs more investment.|这所新学校需要更多投资。
occupation|职业|社会与工作|Please write your occupation on the form.|请在表格上填写你的职业。
productivity|生产效率|社会与工作|Regular breaks may improve productivity.|定期休息可能提高工作效率。
qualification|资格；学历|社会与工作|This job requires a teaching qualification.|这份工作需要教师资格。
recruit|招聘|社会与工作|The company plans to recruit ten engineers.|公司计划招聘十名工程师。
salary|薪水|社会与工作|The salary is paid at the end of each month.|薪水在每个月月底支付。
shift|轮班|社会与工作|My evening shift ends at ten.|我的晚班十点结束。
volunteer|志愿者；自愿做|社会与工作|She volunteers at the local library.|她在当地图书馆做志愿者。
appointment|预约|健康与服务|I have a dental appointment tomorrow.|我明天有一个牙科预约。
balanced|均衡的|健康与服务|A balanced diet includes different kinds of food.|均衡饮食包括不同种类的食物。
concentration|注意力；专注|健康与服务|Too much noise affects my concentration.|太多噪声影响我的注意力。
consultation|咨询；就诊|健康与服务|The first consultation takes thirty minutes.|第一次咨询需要三十分钟。
dehydration|脱水|健康与服务|Drinking enough water helps prevent dehydration.|喝足够的水有助于预防脱水。
diagnosis|诊断|健康与服务|The doctor explained the diagnosis clearly.|医生清楚地解释了诊断结果。
fatigue|疲劳|健康与服务|She felt fatigue after the long journey.|长途旅行后她感到疲劳。
fitness|健康；体能|健康与服务|Walking every day can improve fitness.|每天走路可以改善体能。
injury|伤害；受伤|健康与服务|He missed the match because of an injury.|他因受伤错过了比赛。
insurance|保险|健康与服务|Check whether your insurance covers the visit.|检查你的保险是否涵盖这次就诊。
mental|心理的；精神的|健康与服务|Rest is important for mental health.|休息对心理健康很重要。
nutrition|营养|健康与服务|The course teaches the basics of nutrition.|这门课教授营养基础知识。
patient|病人；有耐心的|健康与服务|The nurse spoke gently to the patient.|护士温和地对病人说话。
prescription|处方|健康与服务|Take this prescription to the pharmacy.|把这张处方拿到药房。
recovery|康复；恢复|健康与服务|Her recovery was slower than expected.|她的康复比预期慢。
routine|日常安排|健康与服务|A simple routine helps me sleep regularly.|简单的日常安排有助于我规律睡眠。
symptom|症状|健康与服务|Tell the doctor about your symptoms.|把你的症状告诉医生。
therapy|治疗|健康与服务|The hospital offers several types of therapy.|这家医院提供几种治疗方法。
treatment|治疗；处理|健康与服务|The treatment lasted six weeks.|治疗持续了六周。
wellbeing|身心健康；幸福感|健康与服务|Time with friends can support our wellbeing.|与朋友相处有助于我们的身心健康。
approximately|大约|图表表达|Approximately half of the students cycle to school.|大约一半的学生骑车上学。
decline|下降|图表表达|The number of visitors declined in winter.|冬季游客数量下降了。
fluctuate|波动|图表表达|Prices fluctuate throughout the year.|价格全年都在波动。
gradual|逐渐的|图表表达|The graph shows a gradual rise in temperature.|图表显示温度逐渐上升。
majority|大多数|图表表达|The majority of respondents preferred buses.|大多数受访者更喜欢公交车。
minority|少数|图表表达|Only a small minority chose the expensive option.|只有一小部分人选择了昂贵的选项。
overall|总体上|图表表达|Overall, the figures show an upward trend.|总体上，这些数字呈上升趋势。
peak|峰值；达到峰值|图表表达|Sales reached a peak in July.|销售额在七月达到峰值。
percentage|百分比|图表表达|The percentage rose from twenty to thirty.|百分比从百分之二十升至百分之三十。
proportion|比例|图表表达|A smaller proportion travelled by car.|开车出行的比例较小。
respectively|分别地|图表表达|The two groups had ten and twelve members respectively.|这两个小组分别有十人和十二人。
roughly|大约；粗略地|图表表达|Roughly a third of the budget went to transport.|大约三分之一的预算用于交通。
sharp|急剧的|图表表达|There was a sharp drop in demand.|需求急剧下降。
slight|轻微的|图表表达|We noticed a slight increase in cost.|我们注意到成本略有增加。
stable|稳定的|图表表达|The population remained stable for five years.|人口连续五年保持稳定。
steady|平稳的；持续的|图表表达|The company reported steady growth.|公司报告了持续增长。
trend|趋势|图表表达|This trend continued until May.|这一趋势持续到五月。
whereas|然而；而|图表表达|Bus use increased, whereas car use fell.|公交出行增加了，而汽车出行减少了。
double|加倍；两倍的|图表表达|The number doubled from fifty to one hundred.|数量从五十翻倍至一百。
comparison|比较|图表表达|The second paragraph gives a comparison of the two groups.|第二段对这两个小组作了比较。
`.trim().split('\n');
export const EXTRA_WORD_ROWS=rows.map(row=>row.split('|'));
export const EXTRA_GRAMMAR_ROWS=[
 ['否定句','She ___ need a new book.', ["don't","doesn't","isn't"],1,'need 是实义动词；主语 she 的一般现在时否定用 doesn’t + 原形。','她不需要一本新书。'],
 ['过去否定','We did not ___ the bus.', ['caught','catch','catching'],1,'did not 后用动词原形 catch。','我们没赶上公交车。'],
 ['过去否定','The rooms ___ clean yesterday.', ["wasn't","weren't","didn't"],1,'rooms 是复数；形容词 clean 前用 were，否定是 weren’t。','昨天这些房间不干净。'],
 ['现在进行时','They ___ studying at the moment.', ["don't","aren't","doesn't"],1,'be + studying 表示进行；they 对应 are not。','他们此刻没有在学习。'],
 ['现在完成时','I have not ___ this film.', ['see','saw','seen'],2,'have not 后接过去分词 seen。','我没看过这部电影。'],
 ['情态动词否定','You must not ___ here.', ['parks','parking','park'],2,'情态动词 must not 后用原形 park。','你不能在这里停车。'],
 ['时态线索','At eight last night, I ___ an essay.', ['write','was writing','have written'],1,'过去某时刻正在做：was writing。','昨晚八点我正在写文章。'],
 ['时态线索','She ___ in this town since 2020.', ['has lived','lives','is living'],0,'since + 过去时间表示持续到现在，用现在完成时。','她自2020年以来一直住在这座城镇。'],
 ['将来安排','Look at those clouds. It ___ rain.', ['going to','is going to','will to'],1,'有眼前证据的预测可用 be going to；it 对应 is。','看那些云。要下雨了。'],
 ['过去疑问','___ you finish the report yesterday?', ['Do','Did','Have'],1,'yesterday 对应一般过去时；Did 后接原形 finish。','你昨天完成报告了吗？'],
 ['主谓一致','Each student ___ a notebook.', ['have','has','are'],1,'each student 是单数，用 has。','每个学生都有一个笔记本。'],
 ['主谓一致','The number of cars ___ increasing.', ['is','are','be'],0,'主语核心是 the number，按单数处理。','汽车数量正在增加。'],
 ['主谓一致','A number of students ___ absent today.', ['is','are','was'],1,'a number of 表示许多，后面的 students 按复数处理。','今天许多学生缺席。'],
 ['不可数名词','We need more ___.', ['informations','information','an information'],1,'information 不可数，不加 s，也不直接加 a。','我们需要更多信息。'],
 ['数量表达','There are ___ cars today than yesterday.', ['less','fewer','little'],1,'cars 是可数名词复数，比较数量用 fewer。','今天汽车比昨天少。'],
 ['比较级','This route is ___ than the old one.', ['more short','shorter','shortest'],1,'short 的比较级是 shorter；than 提示比较。','这条路线比旧路线短。'],
 ['被动语态','The library ___ in 2010.', ['built','was built','has build'],1,'图书馆是被建造的；过去时间用 was built。','这座图书馆建于2010年。'],
 ['被动语态','English ___ in many countries.', ['speaks','is spoken','is speaking'],1,'语言被使用，用 is spoken。','许多国家使用英语。'],
 ['条件句','If it rains tomorrow, we ___ indoors.', ['stay','will stay','stayed'],1,'真实将来条件句：if 从句一般现在时，主句 will + 原形。','如果明天下雨，我们会待在室内。'],
 ['条件句','If I had more time, I ___ more books.', ['read','will read','would read'],2,'对现在的假设：if + 过去式，主句 would + 原形。','如果我有更多时间，我会读更多书。'],
 ['动名词','She enjoys ___ in the morning.', ['run','running','to run'],1,'enjoy 后用动名词；run 变 running 双写 n。','她喜欢早上跑步。'],
 ['不定式','I decided ___ the course.', ['join','joining','to join'],2,'decide 后接 to do。','我决定参加这门课程。'],
 ['时间介词','The shop closes ___ six.', ['in','on','at'],2,'具体时刻前用 at。','商店六点关门。'],
 ['连接词','___ it was cold, we went outside.', ['Although','Because','So'],0,'前后有转折，用 although；本句不同时加 but。','虽然天气冷，我们还是出去了。'],
 ['连接词','The road was closed, ___ we took a train.', ['because','so','although'],1,'前面原因、后面结果，用 so。','道路封闭了，所以我们乘了火车。'],
 ['定语从句','The person ___ helped me is a nurse.', ['which','who','where'],1,'先行词 person 指人，关系代词作主语用 who。','帮助我的人是一位护士。'],
 ['冠词','She is ___ honest student.', ['a','an','the'],1,'honest 的 h 不发音，以元音音素开头，首次泛指用 an。','她是一个诚实的学生。'],
 ['拼写与词性','Please speak ___.', ['clear','clearly','clearness'],1,'修饰动词 speak 用副词 clearly。','请说清楚。'],
 ['图表时态','In 2015, sales ___ by ten percent.', ['increase','increased','have increased'],1,'明确过去时间 In 2015，使用过去式 increased。','2015年销售额增加了百分之十。'],
 ['图表介词','The figure rose ___ 20 to 30.', ['by','from','at'],1,'从20升到30：rose from 20 to 30；rose by 10 表示增量10。','该数字从20升至30。']
];
