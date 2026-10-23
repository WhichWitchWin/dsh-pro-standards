# dsh-pro-standards · 专业规范守则

**中文** | [English](README.en.md)

一个 DSH 插件包（bundle），内含同名技能：让 AI 编码助手动手之前先按专业从业者的方式想一遍——**正规做法是什么、当前场景该跟哪一边、我和它差在哪**——再决定怎么做。

## 它解决什么问题

AI 助手最容易出的问题，往往不是「不会写」，而是「不看场合就写」：

- 项目已有 `pnpm-lock.yaml`，它顺手 `npm install`，锁文件乱了；
- 一次性脚本的依赖被写进正式 manifest，越堆越重；
- 参数凭记忆编，跑起来才发现接口对不上；
- 目录里十几个同类型的散文件，没人知道哪个是入口；
- 做完不说改了啥，也不留回滚点。

`dsh-pro-standards` 做的事，是在这类动作**之前**插一段判断，而不是事后补救。

## 核心方法：三步判断

任何会给项目留下痕迹的操作（装依赖、调接口、写代码、组织文件、提交发布、写文档……）之前，走三步：

| 步骤 | 问什么 | 落到哪 |
|---|---|---|
| 1 找标准 | 这件事的「正规做法」是什么？ | 官方文档 / 项目现有约定（AGENTS.md、README、lockfile、代码风格）/ 行业惯例 |
| 2 看场景 | 该跟官方还是跟行业？ | 临时随用、行业普遍 → 行业惯例；长期复用、团队协作、安全相关、官方强制 → 官方规范 |
| 3 查差距 | 我的做法和标准差在哪？ | 有差距就按模板提醒；没差距就安静做事 |

三条总原则：

1. **情境化取舍**，不做规则复读机；
2. **说出理由**，每个取舍附一句为什么；
3. **提醒式，不硬拦**——讲清后果和正规做法，你坚持原样也放行，只留一句风险提示。

拿不准的时候，它应该停下来问你，而不是替你猜。

## 怎么装

**方式一：作为 DSH 插件包安装（推荐）**

`package.json` 里声明了 `dsh.bundle.patch`，安装后自动挂载 `index.js`，把自带的 `skills/` 注册进 dsh 的技能目录，不需要手动复制：

```bash
dsh plugin --profile <你的 profile 名> add dsh-pro-standards
```

也可以在 DSH 的插件管理界面里安装。装好后技能列表里会出现 `dsh-pro-standards`，插件详情里能看到标题、描述和图标。

**方式二：只复制技能（不装插件）**

效果一样能用，只是没有插件清单和图标。**与方式一二者择一**——两种都装会出现同名两份技能。

```bash
git clone https://github.com/WhichWitchWin/dsh-pro-standards.git
mkdir -p ~/.dsh/skills/dsh-pro-standards
cp -r dsh-pro-standards/skills/dsh-pro-standards/. ~/.dsh/skills/dsh-pro-standards/
```

```powershell
git clone https://github.com/WhichWitchWin/dsh-pro-standards.git
New-Item -ItemType Directory -Force "$HOME\.dsh\skills\dsh-pro-standards" | Out-Null
Copy-Item -Recurse .\dsh-pro-standards\skills\dsh-pro-standards\* "$HOME\.dsh\skills\dsh-pro-standards"
```

| 运行时 | 技能目录 |
|---|---|
| DSH（DeepSeek Harness） | `~/.dsh/skills/`（跨运行时别名 `~/.agents/skills/`） |

建议目录名与 `SKILL.md` 里的 `name` 字段保持一致（`dsh-pro-standards`）：运行时是按 frontmatter 的 `name` 识别技能的，目录同名只是方便对照、不容易弄错。

## 怎么用

两种触发方式：

- **自动**：如果你的 agent 规则里配了「技能路由」条款（命中开发、装依赖、组织文件、写文档这类任务时先加载匹配的技能），它会随规则一起被加载；
- **手动**：直接说——「用 dsh-pro-standards 检查一下这个项目」「按规范看看这次改动」。

一次典型的对话：

> **你**：帮我装个命令行工具，直接 curl 下载二进制就行。
>
> **助手**：⚠️ 这不太合规：直接下载二进制丢进 PATH。
> 麻烦是：没有版本管理、升级要手动、来源也难验证。
> 正规做法是：用包管理器装，比如 `npm i -g <pkg>`，或者项目内 `pnpm add -D <pkg>`。
> 要按正规的来吗？（你坚持原样也 OK）

## 它怎么接进 DSH

`cordis.patch.yml` 插入一行插件，挂载 `index.js`。`index.js` 在 `apply` 时读取 `skills/` 下每个 `SKILL.md`，用 `skills` 服务**公开的** `register()` 接口注册成运行时技能，并把技能目录作为 `resourceBase`——所以 `references/` 里的相对引用能正常解析。

正文在插件挂载时读入一次，升级后重新挂载即刷新。整个插件不依赖任何 dsh 内部包，只用到 `skills` 这一项公开服务。

## 目录结构

```
dsh-pro-standards/
├── index.js                 # 插件入口：把 skills/ 注册进 dsh 技能目录
├── cordis.patch.yml         # bundle 补丁：安装后挂载 index.js
├── skills/
│   └── dsh-pro-standards/
│       ├── SKILL.md         # 技能主文件：总原则 + 三步判断 + 提醒模板
│       └── references/
│           └── standards.md # 按需细则：判断细则、示例、反例
├── locale/
│   ├── zh.json              # 插件标题与描述（中文）
│   └── en.json              # 插件标题与描述（英文）
├── icon.svg                 # 插件图标
├── package.json             # npm / dsh bundle 清单
├── README.md                # 中文说明（本文件）
├── README.en.md             # English README
├── CHANGELOG.md             # 版本变更记录
├── LICENSE                  # MIT
├── .gitignore               # 忽略 backups/ 等本地文件
└── .gitattributes           # 统一 LF 换行
```

`references/standards.md` 覆盖 7 个模块——依赖安装、接口调用、代码规范、文件结构、开源流程、文档规范、版本与发布——外加一个通用判断框架和提醒话术补充。

## 为什么不做穷举清单

清单永远追不上场景，还会过期。这个技能只给**一套判断方法**，具体细则按需展开：`SKILL.md` 保持精简，常驻上下文成本低；细则放在 `references/` 里，只在需要时读。

## 许可

[MIT](LICENSE) © dsh-pro-standards contributors
