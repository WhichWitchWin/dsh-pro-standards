# dsh-pro-standards · 专业规范守则

**中文** | [English](README.en.md)

一个给 AI 编码助手用的技能（Skill）：让它动手之前先按专业从业者的方式想一遍——**正规做法是什么、当前场景该跟哪一边、我和它差在哪**——再决定怎么做。

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

把 `SKILL.md` 和 `references/` 一起放进运行时的技能目录：

| 运行时 | 技能目录 |
|---|---|
| DSH（DeepSeek Harness） | `~/.dsh/skills/`（跨运行时别名 `~/.agents/skills/`） |

```bash
git clone https://github.com/你的用户名/dsh-pro-standards.git
mkdir -p ~/.dsh/skills/dsh-pro-standards
cp -r dsh-pro-standards/SKILL.md dsh-pro-standards/references ~/.dsh/skills/dsh-pro-standards/
```

```powershell
git clone https://github.com/你的用户名/dsh-pro-standards.git
New-Item -ItemType Directory -Force "$HOME\.dsh\skills\dsh-pro-standards" | Out-Null
Copy-Item -Recurse .\dsh-pro-standards\SKILL.md, .\dsh-pro-standards\references "$HOME\.dsh\skills\dsh-pro-standards"
```

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

## 目录结构

```
dsh-pro-standards/
├── SKILL.md                 # 主文件：总原则 + 三步判断 + 提醒模板
├── references/
│   └── standards.md         # 按需细则：判断细则、示例、反例
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
