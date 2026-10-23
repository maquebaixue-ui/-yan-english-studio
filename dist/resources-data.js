// Curated links and original descriptions only. Third-party works retain their own rights.
// Verified against the publishers' pages in October 2026. Suggested levels are guidance,
// not an official CEFR classification of TED talks, television shows, or IELTS samples.
export const RESOURCE_CATEGORIES = ['雅思官方', 'TED', '情景剧与美剧', '基础英语'];
const official = 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test';
const bc = 'https://learnenglish.britishcouncil.org';
function entry(id, category, title, provider, url, description, level, access, download) {
  return { id, category, title, provider, url, description, level, access, ...(download ? { download } : {}) };
}
function pdf(id, title, provider, url, description, pages, sourceUrl = url, category = '雅思官方', level = '备考') {
  return { ...entry(id, category, title, provider, sourceUrl, description, level, '免费官方 PDF · 仅个人学习', { url, file: `${id}.pdf` }), pages };
}
const listeningTypes = [
  ['one-answer','单选题 · 研究讨论','multiple-choice-one-answer',1],
  ['multiple-answers','多选题 · 图书馆介绍','multiple-choice-more-than-one-answer',1],
  ['map','地图标注 · 城镇导览','plan-map-diagram-labelling',1],
  ['notes','笔记填空 · 二手家具','note-completion',2],
  ['table','表格填空 · 学习坚持度','table-completion',1],
  ['flow-chart','流程图 · 生物学讨论','flow-chart-completion',2],
  ['sentences','句子填空 · 开放大学','sentence-completion',1],
  ['short-answer','简答题 · 服装公司介绍','short-answer',1]
];
const tedTalks = [
  ['30-days','Matt Cutts · 尝试 30 天新习惯','matt_cutts_try_something_new_for_30_days','短讲入门：听出一个目标，再用两句英语写自己的 30 天计划。','A2–B1'],
  ['speaking','Julian Treasure · 让人愿意听你说话','julian_treasure_how_to_speak_so_that_people_want_to_listen','练习重音和停顿。每次选 20 秒跟读，再用自己的话说出一条建议。','B1–B2'],
  ['procrastination','Tim Urban · 拖延者的头脑','tim_urban_inside_the_mind_of_a_master_procrastinator','学习拖延、截止日期与习惯词汇；先理解故事，再概括原因。','B2'],
  ['growth','Carol Dweck · 相信自己能够进步','carol_dweck_the_power_of_believing_that_you_can_improve','教育主题素材。找出观点与例子，练习 because 引导的解释。','B1–B2'],
  ['grit','Angela Lee Duckworth · 热情与坚持','angela_lee_duckworth_grit_the_power_of_passion_and_perseverance','练习听取核心论点，并联系自己的学习经历口述 30 秒。','B1–B2'],
  ['conversation','Celeste Headlee · 更好的交谈','celeste_headlee_10_ways_to_have_a_better_conversation','人际沟通主题。选择一条原则，尝试用简单英语举例。','B1–B2'],
  ['teacher','Rita Pierson · 每个孩子都需要支持者','rita_pierson_every_kid_needs_a_champion','教育和人物描述。留意叙述过去经历时动词的变化。','B1–B2'],
  ['languages','Lýdia Machová · 学习语言的秘诀','lydia_machova_the_secrets_of_learning_a_new_language','学习方法主题。记录适合自己的方法，而不是一次背完整篇。','B1–B2'],
  ['creativity','Ken Robinson · 学校与创造力','sir_ken_robinson_do_schools_kill_creativity','教育议论文听力拓展；语速与幽默较难，适合分段精听。','B2–C1'],
  ['time','Laura Vanderkam · 安排自己的时间','laura_vanderkam_how_to_gain_control_of_your_free_time','时间管理主题。练习听数字、时间表达和优先事项。','B1–B2'],
  ['listening','Julian Treasure · 更好地倾听','julian_treasure_5_ways_to_listen_better','区分听见与理解。做一段无字幕复述，再对照官网文字稿。','B1–B2'],
  ['movement','Derek Sivers · 如何发起一场行动','derek_sivers_how_to_start_a_movement','短篇演讲。练习 first、then、finally 描述一个过程。','B1']
];
export const RESOURCES = [
  pdf('ielts-reading-samples','Academic 阅读题型合集','IELTS Partners','https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-academic-reading-sample-tasks-2023.pdf','46 页官方样题和答案，涵盖判断、标题匹配、填空、图示等题型。不是完整历年真题集。',46,official),
  pdf('ielts-listening-samples','听力样题合集','British Council / IELTS Partners','https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-sample-tasks-2023.pdf','33 页样题、答案与部分文本。音频请从官方练习页打开；PDF 本身不含音频。',33,'https://takeielts.britishcouncil.org/en-gb/prepare/ielts-free-practice-mock-tests/academic/listening'),
  pdf('ielts-writing-samples','Academic 写作题目与考官评语','British Council / IELTS Partners','https://takeielts.britishcouncil.org/sites/default/files/%5Bdownloads%5D/ielts-academic-writing-sample-tasks-2023.pdf','26 页 Task 1 / Task 2 样题、考生作文和考官评语。先独立写，再对照评语。',26,'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/writing'),
  pdf('ielts-speaking-samples','口语三部分官方样题','IELTS Partners','https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-speaking-sample-tasks-2023.pdf','7 页 Part 1、Part 2、Part 3 提问示例，可用于录音、自述与同伴练习。',7,official),
  pdf('ielts-writing-responses','写作示例：分数与评语','IELTS Partners','https://takeielts.britishcouncil.org/sites/default/files/%5Bdownloads%5D/ielts-academic-writing-example-responses-to-parts-1-and-2-with-band-scores-and-examiner-comments.pdf','5 页官方考生回答与评语。分数只属于这些示例，不代表你的水平。',5,official),
  pdf('ielts-writing-bands','写作 Band Descriptors','IELTS Partners','https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf','官方写作评分档位描述。重点比较 5、6、7 分的语言与任务要求。',9,'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail'),
  pdf('ielts-speaking-bands','口语 Band Descriptors','IELTS Partners','https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf','官方口语评分档位描述，涵盖流利度、词汇、语法与发音。',4,'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail'),
  pdf('ielts-writing-criteria','写作四项评价维度','IELTS Partners','https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf','4 页写作评价维度说明，适合检查自己的练习反馈是否具体。',4,'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail'),
  pdf('ielts-speaking-criteria','口语四项评价维度','IELTS Partners','https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf','4 页口语评价维度说明。文字回答无法验证真实发音与现场流利度。',4,'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail'),
  pdf('ielts-test-guide','考生备考指南','Cambridge English','https://www.cambridgeenglish.org/Images/23436-ielts-guide-for-test-takers.pdf','官方考生指南。考试形式和政策可能更新，以当前报名地官方信息为准。',12,'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/'),
  pdf('ielts-reading-answer-sheet','阅读答题纸','British Council / IELTS Partners','https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-reading-answer-sheet-sample.pdf','练习答案拼写、大小写和填涂。机考请同时使用官方在线熟悉练习。',1,'https://takeielts.britishcouncil.org/en-gb/prepare/ielts-free-practice-mock-tests/academic/reading'),
  pdf('ielts-study-planner','British Council 学习计划册','British Council','https://www.britishcouncil.vn/sites/default/files/british_council_ielts_study_planner.pdf','6 页备考安排与自查框架；旧版内链可能变动，可搭配本项目每日任务。',6),
  ...listeningTypes.map(([id,title,slug,pages]) => pdf(`ielts-listening-${id}`,`听力文本：${title}`,'IELTS Partners',`https://${slug === 'flow-chart-completion' ? 'ielts.org/cdn/computer-delivered-sample-tests-listening' : 'takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D'}/ielts-listening-computer-delivered-${slug}-transcript.pdf`,'先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。',pages,official)),
  entry('ielts-online','雅思官方','IELTS Academic 官方在线练习','IELTS Partners',official,'按题型练习听力、阅读和写作，并体验机考。官方样题不等于历年真题全集。','备考','免费官方网页'),
  entry('ielts-bc-mock','雅思官方','British Council 四科练习入口','British Council','https://takeielts.britishcouncil.org/en-gb/prepare/ielts-free-practice-mock-tests','官方听说读写练习与机考熟悉入口；部分额外备考产品需注册或报名。','备考','免费样题 · 额外内容条件以官网为准'),
  entry('ielts-idp','雅思官方','IDP IELTS Prepare 资源中心','IDP IELTS','https://ielts.idp.com/prepare','按技能筛选官方文章、视频和练习。地区站内容及登录要求可能不同。','备考','官方入口 · 部分内容需注册'),
  entry('ielts-idp-reading','雅思官方','IDP Academic Reading 学生册','IDP IELTS','https://info.ielts.idp.com/rs/561-EIU-022/images/IELTSFocus-AcademicReading-StudentBook.pdf','48 页阅读技能与练习官方文档，包含答案。原文保留版权，此处提供官方原链接。','备考','官方 PDF 链接 · 原版权保留'),
  entry('ielts-cambridge','雅思官方','剑桥真题与官方备考书目录','Cambridge English','https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/','查看 Cambridge IELTS、Official Cambridge Guide、Mindset 等官方资料。商业书籍只提供正版入口，不打包书稿。','备考','有免费样题 · 商业书籍通常付费'),
  ...tedTalks.map(([id,title,slug,description,level])=>entry(`ted-${id}`,'TED',title,'TED',`https://www.ted.com/talks/${slug}`,description,level,'官网观看 · 不缓存视频或字幕')),
  entry('drama-starting','情景剧与美剧','Starting Out · 初级连续情景剧','British Council',`${bc}/free-resources/general/video-series/starting-out`,'从第一集开始跟随人物对话，按顺序练习日常词汇、基础语法和理解题。','A1–A2','免费官网视频、文本和练习'),
  pdf('drama-starting-01','Starting Out 01 · 初次相识','British Council',`${bc}/sites/podcasts/files/LearnEnglish-Starting-Out-episode-01-support-pack_1.pdf`,'练习 am/is/are 和否定句。打开官网看本集视频，本地配套练习包含答案。',3,`${bc}/free-resources/general/video-series/starting-out/episode-01-they-meet`,'情景剧与美剧','A1–A2'),
  pdf('drama-starting-02','Starting Out 02 · 聚会聊天','British Council',`${bc}/sites/podcasts/files/LearnEnglish-Starting-Out-episode-02-support-pack.pdf`,'练习询问姓名、职业、电话号码，以及 be 动词问句。配套练习包含答案。',3,`${bc}/free-resources/general/video-series/starting-out/episode-02-toms-party`,'情景剧与美剧','A1–A2'),
  pdf('drama-starting-03','Starting Out 03 · 兴趣与喜好','British Council',`${bc}/sites/podcasts/files/LearnEnglish-Starting-Out-episode-03-support-pack.pdf`,'练习 like/don’t like、表达喜好和提出邀请。配套练习包含答案。',3,`${bc}/free-resources/general/video-series/starting-out/episode-03-what-do-you-doing`,'情景剧与美剧','A1–A2'),
  entry('drama-wots','情景剧与美剧','Word on the Street · 英国生活','British Council',`${bc}/free-resources/general/video-series/word-street`,'情景视频配讲解和练习。适合积累出行、居住、购物等话题表达。','B1–B2','免费官网视频、文本和练习'),
  entry('drama-voa','情景剧与美剧','VOA Let’s Learn English · 52 课','VOA Learning English','https://learningenglish.voanews.com/p/5644.html','面向初学者的美式英语生活系列，含视频、口语、词汇及写作学习内容。','A1–A2','免费官网课程'),
  entry('drama-voa-01','情景剧与美剧','VOA 01 · Welcome!','VOA Learning English','https://learningenglish.voanews.com/a/lets-learn-english-lesson-one/3111026.html','从打招呼和自我介绍开始。先听一句再跟读一句，最后离开字幕介绍自己。','A1','免费官网课程'),
  entry('drama-voa-02','情景剧与美剧','VOA 02 · Hello, I’m Anna!','VOA Learning English','https://learningenglish.voanews.com/a/lets-learn-english-lesson-2-hello/3113733.html','继续练习介绍人物与初次见面的常用表达。','A1','免费官网课程'),
  entry('drama-voa-03','情景剧与美剧','VOA 03 · I’m Here!','VOA Learning English','https://learningenglish.voanews.com/a/lets-learn-english-lesson-3-i-am-here/3126527.html','练习人物所在位置和简单问答；留意这里、那里等词语。','A1','免费官网课程'),
  entry('drama-voa-04','情景剧与美剧','VOA 04 · What Is It?','VOA Learning English','https://learningenglish.voanews.com/a/lets-learn-english-lesson-4/3168920.html','用简单问句认识日常物品，练习词汇拼写和完整句子回答。','A1','免费官网课程'),
  pdf('bbc-soap-operas','BBC 双语阅读 · 肥皂剧','BBC Learning English','https://downloads.bbc.co.uk/china/assets/pdf/bbc_soap_operas_worksheet.pdf','7 页电视文化主题学习单，含中英词汇和练习。旧文用于语言学习，不代表当前节目情况。',7,undefined,'情景剧与美剧','B1'),
  entry('tv-friends','情景剧与美剧','Friends 老友记 · 官方作品入口','Warner Bros.','https://www.warnerbros.com/tv/friends','用于查找正版发行信息。建议从已获合法访问权的短片段练习日常交谈，不从本站下载剧集。','B1–B2','版权方作品页 · 观看依地区与订阅'),
  entry('tv-bigbang','情景剧与美剧','The Big Bang Theory · 官方作品入口','Warner Bros.','https://www.warnerbros.com/tv/big-bang-theory','语速、笑点及专业词较难，适合进阶后选取短片段；查找当地正版渠道。','B2–C1','版权方作品页 · 观看依地区与订阅'),
  entry('tv-modern-family','情景剧与美剧','Modern Family 摩登家庭 · 官方入口','ABC','https://abc.com/show/d72316e9-c889-494b-bb3c-a48266fb326d','家庭生活主题，适合练描述人物与讲故事。官网列出正版观看渠道，可能有地区与付费限制。','B1–B2','官网指向正版平台 · 可能需订阅'),
  entry('basic-grammar','基础英语','A1–A2 基础语法课程','British Council',`${bc}/free-resources/grammar/a1-a2`,'优先学 be 动词、一般现在时、疑问句，再学过去时。每页都有解释与练习。','A1–A2','免费官网课程'),
  entry('basic-listening-a1','基础英语','A1 慢速日常听力','British Council',`${bc}/free-resources/listening/a1`,'从短对话辨认熟悉词语和基本信息，每篇配准备活动和练习。','A1','免费官网音频和练习'),
  entry('basic-listening-a2','基础英语','A2 日常听力进阶','British Council',`${bc}/free-resources/listening/a2`,'从 A1 升级，练习理解日常情境中的主要信息。','A2','免费官网音频和练习'),
  entry('basic-reading','基础英语','A1 阅读入门','British Council',`${bc}/free-resources/reading/a1`,'短消息、表格、海报和时间表，适合练定位信息与基础理解。','A1','免费官网课程'),
  entry('basic-speaking','基础英语','A1 口语入门','British Council',`${bc}/free-resources/speaking/a1`,'看短视频、模仿表达，再把句子换成自己的信息。','A1','免费官网视频和练习'),
  entry('basic-vocabulary','基础英语','A1–A2 主题词汇与拼写','British Council',`${bc}/free-resources/vocabulary/a1-a2`,'按生活主题练习词义、发音和拼写，可与每天 20 词任务搭配。','A1–A2','免费官网课程'),
  entry('basic-writing','基础英语','A1 短句与邮件写作','British Council',`${bc}/free-resources/writing/a1`,'从短信、表格和简单邮件开始中译英输出，逐步写出完整段落。','A1','免费官网课程'),
  entry('basic-britain','基础英语','Britain is GREAT · 文化与学术话题','British Council',`${bc}/free-resources/general/video-series/britain-great`,'英国生活、艺术、历史与科技视频，适合较高水平的听力和话题拓展。','B2–C1','免费官网视频、文本和练习')
];
