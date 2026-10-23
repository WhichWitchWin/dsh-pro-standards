# dsh-pro-standards · Professional Standards

[中文](README.md) | **English**

A skill for AI coding agents: before touching a project, think the way a competent practitioner does — **what is the proper way to do this, should this situation follow the official rule or the industry norm, and where does my plan differ** — then act.

## The problem it solves

The most common failure of an AI coding agent is not "it cannot write code". It is "it writes without looking at the situation":

- the project uses `pnpm-lock.yaml`, the agent runs `npm install` and the lockfile is now a mess;
- dependencies of a throwaway script get added to the real manifest;
- parameters are invented from memory and fail at runtime;
- a dozen loose files of the same kind sit in one directory, and nobody knows which one is the entry point;
- changes are shipped with no explanation and no rollback point.

`dsh-pro-standards` inserts a short judgement step **before** such actions, instead of cleaning up afterwards.

## Core method: the three-step check

Before any action that leaves a mark on the project (installing dependencies, calling an API, writing code, organising files, committing, releasing, writing docs), take three steps:

| Step | Question | Where it lands |
|---|---|---|
| 1 Find the standard | What is the proper way to do this? | Official docs / existing project conventions (AGENTS.md, README, lockfile, code style) / industry norms |
| 2 Read the situation | Should this follow the official rule or the industry norm? | One-off or widespread-in-the-industry → industry norm; long-lived, collaborative, security-related, or officially mandated → the official rule |
| 3 Check the gap | How does my plan differ from the standard? | If there is a gap, raise it with the template; if not, just do the work |

Three principles:

1. **Contextual choices**, not rule recitation;
2. **State the reason** — one short line on why a given choice was made;
3. **Warn, don't block** — explain the consequence and the proper way; if you insist on your approach, it goes ahead with the risk noted once.

When genuinely unsure, the skill asks you rather than guessing.

## Install

Put `SKILL.md` and `references/` together into your runtime's skills directory:

| Runtime | Skills directory |
|---|---|
| DSH (DeepSeek Harness) | `~/.dsh/skills/` (cross-runtime alias `~/.agents/skills/`) |

```bash
git clone https://github.com/WhichWitchWin/dsh-pro-standards.git
mkdir -p ~/.dsh/skills/dsh-pro-standards
cp -r dsh-pro-standards/SKILL.md dsh-pro-standards/references ~/.dsh/skills/dsh-pro-standards/
```

```powershell
git clone https://github.com/WhichWitchWin/dsh-pro-standards.git
New-Item -ItemType Directory -Force "$HOME\.dsh\skills\dsh-pro-standards" | Out-Null
Copy-Item -Recurse .\dsh-pro-standards\SKILL.md, .\dsh-pro-standards\references "$HOME\.dsh\skills\dsh-pro-standards"
```

You can also fetch the files from npm (this only downloads them; they still have to go into the skills directory):

```bash
npm install dsh-pro-standards
mkdir -p ~/.dsh/skills/dsh-pro-standards
cp -r node_modules/dsh-pro-standards/SKILL.md node_modules/dsh-pro-standards/references ~/.dsh/skills/dsh-pro-standards/
```

Keep the directory name the same as the `name` field in `SKILL.md` (`dsh-pro-standards`): the runtime identifies a skill by the frontmatter `name`, so a matching directory name merely keeps the two from drifting apart.

## Usage

Two ways to trigger it:

- **Automatic**: if your agent rules include a routing clause that loads a matching skill for development, dependency installation, file organisation or documentation, it is loaded together with those rules;
- **Manual**: just say it — "check this project with dsh-pro-standards" or "review this change against the standards".

A typical exchange:

> **You**: Just install that CLI tool — `curl` the binary and drop it in PATH.
>
> **Agent**: ⚠️ That is not quite proper: dropping a downloaded binary into PATH.
> The trouble: no version management, manual upgrades, and the source is hard to verify.
> The proper way: install it with a package manager, e.g. `npm i -g <pkg>`, or `pnpm add -D <pkg>` inside the project.
> Do it the proper way? (Your call — the original approach is fine too.)

## Repository layout

```
dsh-pro-standards/
├── SKILL.md                 # Main file: principles + three-step check + reminder template
├── references/
│   └── standards.md         # On-demand detail: rules, examples, counter-examples
├── README.md                # 中文说明
├── README.en.md             # English README (this file)
├── CHANGELOG.md             # Release notes
├── package.json             # npm package manifest
├── LICENSE                  # MIT
├── .gitignore               # Ignores backups/ and other local files
└── .gitattributes           # Keeps line endings at LF
```

`references/standards.md` covers seven modules — dependency installation, API usage, code style, file layout, open-source workflow, documentation, versioning and release — plus a general judgement framework and extra reminder wording.

## Why there is no exhaustive checklist

A checklist never catches up with reality, and it goes stale. This skill ships **one method** and expands the detail on demand: `SKILL.md` stays small so it costs little context, while the detail lives in `references/` and is read only when needed.

## License

[MIT](LICENSE) © dsh-pro-standards contributors
