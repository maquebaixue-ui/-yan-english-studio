# ChatGPT 与 MCP 接入

本版提供两条独立连接。不会读取既有 ChatGPT 聊天、账号记忆或其他应用数据，不会把身份登录当作已获得模型调用权限。

## 在 ChatGPT 使用学习工具

已部署的个人私有站点：[YAN English Studio](https://yan-english-studio.maquebaixue.chatgpt.site/#ai)。需要站点所有者账号登录；开源代码不代表个人分享数据公开。

1. 从原学习网页「数据与设置」导出备份，在私有站点导入。网址不同，主记录不会自动同步。
2. 在私有站点 AI 页展开「连接我的 ChatGPT · 登录与 MCP」。点击「预览要分享的学习数据」，查看本次完整内容，勾选许可再确认分享。
3. 在 ChatGPT 使用站点发布时生成的私人插件「YAN English Studio」，可以让它查词、取原创材料，或根据你分享的错题带你练习。插件连接和调用受 ChatGPT 账号/工作区权限及客户端可用性影响。
4. 每次分享覆盖自己的旧副本；后续学习变化不会自动上传。可在私有站点撤回副本。

工具：`search_vocabulary`、`search_learning_materials`、`get_learning_material`、`get_shared_study_progress`、`get_shared_mistakes`。均只读；没有命令执行、任意 URL 请求或修改学习记录的工具。词典和原创材料按来源标注，不冒充真题或官方评分。

MCP 地址：`https://yan-english-studio.maquebaixue.chatgpt.site/mcp`。优先使用 Sites 为此站点生成的私人插件；不要另外创建重复连接。部署验证已通过真实插件调用：查到 suggestion、读取 r01 原创阅读；未分享进度时明确返回没有副本。没有代替用户分享真实学习记录。

分享快照仅包含学习概况、最多 100 条未解决错题和 20 条最近练习，长文本截至 1000 字符。API 密钥、ChatGPT 令牌、聊天记录及私人音视频不进入快照。Sites 保护站点访问；R2 按站点用户 ID 隔离保存。撤回不能追溯删除 ChatGPT 已显示在旧对话中的内容。

## 在项目中使用 ChatGPT 额度

这是**电脑本机版**支持的官方开源应用授权，未验证用户真实账号是否已开放这项权限。

1. 运行「打开学习网页.cmd」，使用启动窗口显示的 `http://127.0.0.1:4173/#ai`（端口以实际启动为准）。
2. 展开连接面板，选择添加账号，点击 **Continue with ChatGPT**。在 OpenAI 官方页面自行登录、检查权限并授权；不要提供密码、Cookie 或会话令牌给本项目。
3. 完成回调后回到本机网页，读取连接状态，再读取账号可用模型。选择模型后点击「用这个 ChatGPT 模型陪我学习」。
4. 输入聊天或练习内容，勾选本次发送许可后发送。没有授权、额度或完整生成结果时只显示错误，不伪造回复。
5. 可选择已保存的账号注册重新授权，或退出当前连接。凭据保存在被 Git 忽略的 `.local/chatgpt.json`；不要分享此文件夹。

实现采用 PKCE、state、nonce、一次性回调和 JWKS 签名校验；账号模型列表来自授权账号。只使用官方 `https://api.openai.com/v1/responses`，设置 `store:false`、`stream:true`，要求收到 `response.completed` 后才接受回复。刷新串行，退出尝试撤销。HTTP API 不暴露令牌。

## 手机边界与后续条件

官方开源额度登录要求本机 `127.0.0.1` 回调；手机静态网页没有回调监听服务，不能直接使用该流程。官方托管网页登录目前为有限试点，需获得 OpenAI 接入资格。**该项目尚未取得手机托管额度登录资格。** 私有 Sites 登录只确认身份，并保护 MCP 分享，不代表可在网页内使用订阅生成。

手机现在可使用私人 MCP 插件；网页内陪伴仍可用已有 API。电脑本机授权后也可通过同一电脑的配对方式使用，电脑需要运行。不会用重放网页会话或非公开接口代替官方授权。

## 开源与部署

公开 GitHub 仓库保留独立学习前端、本机授权实现和托管 Worker 源码。个人 Sites 的短期源码凭据、访问令牌、用户数据与运行配置不进入公开仓库。

托管入口源码为 `hosting/worker.mjs`，只读工具为 `lib/learning-mcp.mjs`；`scripts/build-hosted.mjs` 从 Service Worker 白名单构建 Worker，拒绝包含私人目录。独立部署源码工作目录为工作区下的 `yan-english-studio-hosted`，公开主项目仍为 `yan-english-studio`。部署包由 Sites 源码工作流生成。托管清单需要自己的站点 `project_id`、`capabilities:["mcp"]`、`r2:"BUCKET"`、`d1:null`，不设置 static。Fork 用户应创建自己的私有站点和插件，不能使用原作者的个人权限。

官方依据（核对日期 2026-10-24）：[开源注册与登录](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)、[账号和会话](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions)、[模型与生成](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)、[网站登录试点](https://developers.openai.com/siwc/website)、[插件连接与测试](https://developers.openai.com/plugins/deploy/connect-chatgpt)。
