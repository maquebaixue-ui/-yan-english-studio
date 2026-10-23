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
