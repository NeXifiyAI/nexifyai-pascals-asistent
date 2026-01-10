# OpenCode Documentation Summary

## Overview

OpenCode is an open source AI coding agent available as TUI, desktop app, or IDE extension. It connects to various LLM providers and helps with coding tasks.

## Key Features

- **Modes**:
  - **Plan Mode**: Suggests implementation details without making changes.
  - **Build Mode**: Executes changes based on instructions or approved plans.
- **Commands**:
  - `/init`: Initialize project (creates `AGENTS.md`).
  - `/connect`: Configure LLM provider.
  - `/undo` / `/redo`: Revert or re-apply changes.
  - `/share`: Share conversation.
- **Configuration**:
  - Global: `~/.config/opencode/opencode.json`
  - Project: `opencode.json` (in project root)

## Plugins & Extensions

- **Plugins**: Extend functionality via hooks (JS/TS).
  - Locations: `.opencode/plugin/` (project), `~/.config/opencode/plugin/` (global).
  - Can use npm packages.
  - Events: `file.edited`, `command.executed`, `session.created`, etc.
- **Skills**: Reusable instructions in `SKILL.md`.
  - Locations: `.opencode/skill/<name>/`, `~/.config/opencode/skill/<name>/`.
  - Structure: YAML frontmatter (`name`, `description`) + content.
  - Usage: Agents load skills on-demand via `skill` tool.
- **Custom Tools**: Define custom functions in plugins or config.
- **MCP Servers**: Integrate external tools via Model Context Protocol.

## Built-in Tools

- **bash**: Execute shell commands.
- **edit/write/read**: File manipulation.
- **grep/glob/list**: File search and listing (uses ripgrep, respects `.gitignore`).
- **lsp**: Language Server Protocol support (experimental).
- **skill**: Load agent skills.
- **todowrite/todoread**: Manage task lists.
- **webfetch**: Fetch web content.
- **question**: Ask user for input.

## Permissions

- Control access to tools/skills via `permission` object in config.
- States: `allow`, `deny`, `ask`.
- Supports wildcards (e.g., `internal-*`).

## Best Practices

- Commit `AGENTS.md` to help OpenCode understand the project.
- Use Plan Mode for complex features.
- Use `.ignore` to include files ignored by `.gitignore` in searches.
