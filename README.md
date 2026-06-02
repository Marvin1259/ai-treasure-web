# 水滴AI挖宝行动（无后端静态原型）

这是一个**纯静态 HTML/CSS/JS** 原型，不依赖后端服务。可直接双击 `index.html` 打开，或放到任意静态托管（Nginx/GitHub Pages/对象存储静态站点）使用。

## 正式公网访问（推荐）

考虑到部分网络环境无法稳定访问 `github.io`，且 jsDelivr 会把 `index.html` 作为 `text/plain` 返回导致浏览器显示源码，默认正式访问地址改为 GitHubRaw CDN：

- 主地址（跟随 `main` 最新内容）：`https://cdn.githubraw.com/Marvin1259/ai-treasure-web/main/index.html`
- 固定版本地址（锁定 commit）：`https://cdn.githubraw.com/Marvin1259/ai-treasure-web/cb483811a9566aece5f543f30bf256bf6d87b6fe/index.html`

如需在飞书卡片或机器人消息中放入口，优先使用主地址；需要变更冻结或回溯时使用固定版本地址。

## 已实现模块

- 首页：活动 banner、玩法说明、积分规则、每周挑战、AI 工具清单、奖励机制
- 提交页：提交类型说明 + 飞书多维表格表单跳转/尝试嵌入（未配置时显示占位引导）
- 积分页：我的积分占位、本月榜、年度榜、刷新时间、排名变化、积分明细样例
- 挖宝专区：同事发现了什么 / 抄作业区 / 踩坑联盟
- 管理员页：审核提交、核定积分、管理挑战、精选内容、榜单快照、管理后台 Base 入口
- 响应式：支持手机与桌面

## 快速开始

### 方式 1：直接打开（最简）

1. 打开 `index.html`
2. 页面可正常浏览；若浏览器限制本地 `fetch`，积分数据将自动回退到内置样例

### 方式 2：本地静态服务（推荐）

在项目目录执行：

```bash
python3 -m http.server 8080
```

然后访问 [http://localhost:8080](http://localhost:8080)。

## 需要替换的配置（管理员）

编辑 `config.js`，将所有 `REPLACE_ME_...` 链接替换为真实飞书链接：

- `submissionFormUrl`：提交表单 URL（建议飞书多维表格表单）
- `leaderboardViewUrl`：排行榜视图 URL
- `adminBaseUrl`：管理后台 Base URL
- `featuredViewUrl`：精选内容视图 URL
- `reviewViewUrl`：审核视图 URL
- `challengeViewUrl`：挑战管理视图 URL
- `snapshotViewUrl`：榜单快照视图 URL
- `scoreAuditViewUrl`：积分核定视图 URL

页面会对未配置项给出明显提示。

## 本地样例数据结构

积分与挖宝示例数据位于 `data/points.sample.json`，核心结构：

- `meta`：刷新时间、来源说明
- `me`：我的积分与排名占位
- `monthlyBoard` / `yearlyBoard`：榜单数组
- `pointDetails`：积分明细样例
- `treasure`：`discoveries` / `copyArea` / `pitfalls`

这个结构可直接对接“由多维表格导出的 JSON 快照”。

## 推荐的飞书多维表格表结构

最小可用建议：

1. **提交表（submissions）**
   - `提交ID`、`提交人`（人员字段）、`提交类型`、`标题`、`内容摘要`、`工具`、`提交时间`、`审核状态`、`管理员备注`
2. **积分流水表（score_logs）**
   - `记录ID`、`人员`（关联人员）、`日期`、`积分类型`、`积分值`、`关联提交ID`、`核定状态`
3. **榜单快照表（rank_snapshots）**
   - `快照日期`、`人员`、`月积分`、`年积分`、`月排名`、`年排名`、`排名变化`
4. **精选内容表（featured_cases）**
   - `案例ID`、`分类`（发现/抄作业/踩坑）、`标题`、`摘要`、`状态`、`展示优先级`
5. **挑战配置表（weekly_challenges）**
   - `周次`、`主题`、`说明`、`生效日期`、`失效日期`

## 权限与安全边界（务必阅读）

- 纯静态前端**不能**安全存放飞书 `app_secret`，本项目不会也不应在前端保存任何密钥。
- 纯静态模式下的真实提交，建议使用：
  - 飞书多维表格表单链接（跳转或嵌入）；
  - 依赖飞书内打开与表单人员字段记录提交身份。
- “飞书人员免注册申请”在纯前端场景下，主要依赖：
  - 飞书内访问页面/表单；
  - 多维表格 Base 权限与可见范围；
  - 表单人员字段自动识别。
- 纯前端无法安全完成飞书 OpenAPI 鉴权与可信身份校验（除非引入受保护后端）。

## 每日刷新建议（无后端）

可选方式：

1. 在多维表格中用公式列 + 自动化维护排名与变化；
2. 管理员每日导出榜单快照，覆盖 `data/points.sample.json`；
3. 用飞书自动化把快照写入固定视图，再由管理员手工同步到静态文件。

> 本原型定位为“无后端、可快速落地”的前端入口与展示层。
