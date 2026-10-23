// dsh-pro-standards for the DeepSeek Harness (dsh)。
//
// 本包把自带的 `skills/` 目录注册成 dsh 的运行时技能：
//
//   ctx.skills.register({ name, description, content, resourceBase, ... })
//
// 用的是 `skills` 服务公开的运行时注册接口（与 dsh 自身的技能目录共用同一套
// 目录/层/去重规则），因此不需要依赖任何 dsh 内部包，也不跟具体版本绑定。
// 技能正文在 apply 时读入一次；升级本包会重新挂载插件，正文随之刷新。

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 本插件模块所在目录。 */
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))

/** Cordis 插件名。 */
export const name = 'dsh-pro-standards'

/** 本插件依赖的 dsh 服务。 */
export const inject = ['skills']

/** 技能正文文件名。 */
const SKILL_FILE = 'SKILL.md'
/** 覆盖技能根目录的环境变量。 */
const SKILLS_DIR_ENV = 'DSH_PRO_STANDARDS_SKILLS_DIR'
/** 注册进 dsh 技能目录时标记的来源。 */
const SKILL_SOURCE = 'bundled'

/**
 * 把本包的技能目录注册到 dsh。
 *
 * @param ctx - 带 `skills` 服务的 cordis 上下文。
 * @param config - 可选配置；每个键都有代码内默认值，可以不传。
 */
export function apply(ctx, config = {}) {
  const settings = config ?? {}
  const logger = createLogger(ctx)
  const skillsDir = resolveSkillsDir(settings, logger)

  if (skillsDir === undefined) {
    logger.warn(
      '没有找到技能目录，未注册任何技能。请把 `skillsDir` 配置或环境变量 '
      + `${SKILLS_DIR_ENV} 指向一个包含 <技能名>/${SKILL_FILE} 的目录。`,
    )
    return
  }

  const parsed = readSkills(skillsDir, logger)
  if (parsed.length === 0) {
    logger.warn(`${skillsDir} 下没有可用的 ${SKILL_FILE}，未注册任何技能。`)
    return
  }

  for (const skill of parsed) {
    // register 返回的是 Cordis effect 释放器；apply 期间的副作用由 fiber 统一回收。
    ctx.skills.register({
      name: skill.name,
      description: skill.description,
      ...(skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse }),
      content: skill.content,
      source: SKILL_SOURCE,
      resourceBase: { kind: 'directory', path: skill.dir },
    })
    logger.info(`已注册技能 ${skill.name}（来自 ${skill.dir}）`)
  }
}

/** 读取技能根目录下的全部技能。 */
function readSkills(skillsDir, logger) {
  const found = []
  let entries
  try {
    entries = readdirSync(skillsDir, { withFileTypes: true })
  } catch (error) {
    logger.error(`无法读取技能根目录 ${skillsDir}：${messageOf(error)}`)
    return found
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dir = join(skillsDir, entry.name)
    const file = join(dir, SKILL_FILE)
    if (!existsSync(file)) continue
    try {
      found.push(parseSkill(readFileSync(file, 'utf8'), dir, entry.name))
    } catch (error) {
      logger.error(`无法解析技能 ${file}：${messageOf(error)}`)
    }
  }
  return found
}

/** 解析一个 SKILL.md，返回注册所需字段。 */
function parseSkill(raw, dir, fallbackName) {
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?([\s\S]*)$/)
  const frontmatter = match === null ? {} : parseFrontmatter(match[1])
  const content = (match === null ? text : match[2]).trim()
  const name = frontmatter.name ?? fallbackName
  const description = frontmatter.description ?? firstLine(content) ?? name
  return {
    dir,
    name,
    description,
    whenToUse: frontmatter.whenToUse,
    content,
  }
}

/**
 * 解析技能 frontmatter 的最小 YAML 子集：`key: value`、`key: |` 与 `key: >`
 * 块标量、以及带引号的标量。技能 frontmatter 只需要这几个字段。
 */
function parseFrontmatter(block) {
  const result = {}
  const lines = block.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const keyed = line.match(/^([A-Za-z0-9_-]+):[ \t]*(.*)$/)
    if (keyed === null) continue
    const [, key, rawValue] = keyed
    if (rawValue === '|' || rawValue === '>') {
      const collected = []
      while (index + 1 < lines.length) {
        const next = lines[index + 1]
        if (next.trim() === '') {
          collected.push('')
          index += 1
          continue
        }
        if (!/^[ \t]/.test(next)) break
        collected.push(next.replace(/^[ \t]+/, ''))
        index += 1
      }
      const joined = rawValue === '|'
        ? collected.join('\n')
        : collected.join(' ').replace(/\s+/g, ' ')
      result[key] = joined.trim()
      continue
    }
    result[key] = unquote(rawValue.trim())
  }
  return result
}

/** 去掉成对的引号。 */
function unquote(value) {
  if (value.length >= 2) {
    const first = value[0]
    const last = value[value.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1)
    }
  }
  return value
}

/** 正文的第一行非空内容，用作描述兜底。 */
function firstLine(content) {
  const line = content.split(/\r?\n/).find((item) => item.trim() !== '')
  return line === undefined ? undefined : line.replace(/^#+\s*/, '').trim()
}

/**
 * 解析技能根目录。显式配置（config / 环境变量）指向的不是技能根目录时先告警，
 * 再按内置候选继续：
 *
 *   1. `config.skillsDir`（显式指定）
 *   2. `DSH_PRO_STANDARDS_SKILLS_DIR` 环境变量
 *   3. `<包目录>/skills` —— 正常路径
 *   4. `<包目录>/../skills` —— 仓库内检出的情形
 */
function resolveSkillsDir(config, logger) {
  const configured = typeof config.skillsDir === 'string' ? config.skillsDir.trim() : ''
  if (configured !== '') {
    const resolved = isAbsolute(configured) ? configured : resolve(configured)
    if (looksLikeSkillsDir(resolved)) return resolved
    logger.warn(
      `配置的 skillsDir 不是技能根目录（缺少 <技能名>/${SKILL_FILE}）：${resolved}，改为自动解析。`,
    )
  }
  const fromEnv = (process.env[SKILLS_DIR_ENV] ?? '').trim()
  if (fromEnv !== '') {
    const resolved = isAbsolute(fromEnv) ? fromEnv : resolve(fromEnv)
    if (looksLikeSkillsDir(resolved)) return resolved
    logger.warn(`环境变量 ${SKILLS_DIR_ENV} 指向的不是技能根目录：${resolved}，改为自动解析。`)
  }
  return [join(PLUGIN_DIR, 'skills'), resolve(PLUGIN_DIR, '..', 'skills')]
    .find((candidate) => looksLikeSkillsDir(candidate))
}

/** `dir` 是否像一个技能根目录。 */
function looksLikeSkillsDir(dir) {
  if (!existsSync(dir)) return false
  try {
    return readdirSync(dir, { withFileTypes: true })
      .some((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, SKILL_FILE)))
  } catch {
    return false
  }
}

/** 基于上下文 logger 的结构化日志，缺省为静默。 */
function createLogger(ctx) {
  const logger = ctx?.logger
  if (logger === undefined) return { info() {}, warn() {}, error() {} }
  const pick = (level) => (typeof logger[level] === 'function' ? logger[level].bind(logger) : () => {})
  return { info: pick('info'), warn: pick('warn'), error: pick('error') }
}

/** 把未知的抛出值转成可读消息。 */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}
