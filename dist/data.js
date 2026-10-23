// Original beginner learning examples, not official IELTS questions.
import {EXTRA_WORD_ROWS,EXTRA_GRAMMAR_ROWS} from './extra-data.js';
const vocabulary = `
study|v. 学习|学习起步|I study English every day.|我每天学习英语。
learn|v. 学会；学习|学习起步|I want to learn a new word.|我想学习一个新单词。
practice|n. 练习|学习起步|Daily practice helps me improve.|每天练习帮助我进步。
repeat|v. 重复|学习起步|Please repeat the sentence.|请重复这个句子。
remember|v. 记得|学习起步|I remember your name.|我记得你的名字。
forget|v. 忘记|学习起步|Do not forget your book.|别忘了你的书。
understand|v. 理解|学习起步|I understand this question.|我理解这个问题。
explain|v. 解释|学习起步|Can you explain this word?|你能解释这个词吗？
answer|n. 答案；v. 回答|学习起步|Write your answer here.|把答案写在这里。
question|n. 问题|学习起步|I have a question.|我有一个问题。
mistake|n. 错误|学习起步|It is OK to make a mistake.|犯一个错误没关系。
correct|adj. 正确的|学习起步|Your answer is correct.|你的答案是正确的。
improve|v. 改善；提高|学习起步|I want to improve my English.|我想提高英语水平。
progress|n. 进步|学习起步|You are making progress.|你正在取得进步。
goal|n. 目标|学习起步|My goal is to study daily.|我的目标是每天学习。
plan|n. 计划|学习起步|I have a simple study plan.|我有一个简单的学习计划。
focus|v. 集中注意力|学习起步|I focus on one task at a time.|我一次专注于一项任务。
review|v. 复习|学习起步|I review new words at night.|我晚上复习新单词。
sentence|n. 句子|学习起步|This sentence is short.|这个句子很短。
meaning|n. 含义|学习起步|What is the meaning of this word?|这个单词是什么意思？
morning|n. 早晨|日常生活|I walk every morning.|我每天早晨散步。
evening|n. 傍晚；晚上|日常生活|I read in the evening.|我晚上阅读。
breakfast|n. 早餐|日常生活|I eat breakfast at seven.|我七点吃早餐。
lunch|n. 午餐|日常生活|We have lunch together.|我们一起吃午餐。
dinner|n. 晚餐|日常生活|Dinner is ready.|晚餐准备好了。
usually|adv. 通常|日常生活|I usually get up early.|我通常早起。
sometimes|adv. 有时|日常生活|I sometimes take the bus.|我有时坐公共汽车。
always|adv. 总是|日常生活|She always brings a notebook.|她总是带着一本笔记本。
never|adv. 从不|日常生活|He never drinks coffee.|他从不喝咖啡。
early|adv. 早；提早|日常生活|We arrived early.|我们很早就到了。
late|adj. 迟到的|日常生活|I am late for class.|我上课迟到了。
busy|adj. 忙碌的|日常生活|Today is a busy day.|今天是忙碌的一天。
quiet|adj. 安静的|日常生活|The room is quiet.|房间很安静。
clean|adj. 干净的|日常生活|The kitchen is clean.|厨房很干净。
cook|v. 做饭|日常生活|I cook at home.|我在家做饭。
spend|v. 花费|日常生活|I spend an hour reading.|我花一个小时阅读。
choose|v. 选择|日常生活|You can choose a topic.|你可以选择一个主题。
enough|adj. 足够的|日常生活|We have enough time.|我们有足够的时间。
together|adv. 一起|日常生活|We study together.|我们一起学习。
habit|n. 习惯|日常生活|Reading is a useful habit.|阅读是个有用的习惯。
education|n. 教育|校园教育|Education can change lives.|教育可以改变人生。
student|n. 学生|校园教育|Every student has a desk.|每个学生都有一张课桌。
teacher|n. 教师|校园教育|Our teacher is patient.|我们的老师很有耐心。
subject|n. 学科|校园教育|History is my favourite subject.|历史是我最喜欢的学科。
course|n. 课程|校园教育|This course lasts ten weeks.|这门课程持续十周。
lesson|n. 一节课|校园教育|The lesson starts at nine.|这节课九点开始。
library|n. 图书馆|校园教育|The library closes at six.|图书馆六点关门。
college|n. 学院|校园教育|She teaches at a local college.|她在当地一所学院教书。
university|n. 大学|校园教育|He studies at a university.|他在一所大学学习。
knowledge|n. 知识|校园教育|Books give us knowledge.|书籍给我们知识。
skill|n. 技能|校园教育|Writing is an important skill.|写作是一项重要技能。
exam|n. 考试|校园教育|My exam is next week.|我的考试在下周。
result|n. 结果|校园教育|I am happy with the result.|我对结果感到满意。
homework|n. 家庭作业|校园教育|I do my homework after dinner.|我晚饭后做作业。
project|n. 项目|校园教育|We work on a group project.|我们做一个小组项目。
discuss|v. 讨论|校园教育|Let us discuss the problem.|让我们讨论这个问题。
develop|v. 发展；培养|校园教育|Students develop new skills.|学生培养新技能。
prepare|v. 准备|校园教育|I prepare for the exam.|我为考试做准备。
attend|v. 参加；出席|校园教育|I attend classes every Monday.|我每周一上课。
achieve|v. 达到；实现|校园教育|Small steps help us achieve our goals.|小步骤帮助我们实现目标。
city|n. 城市|城市生活|This city has many parks.|这座城市有许多公园。
village|n. 村庄|城市生活|My grandparents live in a village.|我的祖父母住在一个村庄。
building|n. 建筑物|城市生活|That building is very old.|那栋建筑很古老。
street|n. 街道|城市生活|Our street is quiet at night.|我们的街道夜晚很安静。
traffic|n. 交通；车流|城市生活|There is heavy traffic today.|今天交通拥堵。
transport|n. 交通运输|城市生活|Public transport is useful.|公共交通很有用。
station|n. 车站|城市生活|The station is near my home.|车站在我家附近。
distance|n. 距离|城市生活|The distance is about two kilometres.|距离大约是两公里。
local|adj. 当地的|城市生活|We shop at a local market.|我们在当地市场购物。
public|adj. 公共的|城市生活|This is a public park.|这是一个公共公园。
crowded|adj. 拥挤的|城市生活|The bus is crowded.|公共汽车很拥挤。
modern|adj. 现代的|城市生活|The city has a modern library.|这座城市有一座现代化图书馆。
convenient|adj. 方便的|城市生活|Online shopping is convenient.|网上购物很方便。
expensive|adj. 昂贵的|城市生活|The flat is expensive.|这套公寓很贵。
affordable|adj. 负担得起的|城市生活|We need affordable housing.|我们需要负担得起的住房。
population|n. 人口|城市生活|The population is growing.|人口正在增长。
community|n. 社区|城市生活|Our community has a small garden.|我们社区有一个小花园。
neighbour|n. 邻居|城市生活|My neighbour is friendly.|我的邻居很友好。
facility|n. 设施|城市生活|The sports centre is a useful facility.|体育中心是一项有用的设施。
service|n. 服务|城市生活|The hotel provides good service.|这家酒店提供良好的服务。
environment|n. 环境|自然环境|We should protect the environment.|我们应该保护环境。
nature|n. 大自然|自然环境|I enjoy spending time in nature.|我喜欢在大自然中度过时光。
climate|n. 气候|自然环境|The climate is warm and dry.|这里的气候温暖干燥。
weather|n. 天气|自然环境|The weather is cold today.|今天天气很冷。
temperature|n. 温度|自然环境|The temperature is rising.|温度正在上升。
pollution|n. 污染|自然环境|Air pollution is a serious problem.|空气污染是一个严重的问题。
waste|n. 废物；浪费|自然环境|We should reduce food waste.|我们应该减少食物浪费。
recycle|v. 回收利用|自然环境|We recycle paper and glass.|我们回收纸张和玻璃。
energy|n. 能源；能量|自然环境|Solar energy comes from the sun.|太阳能来自太阳。
resource|n. 资源|自然环境|Water is a valuable resource.|水是一种宝贵的资源。
protect|v. 保护|自然环境|Trees help protect the soil.|树木有助于保护土壤。
reduce|v. 减少|自然环境|We need to reduce plastic waste.|我们需要减少塑料垃圾。
increase|v. 增加|自然环境|Exercise can increase your energy.|锻炼可以增加你的活力。
forest|n. 森林|自然环境|Many animals live in the forest.|许多动物生活在森林里。
ocean|n. 海洋|自然环境|Plastic waste can enter the ocean.|塑料垃圾可能进入海洋。
wildlife|n. 野生动物|自然环境|This area is rich in wildlife.|这个地区野生动物丰富。
natural|adj. 自然的|自然环境|The park has natural beauty.|这座公园有自然之美。
damage|n. 损害|自然环境|The storm caused serious damage.|暴风雨造成了严重损害。
solution|n. 解决办法|自然环境|We need a better solution.|我们需要一个更好的解决办法。
sustainable|adj. 可持续的|自然环境|Cycling is a sustainable way to travel.|骑自行车是一种可持续的出行方式。
health|n. 健康|健康生活|Sleep is important for health.|睡眠对健康很重要。
healthy|adj. 健康的|健康生活|A healthy diet includes vegetables.|健康饮食包括蔬菜。
exercise|n. 锻炼|健康生活|Regular exercise helps me relax.|经常锻炼有助于我放松。
diet|n. 饮食|健康生活|Fruit is part of my daily diet.|水果是我日常饮食的一部分。
balance|n. 平衡|健康生活|I need a balance between work and rest.|我需要工作与休息之间的平衡。
stress|n. 压力|健康生活|Walking helps me manage stress.|散步帮助我应对压力。
relax|v. 放松|健康生活|I listen to music to relax.|我听音乐来放松。
rest|n. 休息|健康生活|You need some rest.|你需要休息一下。
sleep|n. 睡眠；v. 睡觉|健康生活|I need eight hours of sleep.|我需要八小时睡眠。
tired|adj. 疲倦的|健康生活|I feel tired after work.|我下班后觉得疲倦。
illness|n. 疾病|健康生活|He missed work because of illness.|他因病没有上班。
patient|n. 病人|健康生活|The doctor is talking to a patient.|医生正在和一位病人说话。
hospital|n. 医院|健康生活|The hospital is open all day.|这家医院全天开放。
treatment|n. 治疗|健康生活|She is receiving treatment.|她正在接受治疗。
prevent|v. 预防；阻止|健康生活|Washing hands helps prevent illness.|洗手有助于预防疾病。
physical|adj. 身体的|健康生活|Physical activity is part of my routine.|身体活动是我日常生活的一部分。
mental|adj. 心理的|健康生活|Rest supports mental health.|休息有助于心理健康。
benefit|n. 好处|健康生活|One benefit of walking is better sleep.|散步的一个好处是睡眠更好。
regular|adj. 有规律的|健康生活|I take regular breaks.|我定时休息。
active|adj. 活跃的|健康生活|My grandmother is very active.|我的祖母非常活跃。
work|n. 工作；v. 工作|工作与职业|I walk to work.|我步行去上班。
career|n. 职业生涯|工作与职业|She wants a career in education.|她想从事教育工作。
job|n. 工作；职位|工作与职业|He is looking for a new job.|他正在找一份新工作。
company|n. 公司|工作与职业|This company makes furniture.|这家公司制造家具。
office|n. 办公室|工作与职业|Our office is on the second floor.|我们的办公室在二楼。
colleague|n. 同事|工作与职业|My colleague helped me today.|我的同事今天帮助了我。
manager|n. 经理|工作与职业|The manager leads a small team.|这位经理带领一个小团队。
salary|n. 薪水|工作与职业|The job offers a good salary.|这份工作薪水不错。
experience|n. 经验；经历|工作与职业|She has teaching experience.|她有教学经验。
interview|n. 面试；访谈|工作与职业|My job interview is tomorrow.|我的求职面试在明天。
opportunity|n. 机会|工作与职业|This is an opportunity to learn.|这是一个学习的机会。
responsibility|n. 责任|工作与职业|Safety is everyone's responsibility.|安全是每个人的责任。
task|n. 任务|工作与职业|I finish one task before lunch.|我午餐前完成一项任务。
meeting|n. 会议|工作与职业|The meeting starts at ten.|会议十点开始。
deadline|n. 截止日期|工作与职业|The deadline is next Friday.|截止日期是下周五。
team|n. 团队|工作与职业|We work well as a team.|我们团队合作得很好。
support|v. 支持|工作与职业|My family supports my decision.|我的家人支持我的决定。
communicate|v. 沟通|工作与职业|We communicate by email.|我们通过电子邮件沟通。
efficient|adj. 高效的|工作与职业|This is an efficient way to work.|这是一种高效的工作方式。
flexible|adj. 灵活的|工作与职业|I have flexible working hours.|我的工作时间很灵活。
technology|n. 技术|科技与媒体|Technology changes how we work.|技术改变我们的工作方式。
computer|n. 计算机|科技与媒体|I use a computer for work.|我用计算机工作。
internet|n. 互联网|科技与媒体|The internet connects people.|互联网连接人们。
digital|adj. 数字的|科技与媒体|I keep digital copies of my notes.|我保存笔记的数字副本。
information|n. 信息|科技与媒体|The website has useful information.|这个网站有有用的信息。
device|n. 设备|科技与媒体|This device is easy to use.|这台设备很容易使用。
screen|n. 屏幕|科技与媒体|The screen is too bright.|屏幕太亮了。
online|adv. 在网上|科技与媒体|I study online twice a week.|我每周在线学习两次。
access|n. 使用机会；访问权|科技与媒体|Students have access to the library.|学生可以使用图书馆。
download|v. 下载|科技与媒体|You can download the file.|你可以下载这个文件。
save|v. 保存；节省|科技与媒体|Remember to save your work.|记得保存你的工作。
share|v. 分享|科技与媒体|We share useful ideas.|我们分享有用的想法。
privacy|n. 隐私|科技与媒体|We should respect people's privacy.|我们应该尊重人们的隐私。
security|n. 安全；保护措施|科技与媒体|The company improved data security.|这家公司改善了数据安全。
media|n. 媒体|科技与媒体|Social media can spread news quickly.|社交媒体可以快速传播新闻。
advertisement|n. 广告|科技与媒体|I saw an advertisement for a course.|我看到了一则课程广告。
reliable|adj. 可靠的|科技与媒体|We need reliable information.|我们需要可靠的信息。
influence|v. 影响|科技与媒体|Friends can influence our choices.|朋友可以影响我们的选择。
replace|v. 替代；更换|科技与媒体|I need to replace my old phone.|我需要更换我的旧手机。
connect|v. 连接|科技与媒体|The bridge connects two towns.|这座桥连接两个城镇。
travel|v. 旅行|旅行与文化|I like to travel by train.|我喜欢坐火车旅行。
journey|n. 旅程|旅行与文化|The journey takes two hours.|这段旅程需要两个小时。
trip|n. 短途旅行|旅行与文化|We planned a trip to the coast.|我们计划去海边旅行。
tourist|n. 游客|旅行与文化|Many tourists visit the museum.|许多游客参观这座博物馆。
tourism|n. 旅游业|旅行与文化|Tourism creates local jobs.|旅游业创造当地就业岗位。
destination|n. 目的地|旅行与文化|Paris is a popular destination.|巴黎是一个受欢迎的目的地。
accommodation|n. 住宿|旅行与文化|We booked accommodation near the station.|我们预订了车站附近的住宿。
passport|n. 护照|旅行与文化|Keep your passport safe.|保管好你的护照。
ticket|n. 票|旅行与文化|I bought a train ticket.|我买了一张火车票。
luggage|n. 行李|旅行与文化|My luggage is quite heavy.|我的行李很重。
arrive|v. 到达|旅行与文化|We arrive at noon.|我们中午到达。
leave|v. 离开|旅行与文化|The train leaves at eight.|火车八点出发。
abroad|adv. 在国外；到国外|旅行与文化|She wants to study abroad.|她想出国留学。
culture|n. 文化|旅行与文化|Food is part of our culture.|食物是我们文化的一部分。
tradition|n. 传统|旅行与文化|This festival is an old tradition.|这个节日是一个古老的传统。
language|n. 语言|旅行与文化|Learning a language takes time.|学习一门语言需要时间。
custom|n. 风俗|旅行与文化|Taking off your shoes is a local custom.|脱鞋是当地的一个风俗。
museum|n. 博物馆|旅行与文化|The museum is free to enter.|这座博物馆免费开放。
explore|v. 探索|旅行与文化|We explored the old town.|我们探索了这座古镇。
discover|v. 发现|旅行与文化|I discovered a quiet cafe.|我发现了一家安静的咖啡馆。
society|n. 社会|社会与观点|Education benefits society.|教育使社会受益。
government|n. 政府|社会与观点|The government built a new school.|政府建了一所新学校。
policy|n. 政策|社会与观点|The new policy supports families.|这项新政策支持家庭。
law|n. 法律|社会与观点|Everyone must follow the law.|每个人都必须遵守法律。
economy|n. 经济|社会与观点|Tourism supports the local economy.|旅游业支持当地经济。
cost|n. 费用；成本|社会与观点|The cost of living is rising.|生活成本正在上升。
value|n. 价值|社会与观点|This course offers good value.|这门课程物有所值。
quality|n. 质量|社会与观点|The quality of the food is good.|这些食物的质量很好。
equal|adj. 平等的|社会与观点|Everyone deserves an equal chance.|每个人都应享有平等的机会。
different|adj. 不同的|社会与观点|We have different opinions.|我们有不同的观点。
similar|adj. 相似的|社会与观点|Our ideas are similar.|我们的想法很相似。
important|adj. 重要的|社会与观点|Education is important to me.|教育对我很重要。
necessary|adj. 必要的|社会与观点|Regular practice is necessary.|经常练习是必要的。
possible|adj. 可能的|社会与观点|It is possible to improve.|提高是可能的。
reason|n. 原因|社会与观点|What is the reason for the delay?|延误的原因是什么？
opinion|n. 观点|社会与观点|In my opinion, parks are important.|在我看来，公园很重要。
agree|v. 同意|社会与观点|I agree with your idea.|我同意你的想法。
disagree|v. 不同意|社会与观点|I disagree with this statement.|我不同意这个说法。
advantage|n. 优点|社会与观点|One advantage is the low cost.|一个优点是成本低。
disadvantage|n. 缺点|社会与观点|The main disadvantage is the noise.|主要缺点是噪声。
research|n. 研究|学术入门|The research focuses on sleep.|这项研究聚焦睡眠。
evidence|n. 证据|学术入门|We need more evidence.|我们需要更多证据。
data|n. 数据|学术入门|The team collected data.|这个团队收集了数据。
survey|n. 调查|学术入门|We completed a short survey.|我们完成了一份简短的调查。
method|n. 方法|学术入门|This method is easy to follow.|这个方法很容易遵循。
compare|v. 比较|学术入门|Compare the two pictures.|比较这两张图片。
analyse|v. 分析|学术入门|Students analyse the results.|学生分析结果。
describe|v. 描述|学术入门|Describe your hometown.|描述你的家乡。
identify|v. 识别；找出|学术入门|We need to identify the problem.|我们需要找出问题。
suggest|v. 建议|学术入门|I suggest taking a short break.|我建议休息一小会儿。
include|v. 包括|学术入门|The price includes breakfast.|这个价格包括早餐。
require|v. 需要；要求|学术入门|Some jobs require a degree.|有些工作要求有学位。
provide|v. 提供|学术入门|The school provides free meals.|学校提供免费餐食。
consider|v. 考虑|学术入门|We should consider other options.|我们应该考虑其他选项。
effect|n. 影响；效果|学术入门|Sleep has an effect on memory.|睡眠对记忆有影响。
cause|n. 原因|学术入门|The cause of the problem is clear.|问题的原因很明确。
factor|n. 因素|学术入门|Cost is an important factor.|成本是一个重要因素。
example|n. 例子|学术入门|Can you give an example?|你能举个例子吗？
conclusion|n. 结论|学术入门|The report has a clear conclusion.|这份报告有一个明确的结论。
however|adv. 然而|学术入门|It is expensive. However, it is useful.|它很贵。然而，它很有用。
number|n. 数量；数字|数据与趋势|The number of students increased.|学生人数增加了。
amount|n. 数量（常用于不可数名词）|数据与趋势|The amount of waste decreased.|废物的数量减少了。
percentage|n. 百分比|数据与趋势|The percentage rose to forty.|百分比上升到了百分之四十。
average|adj. 平均的|数据与趋势|The average age is twenty.|平均年龄是二十岁。
total|adj. 总计的|数据与趋势|The total cost was fifty pounds.|总费用是五十英镑。
rate|n. 比率；速率|数据与趋势|The rate of growth slowed.|增长速度放缓了。
trend|n. 趋势|数据与趋势|The chart shows an upward trend.|图表显示上升趋势。
rise|v. 上升|数据与趋势|Prices rise in summer.|价格在夏季上涨。
fall|v. 下降|数据与趋势|Temperatures fall at night.|气温在夜间下降。
remain|v. 保持；仍然是|数据与趋势|The price remained stable.|价格保持稳定。
stable|adj. 稳定的|数据与趋势|Sales were stable last month.|上个月销售额稳定。
gradual|adj. 逐渐的|数据与趋势|There was a gradual increase.|出现了逐渐的增长。
significant|adj. 显著的；重要的|数据与趋势|There was a significant change.|出现了显著的变化。
slight|adj. 轻微的|数据与趋势|There was a slight decrease.|出现了轻微的下降。
rapid|adj. 迅速的|数据与趋势|The city experienced rapid growth.|这座城市经历了快速增长。
peak|n. 最高点|数据与趋势|Sales reached a peak in June.|销售额在六月达到最高点。
decline|n. 下降|数据与趋势|The chart shows a decline in sales.|图表显示销售额下降。
period|n. 时期|数据与趋势|The study covers a ten-year period.|这项研究涵盖十年时间。
proportion|n. 比例|数据与趋势|A large proportion of students walk to school.|很大一部分学生步行上学。
overall|adv. 总体上|数据与趋势|Overall, the results were positive.|总体上，结果是积极的。
`;
const baseRows=vocabulary.trim().split('\n').map(line=>line.split('|'));
const baseWords=new Set(baseRows.map(row=>row[0]));
export const WORDS = [...baseRows,...EXTRA_WORD_ROWS.filter(row=>!baseWords.has(row[0]))].map(([word,meaning,topic,example,translation],i)=>({id:`w${String(i+1).padStart(3,'0')}`,word,meaning,topic,example,translation}));
const grammarRows = [
 ['一般现在时 · 否定','She ___ coffee every morning.（她每天早上不喝咖啡。）',["doesn't drink","don't drink","doesn't drinks"],0,'主语 she 是第三人称单数，否定句用 does not / doesn’t + 动词原形 drink。','她每天早上不喝咖啡。'],
 ['一般过去时 · 否定','I ___ to school yesterday.', ["didn't went","didn't go","don't go"],1,'yesterday 表示过去。didn’t 后面用动词原形 go，不能再用 went。','我昨天没去上学。'],
 ['be 动词 · 否定','They ___ tired today.', ["isn't","don't","aren't"],2,'they 对应 are。be 动词直接加 not：are not = aren’t。','他们今天不累。'],
 ['现在进行时','Look! She ___ a book.', ['reads','is reading','read'],1,'Look! 提示眼前正在发生的动作，用 is + 动词-ing。','看！她正在读书。'],
 ['一般现在时','My brother ___ English every day.', ['study','studies','studying'],1,'every day 表示习惯。主语 my brother 是第三人称单数，study 变 studies。','我哥哥每天学习英语。'],
 ['一般过去时','We ___ a film last night.', ['watch','are watching','watched'],2,'last night 表示过去，规则动词 watch 加 -ed 变成 watched。','我们昨晚看了一部电影。'],
 ['一般现在时 · 疑问','___ he work here?', ['Do','Does','Is'],1,'一般现在时的实义动词疑问句：Does + he + 动词原形？','他在这里工作吗？'],
 ['情态动词 · 否定','You ___ use your phone during the exam.（禁止使用）', ["mustn't","don't have to","aren't"],0,'mustn’t 表示禁止；don’t have to 表示没有必要，意思不同。','考试期间你禁止使用手机。'],
 ['一般过去时 · be','She ___ at home yesterday.', ['is','was','were'],1,'yesterday 表示过去，she 对应 be 动词过去式 was。','她昨天在家。'],
 ['名词 · 不可数','I need some ___ about the course.', ['informations','information','an information'],1,'information 是不可数名词，不能加 -s，也不能直接加 an。','我需要一些关于这门课的信息。'],
 ['一般现在时 · 否定','We ___ meat.（我们不吃肉。）', ["doesn't eat","don't eat","aren't eat"],1,'主语 we 使用 don’t + 动词原形。eat 是实义动词，不能用 aren’t eat。','我们不吃肉。'],
 ['过去时 · 疑问','Did you ___ the homework?', ['finished','finish','finishes'],1,'Did 已经表示过去，后面的实义动词用原形 finish。','你做完作业了吗？'],
 ['现在完成时','I have ___ this book before.', ['read','reading','reads'],0,'现在完成时用 have + 过去分词。read 的过去分词拼写仍是 read。','我以前读过这本书。'],
 ['冠词','She is ___ university student.', ['an','a','the'],1,'university 开头是辅音音素 /j/，所以用 a。冠词看发音，不只看字母。','她是一名大学生。'],
 ['时间介词','The lesson starts ___ Monday.', ['in','at','on'],2,'具体某一天前用 on：on Monday。月份用 in，具体时刻用 at。','这节课星期一开始。'],
 ['时间介词','I get up ___ seven o’clock.', ['at','on','in'],0,'具体时刻前用 at。','我七点起床。'],
 ['比较级','This book is ___ than that one.', ['easy','easier','easiest'],1,'than 提示比较级。easy 变 y 为 i 再加 -er：easier。','这本书比那本更容易。'],
 ['数量表达','There are ___ people in the park.', ['much','a little','many'],2,'people 是复数可数名词，用 many。much 和 a little 修饰不可数名词。','公园里有许多人。'],
 ['there be','There ___ a library near my home.', ['are','is','have'],1,'单数名词 a library 对应 there is。','我家附近有一座图书馆。'],
 ['计划与将来','I am going to ___ English tonight.', ['study','studied','studying'],0,'be going to 表示计划，to 后面接动词原形。','我今晚打算学英语。'],
 ['主谓一致','The students ___ in the classroom.', ['is','am','are'],2,'students 是复数，be 动词用 are。','学生们在教室里。'],
 ['现在进行时 · 否定','He ___ sleeping now.', ["doesn't","isn't","don't"],1,'现在进行时用 be + -ing，否定在 be 后加 not：isn’t sleeping。','他现在没在睡觉。'],
 ['一般过去时 · 否定','They ___ at the meeting yesterday.', ["wasn't","aren't","weren't"],2,'过去的状态用 was/were。they 对应 were，否定为 weren’t。','他们昨天不在会上。'],
 ['动词搭配','I enjoy ___ books.', ['read','reading','to read'],1,'enjoy 后接动名词 -ing：enjoy reading。','我喜欢读书。'],
 ['动词不定式','She wants ___ abroad.', ['study','studying','to study'],2,'want to do something：想要做某事。','她想出国留学。'],
 ['情态动词','He can ___ English.', ['speak','speaks','speaking'],0,'can 后接动词原形，不随主语加 -s。','他会说英语。'],
 ['频率副词','She ___ arrives on time.（她总是准时到。）', ['never','always','not'],1,'always 表示总是，一般放在实义动词前。never 表示从不。','她总是准时到。'],
 ['连词','I stayed at home ___ it was raining.', ['because','but','although'],0,'because 引出原因。因为下雨，所以待在家里。','我待在家里，因为当时在下雨。'],
 ['连词','The task was hard, ___ I finished it.', ['because','but','so'],1,'前后是转折关系：任务困难，但是我完成了。','任务很难，但我完成了。'],
 ['条件句','If it rains tomorrow, I ___ at home.', ['stayed','will stay','stay yesterday'],1,'真实将来条件句：if 从句用一般现在时，主句用 will + 动词原形。','如果明天下雨，我会待在家里。'],
 ['代词','My sister is kind. I often talk to ___.', ['she','her','hers'],1,'介词 to 后使用宾格代词 her。','我姐姐很友善。我经常和她聊天。'],
 ['物主代词','This is ___ book.（这是我的书。）', ['me','mine','my'],2,'名词 book 前用形容词性物主代词 my；mine 可单独代替 my book。','这是我的书。'],
 ['名词复数','There are three ___ in the room.', ['child','children','childs'],1,'child 的不规则复数是 children。','房间里有三个孩子。'],
 ['数量表达','I don’t have ___ money.', ['many','much','a few'],1,'money 是不可数名词，否定句中可用 much。','我没有很多钱。'],
 ['完成时 · 时间','She has lived here ___ 2020.', ['for','since','during'],1,'since 后接开始的时间点；for 后接持续的时间段。','她从 2020 年起就住在这里。'],
 ['完成时 · 时间','I have studied English ___ two months.', ['since','for','at'],1,'two months 是一段时间，用 for。','我已经学了两个月英语。'],
 ['最高级','This is the ___ room in the house.', ['large','larger','largest'],2,'比较整个房子里的房间，用最高级 the largest。','这是房子里最大的房间。'],
 ['副词','He speaks English ___.', ['slow','slowly','slower than'],1,'修饰动词 speaks 使用副词 slowly。','他英语说得很慢。'],
 ['被动语态','English ___ in many countries.', ['speaks','is spoken','is speaking'],1,'英语是“被说”的语言，用 be + 过去分词：is spoken。','许多国家使用英语。'],
 ['否定句改写','选择 “He likes tea.” 的正确否定句。', ["He doesn't likes tea.","He isn't like tea.","He doesn't like tea."],2,'第三人称单数一般现在时否定：doesn’t + 动词原形 like。','他不喜欢茶。'],
 ['否定句改写','选择 “I went out.” 的正确否定句。', ["I didn't go out.","I didn't went out.","I don't went out."],0,'一般过去时否定：didn’t + 动词原形 go。','我没有出门。'],
 ['过去进行时','At eight last night, I ___ dinner.', ['am cooking','was cooking','cook'],1,'过去某个时刻正在进行的动作，用 was/were + -ing。','昨晚八点，我正在做晚饭。'],
 ['一般现在时 · 疑问','Where ___ your parents live?', ['do','does','are'],0,'your parents 是复数，实义动词 live 的疑问句用 do。','你父母住在哪里？'],
 ['时间介词','My exam is ___ November.', ['at','on','in'],2,'月份前用 in：in November。','我的考试在十一月。'],
 ['一般过去时 · 不规则','I ___ a new word yesterday.', ['learn','learnt','learning'],1,'yesterday 表示过去。learn 的过去式可用 learnt 或 learned，这里选 learnt。','我昨天学了一个新词。'],
 ['不可数名词','This ___ useful advice.', ['is','are','be'],0,'advice 是不可数名词，作主语时 be 动词用 is。','这是有用的建议。'],
 ['否定词','I have ___ been to London.（我从没去过伦敦。）', ['ever','never','always'],1,'never 表示从未，放在 have 与过去分词 been 之间。','我从没去过伦敦。'],
 ['疑问词','___ do you study English? — Every day.', ['How often','How much','How many'],0,'问频率用 How often；回答 every day 表示每天。','你多久学一次英语？——每天。'],
 ['动词搭配','Please avoid ___ the same mistake.', ['make','making','to make'],1,'avoid 后接动名词：avoid making，避免犯错。','请避免犯同样的错误。'],
 ['一般现在时 · 否定','This answer ___ correct.', ["doesn't","don't","isn't"],2,'correct 是形容词，用 be 动词连接主语：This answer isn’t correct。','这个答案不正确。']
];
export const GRAMMAR = [...grammarRows,...EXTRA_GRAMMAR_ROWS].map(([topic,prompt,options,answer,explanation,translation],i)=>({id:`g${String(i+1).padStart(3,'0')}`,topic,prompt,options,answer,explanation,translation}));
export const CONTENT_LABEL = '原创学习示例 · 非雅思真题';
