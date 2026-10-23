# 正版学习资源目录

本目录收录 59 个经过官方页面或官方搜索结果核验的学习入口（2026 年 10 月核验），其中 24 个条目提供官方 PDF 下载目标。它是精选资源导航，不是商业真题全集，也不代表取得了第三方内容的再发行授权。原有 YAN 原创示例题继续单独标注。

## 本地使用

在项目目录运行：

```powershell
npm run materials
```

脚本只访问固定白名单中的官方 PDF，保存到 Git 忽略目录 `.local/materials/`。支持 `node scripts/download-materials.mjs --only ielts-reading-samples` 单独下载。每份文件检查 PDF 文件头、20 MiB 上限；请求有超时且逐次检查重定向目标。已有有效 PDF 会复用。

结果与 SHA-256 记录在同一目录的 `manifest.json`；哈希用于辨认本地文件，不是出版社提供的签名。若官方服务器返回 403、网络超时或链接变更，脚本会明确报告失败，不会保存网页冒充 PDF。网页通过“刷新本机文件”确认实际可用数量；目录中的下载目标数不等于已下载数量。

本机 PDF、用户导入音视频和学习记录均不属于开源发布内容。请单独备份自己的本地资料文件夹。MIT 许可仅适用于本项目原创代码与原创材料，第三方 PDF 仍保留原版权。公开仓库只保存标题、来源链接与本项目写的学习建议，不重新打包第三方书籍。

## 使用顺序

基础较弱时，优先 A1 听力、Starting Out 01–03、A1–A2 语法；接着按 IELTS 官方样题的一个题型练习。TED 每次精听 20–40 秒并复述。美剧先挑自己合法拥有访问权的短片段，避免把整集观看误当成听力测试。TED 和剧集的等级为本项目建议，不是出版社的官方 CEFR 分级。

## 视频与书籍边界

- [IELTS 官方样题](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)及 British Council 的下载区用于获取官方学习文件；免费获取不意味着可以按 MIT 再发行。
- [TED 内容使用政策](https://www.ted.com/about/our-organization/our-policies-terms/ted-talks-usage-policy)对使用和再发行有条件。本项目只链接原站，不抓取视频、字幕或逐字稿，也不将 TED 材料改写成“开源题库”。
- Cambridge IELTS 等商业真题书仅链接官方目录。Friends、Modern Family、The Big Bang Theory 仅链接版权方或播出方，不含整集、盗版字幕、下载破解或地域限制绕过工具。
- 免费课程可以在原站继续学习。额外课程、剧集订阅和商业书籍可能收费，不是使用本项目的前提。
- IDP Prepare 的官方搜索结果可核验，但自动访问可能返回 403。Warner Bros. 页面依赖 JavaScript；它们是官方作品信息入口，不保证当前地区可直接播放。

## 雅思官方

- **[Academic 阅读题型合集](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。46 页官方样题和答案，涵盖判断、标题匹配、填空、图示等题型。不是完整历年真题集。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-academic-reading-sample-tasks-2023.pdf)；本地文件：`ielts-reading-samples.pdf`。
- **[听力样题合集](https://takeielts.britishcouncil.org/en-gb/prepare/ielts-free-practice-mock-tests/academic/listening)** — British Council / IELTS Partners；备考；免费官方 PDF · 仅个人学习。33 页样题、答案与部分文本。音频请从官方练习页打开；PDF 本身不含音频。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-sample-tasks-2023.pdf)；本地文件：`ielts-listening-samples.pdf`。
- **[Academic 写作题目与考官评语](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/writing)** — British Council / IELTS Partners；备考；免费官方 PDF · 仅个人学习。26 页 Task 1 / Task 2 样题、考生作文和考官评语。先独立写，再对照评语。 [原始 PDF](https://takeielts.britishcouncil.org/sites/default/files/%5Bdownloads%5D/ielts-academic-writing-sample-tasks-2023.pdf)；本地文件：`ielts-writing-samples.pdf`。
- **[口语三部分官方样题](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。7 页 Part 1、Part 2、Part 3 提问示例，可用于录音、自述与同伴练习。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-speaking-sample-tasks-2023.pdf)；本地文件：`ielts-speaking-samples.pdf`。
- **[写作示例：分数与评语](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。5 页官方考生回答与评语。分数只属于这些示例，不代表你的水平。 [原始 PDF](https://takeielts.britishcouncil.org/sites/default/files/%5Bdownloads%5D/ielts-academic-writing-example-responses-to-parts-1-and-2-with-band-scores-and-examiner-comments.pdf)；本地文件：`ielts-writing-responses.pdf`。
- **[写作 Band Descriptors](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。官方写作评分档位描述。重点比较 5、6、7 分的语言与任务要求。 [原始 PDF](https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf)；本地文件：`ielts-writing-bands.pdf`。
- **[口语 Band Descriptors](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。官方口语评分档位描述，涵盖流利度、词汇、语法与发音。 [原始 PDF](https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf)；本地文件：`ielts-speaking-bands.pdf`。
- **[写作四项评价维度](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。4 页写作评价维度说明，适合检查自己的练习反馈是否具体。 [原始 PDF](https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf)；本地文件：`ielts-writing-criteria.pdf`。
- **[口语四项评价维度](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。4 页口语评价维度说明。文字回答无法验证真实发音与现场流利度。 [原始 PDF](https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf)；本地文件：`ielts-speaking-criteria.pdf`。
- **[考生备考指南](https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/)** — Cambridge English；备考；免费官方 PDF · 仅个人学习。官方考生指南。考试形式和政策可能更新，以当前报名地官方信息为准。 [原始 PDF](https://www.cambridgeenglish.org/Images/23436-ielts-guide-for-test-takers.pdf)；本地文件：`ielts-test-guide.pdf`。
- **[阅读答题纸](https://takeielts.britishcouncil.org/en-gb/prepare/ielts-free-practice-mock-tests/academic/reading)** — British Council / IELTS Partners；备考；免费官方 PDF · 仅个人学习。练习答案拼写、大小写和填涂。机考请同时使用官方在线熟悉练习。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-reading-answer-sheet-sample.pdf)；本地文件：`ielts-reading-answer-sheet.pdf`。
- **[British Council 学习计划册](https://www.britishcouncil.vn/sites/default/files/british_council_ielts_study_planner.pdf)** — British Council；备考；免费官方 PDF · 仅个人学习。6 页备考安排与自查框架；旧版内链可能变动，可搭配本项目每日任务。 [原始 PDF](https://www.britishcouncil.vn/sites/default/files/british_council_ielts_study_planner.pdf)；本地文件：`ielts-study-planner.pdf`。
- **[听力文本：单选题 · 研究讨论](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-multiple-choice-one-answer-transcript.pdf)；本地文件：`ielts-listening-one-answer.pdf`。
- **[听力文本：多选题 · 图书馆介绍](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-multiple-choice-more-than-one-answer-transcript.pdf)；本地文件：`ielts-listening-multiple-answers.pdf`。
- **[听力文本：地图标注 · 城镇导览](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-plan-map-diagram-labelling-transcript.pdf)；本地文件：`ielts-listening-map.pdf`。
- **[听力文本：笔记填空 · 二手家具](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-note-completion-transcript.pdf)；本地文件：`ielts-listening-notes.pdf`。
- **[听力文本：表格填空 · 学习坚持度](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-table-completion-transcript.pdf)；本地文件：`ielts-listening-table.pdf`。
- **[听力文本：流程图 · 生物学讨论](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://ielts.org/cdn/computer-delivered-sample-tests-listening/ielts-listening-computer-delivered-flow-chart-completion-transcript.pdf)；本地文件：`ielts-listening-flow-chart.pdf`。
- **[听力文本：句子填空 · 开放大学](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-sentence-completion-transcript.pdf)；本地文件：`ielts-listening-sentences.pdf`。
- **[听力文本：简答题 · 服装公司介绍](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方 PDF · 仅个人学习。先在官方样题页做对应听力任务，再用这份官方文本定位漏听和拼写错误。只保存文本 PDF，音频在线播放。 [原始 PDF](https://takeielts.britishcouncil.org/gb/sites/site-gb/files/%5Bdownloads%5D/ielts-listening-computer-delivered-short-answer-transcript.pdf)；本地文件：`ielts-listening-short-answer.pdf`。
- **[IELTS Academic 官方在线练习](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)** — IELTS Partners；备考；免费官方网页。按题型练习听力、阅读和写作，并体验机考。官方样题不等于历年真题全集。
- **[British Council 四科练习入口](https://takeielts.britishcouncil.org/en-gb/prepare/ielts-free-practice-mock-tests)** — British Council；备考；免费样题 · 额外内容条件以官网为准。官方听说读写练习与机考熟悉入口；部分额外备考产品需注册或报名。
- **[IDP IELTS Prepare 资源中心](https://ielts.idp.com/prepare)** — IDP IELTS；备考；官方入口 · 部分内容需注册。按技能筛选官方文章、视频和练习。地区站内容及登录要求可能不同。
- **[IDP Academic Reading 学生册](https://info.ielts.idp.com/rs/561-EIU-022/images/IELTSFocus-AcademicReading-StudentBook.pdf)** — IDP IELTS；备考；官方 PDF 链接 · 原版权保留。48 页阅读技能与练习官方文档，包含答案。原文保留版权，此处提供官方原链接。
- **[剑桥真题与官方备考书目录](https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/)** — Cambridge English；备考；有免费样题 · 商业书籍通常付费。查看 Cambridge IELTS、Official Cambridge Guide、Mindset 等官方资料。商业书籍只提供正版入口，不打包书稿。

## TED

- **[Matt Cutts · 尝试 30 天新习惯](https://www.ted.com/talks/matt_cutts_try_something_new_for_30_days)** — TED；A2–B1；官网观看 · 不缓存视频或字幕。短讲入门：听出一个目标，再用两句英语写自己的 30 天计划。
- **[Julian Treasure · 让人愿意听你说话](https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。练习重音和停顿。每次选 20 秒跟读，再用自己的话说出一条建议。
- **[Tim Urban · 拖延者的头脑](https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator)** — TED；B2；官网观看 · 不缓存视频或字幕。学习拖延、截止日期与习惯词汇；先理解故事，再概括原因。
- **[Carol Dweck · 相信自己能够进步](https://www.ted.com/talks/carol_dweck_the_power_of_believing_that_you_can_improve)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。教育主题素材。找出观点与例子，练习 because 引导的解释。
- **[Angela Lee Duckworth · 热情与坚持](https://www.ted.com/talks/angela_lee_duckworth_grit_the_power_of_passion_and_perseverance)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。练习听取核心论点，并联系自己的学习经历口述 30 秒。
- **[Celeste Headlee · 更好的交谈](https://www.ted.com/talks/celeste_headlee_10_ways_to_have_a_better_conversation)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。人际沟通主题。选择一条原则，尝试用简单英语举例。
- **[Rita Pierson · 每个孩子都需要支持者](https://www.ted.com/talks/rita_pierson_every_kid_needs_a_champion)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。教育和人物描述。留意叙述过去经历时动词的变化。
- **[Lýdia Machová · 学习语言的秘诀](https://www.ted.com/talks/lydia_machova_the_secrets_of_learning_a_new_language)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。学习方法主题。记录适合自己的方法，而不是一次背完整篇。
- **[Ken Robinson · 学校与创造力](https://www.ted.com/talks/sir_ken_robinson_do_schools_kill_creativity)** — TED；B2–C1；官网观看 · 不缓存视频或字幕。教育议论文听力拓展；语速与幽默较难，适合分段精听。
- **[Laura Vanderkam · 安排自己的时间](https://www.ted.com/talks/laura_vanderkam_how_to_gain_control_of_your_free_time)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。时间管理主题。练习听数字、时间表达和优先事项。
- **[Julian Treasure · 更好地倾听](https://www.ted.com/talks/julian_treasure_5_ways_to_listen_better)** — TED；B1–B2；官网观看 · 不缓存视频或字幕。区分听见与理解。做一段无字幕复述，再对照官网文字稿。
- **[Derek Sivers · 如何发起一场行动](https://www.ted.com/talks/derek_sivers_how_to_start_a_movement)** — TED；B1；官网观看 · 不缓存视频或字幕。短篇演讲。练习 first、then、finally 描述一个过程。

## 情景剧与美剧

- **[Starting Out · 初级连续情景剧](https://learnenglish.britishcouncil.org/free-resources/general/video-series/starting-out)** — British Council；A1–A2；免费官网视频、文本和练习。从第一集开始跟随人物对话，按顺序练习日常词汇、基础语法和理解题。
- **[Starting Out 01 · 初次相识](https://learnenglish.britishcouncil.org/free-resources/general/video-series/starting-out/episode-01-they-meet)** — British Council；A1–A2；免费官方 PDF · 仅个人学习。练习 am/is/are 和否定句。打开官网看本集视频，本地配套练习包含答案。 [原始 PDF](https://learnenglish.britishcouncil.org/sites/podcasts/files/LearnEnglish-Starting-Out-episode-01-support-pack_1.pdf)；本地文件：`drama-starting-01.pdf`。
- **[Starting Out 02 · 聚会聊天](https://learnenglish.britishcouncil.org/free-resources/general/video-series/starting-out/episode-02-toms-party)** — British Council；A1–A2；免费官方 PDF · 仅个人学习。练习询问姓名、职业、电话号码，以及 be 动词问句。配套练习包含答案。 [原始 PDF](https://learnenglish.britishcouncil.org/sites/podcasts/files/LearnEnglish-Starting-Out-episode-02-support-pack.pdf)；本地文件：`drama-starting-02.pdf`。
- **[Starting Out 03 · 兴趣与喜好](https://learnenglish.britishcouncil.org/free-resources/general/video-series/starting-out/episode-03-what-do-you-doing)** — British Council；A1–A2；免费官方 PDF · 仅个人学习。练习 like/don’t like、表达喜好和提出邀请。配套练习包含答案。 [原始 PDF](https://learnenglish.britishcouncil.org/sites/podcasts/files/LearnEnglish-Starting-Out-episode-03-support-pack.pdf)；本地文件：`drama-starting-03.pdf`。
- **[Word on the Street · 英国生活](https://learnenglish.britishcouncil.org/free-resources/general/video-series/word-street)** — British Council；B1–B2；免费官网视频、文本和练习。情景视频配讲解和练习。适合积累出行、居住、购物等话题表达。
- **[VOA Let’s Learn English · 52 课](https://learningenglish.voanews.com/p/5644.html)** — VOA Learning English；A1–A2；免费官网课程。面向初学者的美式英语生活系列，含视频、口语、词汇及写作学习内容。
- **[VOA 01 · Welcome!](https://learningenglish.voanews.com/a/lets-learn-english-lesson-one/3111026.html)** — VOA Learning English；A1；免费官网课程。从打招呼和自我介绍开始。先听一句再跟读一句，最后离开字幕介绍自己。
- **[VOA 02 · Hello, I’m Anna!](https://learningenglish.voanews.com/a/lets-learn-english-lesson-2-hello/3113733.html)** — VOA Learning English；A1；免费官网课程。继续练习介绍人物与初次见面的常用表达。
- **[VOA 03 · I’m Here!](https://learningenglish.voanews.com/a/lets-learn-english-lesson-3-i-am-here/3126527.html)** — VOA Learning English；A1；免费官网课程。练习人物所在位置和简单问答；留意这里、那里等词语。
- **[VOA 04 · What Is It?](https://learningenglish.voanews.com/a/lets-learn-english-lesson-4/3168920.html)** — VOA Learning English；A1；免费官网课程。用简单问句认识日常物品，练习词汇拼写和完整句子回答。
- **[BBC 双语阅读 · 肥皂剧](https://downloads.bbc.co.uk/china/assets/pdf/bbc_soap_operas_worksheet.pdf)** — BBC Learning English；B1；免费官方 PDF · 仅个人学习。7 页电视文化主题学习单，含中英词汇和练习。旧文用于语言学习，不代表当前节目情况。 [原始 PDF](https://downloads.bbc.co.uk/china/assets/pdf/bbc_soap_operas_worksheet.pdf)；本地文件：`bbc-soap-operas.pdf`。
- **[Friends 老友记 · 官方作品入口](https://www.warnerbros.com/tv/friends)** — Warner Bros.；B1–B2；版权方作品页 · 观看依地区与订阅。用于查找正版发行信息。建议从已获合法访问权的短片段练习日常交谈，不从本站下载剧集。
- **[The Big Bang Theory · 官方作品入口](https://www.warnerbros.com/tv/big-bang-theory)** — Warner Bros.；B2–C1；版权方作品页 · 观看依地区与订阅。语速、笑点及专业词较难，适合进阶后选取短片段；查找当地正版渠道。
- **[Modern Family 摩登家庭 · 官方入口](https://abc.com/show/d72316e9-c889-494b-bb3c-a48266fb326d)** — ABC；B1–B2；官网指向正版平台 · 可能需订阅。家庭生活主题，适合练描述人物与讲故事。官网列出正版观看渠道，可能有地区与付费限制。

## 基础英语

- **[A1–A2 基础语法课程](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2)** — British Council；A1–A2；免费官网课程。优先学 be 动词、一般现在时、疑问句，再学过去时。每页都有解释与练习。
- **[A1 慢速日常听力](https://learnenglish.britishcouncil.org/free-resources/listening/a1)** — British Council；A1；免费官网音频和练习。从短对话辨认熟悉词语和基本信息，每篇配准备活动和练习。
- **[A2 日常听力进阶](https://learnenglish.britishcouncil.org/free-resources/listening/a2)** — British Council；A2；免费官网音频和练习。从 A1 升级，练习理解日常情境中的主要信息。
- **[A1 阅读入门](https://learnenglish.britishcouncil.org/free-resources/reading/a1)** — British Council；A1；免费官网课程。短消息、表格、海报和时间表，适合练定位信息与基础理解。
- **[A1 口语入门](https://learnenglish.britishcouncil.org/free-resources/speaking/a1)** — British Council；A1；免费官网视频和练习。看短视频、模仿表达，再把句子换成自己的信息。
- **[A1–A2 主题词汇与拼写](https://learnenglish.britishcouncil.org/free-resources/vocabulary/a1-a2)** — British Council；A1–A2；免费官网课程。按生活主题练习词义、发音和拼写，可与每天 20 词任务搭配。
- **[A1 短句与邮件写作](https://learnenglish.britishcouncil.org/free-resources/writing/a1)** — British Council；A1；免费官网课程。从短信、表格和简单邮件开始中译英输出，逐步写出完整段落。
- **[Britain is GREAT · 文化与学术话题](https://learnenglish.britishcouncil.org/free-resources/general/video-series/britain-great)** — British Council；B2–C1；免费官网视频、文本和练习。英国生活、艺术、历史与科技视频，适合较高水平的听力和话题拓展。
