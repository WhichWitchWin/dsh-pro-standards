# CHANGELOG

本文件只记录对使用者有意义的变化，最新版本在最上面。

## v0.1.0

### 新增

- `SKILL.md`：三步判断法（找标准 → 看场景 → 查差距）、情境化取舍原则、三段式提醒模板
- `references/standards.md`：依赖安装、接口调用、代码规范、文件结构、开源流程、文档规范、版本与发布 7 个模块的细则与正反例
- `README.md`（中文）与 `README.en.md`（English），两份互相跳转
- `LICENSE`：MIT
- `.gitignore`
- `package.json`：npm 包与 dsh bundle 清单
- `index.js`：插件入口，把 `skills/` 注册进 dsh 技能目录
- `cordis.patch.yml`：bundle 补丁，安装后自动挂载插件
- `locale/zh.json`、`locale/en.json`：插件标题与描述
- `icon.svg`：插件图标

### 变更

- 技能名 `pro-standards` → `dsh-pro-standards`
- 仓库形态由纯技能目录改为插件包：`SKILL.md` 与 `references/` 迁到 `skills/dsh-pro-standards/` 下
