# 内容来源与开源调研

核验日期：2026-10-23。这里记录实际参考的项目与接口资料。

## 研究过的开源学习工具

| 项目 | 已核验许可证 | 值得参考的流程 | 本项目实际采用情况 |
| --- | --- | --- | --- |
| [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) | [GPL-3.0](https://github.com/RealKai42/qwerty-learner/blob/master/LICENSE) | 输入英文、核对拼写、反复练习 | 借鉴主动输入的学习流程；没有复制代码、商业词书或其词库 |
| [IELTS Mastery Hub](https://github.com/open-lingua/ielts-mastery-hub) | [MIT](https://github.com/open-lingua/ielts-mastery-hub/blob/main/LICENSE) | 分类听读练习、写作反馈、进度记录；明确其内容为 AI 生成示例 | 借鉴分类练习与结果保存方式；没有复制源码或试题 |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | [MIT](https://github.com/open-spaced-repetition/ts-fsrs/blob/main/LICENSE) | 根据记忆表现调度复习 | 已研究，尚未集成。当前仍是明示的 1/3/7/14/30/60 天规则，不冒充 FSRS 算法 |
| [Ollama](https://github.com/ollama/ollama) | [MIT](https://github.com/ollama/ollama/blob/main/LICENSE) | 本机模型 API、模型列表与聊天生成 | 通过本机 HTTP API 可选连接；不捆绑运行时或模型 |

这些是独立开源项目或库，不是已经安装到 YAN 的插件。没有未经许可批量下载来源不明的剑桥雅思题库。

## 本地材料

- `dist/data.js`：原有 240 词、50 道语法示例。
- `dist/extra-data.js`：本次编写的补充词条和30道语法题。与原库去重后净增96词，共336词。
- `dist/library-data.js`：6篇阅读、4份听力文本、50道听读题及解析、8份基础讲义、6个写作任务、8组口语话题。
- 上述释义、例句、短篇、题目和解析为本项目原创学习示例，AI 辅助编写。不是官方真题；未经过专业命题测评，欢迎提交具体勘误。
- 所有虚构图表数据、研究故事、地点和人物仅供语言练习，不作为事实或科研证据引用。
- 难度标签是编写时的粗略教学定位，不是经过校准的 CEFR 测评结果。
- 本项目原创内容按根目录 MIT 许可证提供；不包含商业教材音频。听力按钮使用设备已有本地语音合成，明确标注非真人录音。

## 官方与精选材料（公开仓库仅链接元数据）

- [IELTS Academic 官方样题](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)
- [British Council 免费 IELTS 练习](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests)

v1.2 的完整条目和逐项官方链接见 [RESOURCE-CATALOG.md](RESOURCE-CATALOG.md)：59 条目录，包括 25 条雅思官方、12 条 TED、14 条情景剧与美剧、8 条基础英语入口。简介与学习建议由本项目编写；难度建议不是官方测评分级。

下载脚本提供 24 个固定官方 PDF 目标，只保存到忽略目录 `.local/materials`，供本机个人学习。公开仓库与源码 ZIP 不包含这些第三方正文；它们不受本项目 MIT 许可证覆盖。TED 视频/字幕、商业真题书和美剧正片没有复制、抓取或重新发布。媒体练习由用户主动选择自己有权使用的文件。

## AI 实现依据

- [Ollama Chat API](https://docs.ollama.com/api/chat)：`POST /api/chat`，关闭流式输出后读取 `message.content`。
- [Ollama 模型列表](https://docs.ollama.com/api/tags)：`GET /api/tags`，显示实际已安装模型；排除云模型。
- [OpenAI Chat Completions 官方接口](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)：预留兼容接口，使用 `model`、`messages`，读取 `choices[0].message.content`。
- [Qwen3 4B 的 Ollama 页面](https://ollama.com/library/qwen3:4b)：当前示例下载约2.5GB，模型许可证为 Apache-2.0。型号仅是起步示例；性能取决于设备，不保证效果或速度。

模型运行时、模型权重和第三方网站遵循各自的许可证或条款。源码 MIT 许可证不会覆盖这些第三方内容。
# v1.3 新增词汇与离线网页应用

新增 `vocabulary-foundation.js` 和 `vocabulary-topics.js` 共700个词条，释义与例句为本项目AI辅助原创，未搬运商业词书或官方题库；包含350个日常词和350个场景词。主题分类为学习组织方式，未做官方词频或分数等级认证。

PWA实现参考 [MDN安装指南](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)、[Chrome更新处理](https://developer.chrome.com/docs/workbox/handling-service-worker-updates)及 [GitHub Pages发布设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。实现为本项目独立代码，不包含上述文档的整段复制。

## v1.4 ECDICT开源扩展

新增4,964个独立词条，与原有1,036词合计6,000词。数据来自 [ECDICT固定提交](https://github.com/skywind3000/ECDICT/tree/bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b)，按仓库MIT许可证使用，保留完整 [许可证文本](third-party/ECDICT-LICENSE.txt)。原始文件摘要、筛选规则、数量及许可证也在 dist/vocabulary-source.json 和离线词库页面中提供。

按上游考试标签和词频选取小写词头，排除上游明确标注的屈折词形及原词库重复项，要求中英文释义齐全。音标和词形仅展示实际存在的数据。上游标签与词频不代表官方IELTS词表、CEFR等级或分数标准。词典条目未提供经核对的例句，页面明确将英语释义与原创例句区分；不生成填空模板冒充例句。原始65.9MB CSV仅在本机私有缓存，不随源码发布。

## 本地物品检测

TensorFlow.js 4.22.0 与 COCO-SSD 2.2.3（Google / TensorFlow，Apache-2.0）。官方源码 https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd ，原始权重 https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json 。本项目采用每张量uint8量化权重，保留整数常量，附来源、原始/派生哈希与完整许可证于 dist/vendor/world/。本地学习模板为原创内容。官方演示照片仅存忽略的qa/用于识别测试，不作为学习资源发布。
