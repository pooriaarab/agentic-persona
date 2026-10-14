# agentic-persona

[![npm version](https://img.shields.io/npm/v/agentic-persona)](https://www.npmjs.com/package/agentic-persona)
[![Downloads/month](https://img.shields.io/npm/dm/agentic-persona)](https://www.npmjs.com/package/agentic-persona)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Quickstart](#check-your-first-caption) · [API and commands](#runtime-surfaces) · [Package](https://www.npmjs.com/package/agentic-persona)

agentic-persona is an open-source persona profile and text-checking toolkit for developers building AI content workflows.
It checks literal voice phrases, banned phrases, and disclosure text.
Its Node.js library, CLI, and Model Context Protocol (MCP) server also build image, video, and caption prompt strings.

## Install

```sh
npm install agentic-persona
```

Requires Node.js 18 or later. Includes TypeScript declarations and two runtime dependencies.

## Check your first caption

Save this example as `check-persona.mjs` after installation. Run `node check-persona.mjs`.
No API keys, environment variables, or `.env` loading are required.

```js
import { definePersona, consistencyCheck, promptPack } from 'agentic-persona';

const persona = definePersona({
  name: 'Ari', handle: '@ari', niche: 'sustainable fashion',
  voiceRules: ['warm', 'practical'], bannedPhrases: ['guaranteed'],
  disclosureLine: 'Created with AI assistance.',
  visualStyle: 'sunlit editorial portrait', voiceStyle: 'calm and conversational'
});
console.log(consistencyCheck(persona,
  'A warm, practical tip. Created with AI assistance.'));
console.log(promptPack(persona, 'repairing denim'));
```

The check prints `score: 100`, empty flags, and `missingDisclosure: false`.
The prompt pack contains `imagePrompt`, `videoPrompt`, and `captionPrompt`. It generates text, not media assets.

## How it works

```text
Profile -> validate and freeze -> persona
                                    |
                      +-------------+--------------+
                      |                            |
              caption substring checks     topic prompt templates
                      |                            |
              score and flags               image/video/caption strings
```

## Why it exists

A profile can keep identity fields and disclosure instructions in one place across content workflows.
textlint supports general prose rules. Promptfoo tests prompts and AI systems.
This package provides a smaller local profile checker and fixed prompt templates without model calls.

## Compare

Checked 2026-10-14 against [textlint's source](https://github.com/textlint/textlint) and [Promptfoo's source](https://github.com/promptfoo/promptfoo).
These are alternatives for content checks or prompt evaluation, with different scopes.

| Scope | agentic-persona | textlint | Promptfoo |
| --- | --- | --- | --- |
| Main task | Persona profiles and substring checks | Natural language linting | Prompt and AI-system evaluation |
| Configuration | Profile object or JSON | Installed rules and config file | Declarative evaluation configs |
| Execution | Local JavaScript functions | Local CLI and APIs | CLI and continuous integration |

## Coverage

| Surface or adapter | Status | Behavior |
| --- | --- | --- |
| Persona profile | ✓ | Validates fields and freezes profile values |
| Caption checks | ✓ | Case-insensitive substring checks |
| Prompt templates | ✓ | Returns image, video, and caption strings |
| Persona notes | ✓ | Process-local note storage |
| Local router | ✓ | SDK creates a receipt without external delivery |
| HTTP router | ✓ | SDK posts `{text}` to a supplied endpoint |
| Model providers and social publishers | — | No brand-specific integration exists |

The source exports six persona functions and two routing adapters. Tests cover local behavior and mocked HTTP routing.
No external integration is credential-verified by this rewrite. Prompt templates do not call an image, video, or language model.

## Common use cases

1. Content developers use Node.js to flag missing disclosure text before review.
2. Brand teams use a JSON profile and the CLI to detect prohibited phrases in captions.
3. Agent developers use an MCP client to build prompt strings from a shared profile.
4. Backend teams use TypeScript to store persona identity fields alongside their own content pipeline.

## Features

- **Profile validation:** checks required strings and arrays, then freezes the profile.
- **Consistency checks:** reports matched phrases, banned phrases, missing disclosure, and a score.
- **Prompt packs:** includes identity and style instructions in three prompt templates.
- **Notes:** adds timestamped notes and lists them oldest first within a process.
- **Core utilities:** includes text statistics, logging, routing guards, and dispatch cost counters.

## Runtime surfaces

The SDK exports `definePersona`, `validatePersona`, `consistencyCheck`, `promptPack`, `addNote`, and `listNotes`.
It also exports the shared text, guard, logging, routing, and cost utilities.

For CLI use, save the quickstart profile object as valid JSON in `persona.json`.

```sh
npx agentic-persona create --profile persona.json
npx agentic-persona show --profile persona.json
npx agentic-persona check --profile persona.json --text 'A warm tip. Created with AI assistance.'
npx agentic-persona prompts --profile persona.json --topic 'repairing denim'
npx agentic-persona add-note --note 'Prefer natural light'
npx agentic-persona list-notes
npx agentic-persona costs
npx agentic-persona mcp
```

These are the eight CLI commands. Help uses `--help` / `-h`; version uses `--version` / `-V`.
`create` and `show` validate and print a supplied profile; they do not save it.
Separate note commands start separate processes and do not share notes.

The dedicated `agentic-persona-mcp` executable also starts the stdio server.
Its six tools are `define_persona`, `validate_persona`, `consistency_check`, `prompt_pack`, `add_persona_note`, and `list_persona_notes`.
Notes share process memory; profile tools take explicit profile inputs rather than a saved active persona.

The built Worker entry provides `GET /health` and `POST /summarize` with a JSON `text` string.
It computes text statistics and has no persona routes. Deploy it yourself; it is not a managed service or package-root export.

## Delivery and behavior limits

Voice rules are literal phrases. A rule such as `warm` checks for that substring; it does not evaluate tone semantically.
The score starts with the matched-rule percentage, subtracts 25 per banned phrase, and subtracts 20 for missing disclosure.
An empty voice-rule list starts at 100. The score is not a calibrated quality or compliance measure.
Prompts request identity consistency; the package does not enforce generated faces, voices, or media style.
Notes are process-local, shared across personas, and absent from generated prompts. They disappear after a restart.
The package does not publish social posts, train models, or provide durable persona memory.
HTTP routing defaults to a ten-second timeout and has no retries or authentication configuration.
SDK dispatch is live unless `dryRun: true` is supplied. Preview each dispatch and stop if a guard denies it.
Cost reports count dispatches and characters, not money. Persona functions do not record dispatch costs.

## Integration guides

- [Node.js persona checking example](#check-your-first-caption)
- [JSON profile CLI and MCP reference](#runtime-surfaces)
- [Scoring and memory limits](#delivery-and-behavior-limits)

## Status

Version 0.1.0 is early; interfaces can change. Public case studies are not yet published in this repository.
Use [GitHub issues](https://github.com/pooriaarab/agentic-persona/issues) for support.

## FAQ

### Does agentic-persona generate images or videos?

agentic-persona returns prompt strings. You provide a generation service and review its output.

### Which integrations are verified?

agentic-persona has local and mocked routing tests. No external model or publishing integration is credential-verified by this rewrite.

### Does agentic-persona provide a managed persona service?

agentic-persona runs in your own process. You supply persistence, hosting, and model services.

### How is agentic-persona different from textlint?

agentic-persona checks profile phrases and builds persona prompt packs. textlint uses installed rules to lint natural language files.

### How is agentic-persona different from Promptfoo?

agentic-persona uses deterministic local profile checks without model evaluation. Promptfoo evaluates prompts and AI systems using configured tests.

### Does the score measure brand voice quality?

agentic-persona scores literal phrase matches and penalties. It does not measure semantic tone or certify quality.

### Do persona notes survive restarts?

agentic-persona stores notes in process memory. Your application needs its own durable storage.

### Does agentic-persona add disclosure to generated captions?

agentic-persona includes a disclosure instruction in the caption prompt. Its checker detects the configured substring; downstream output still needs review.

## License

MIT.
