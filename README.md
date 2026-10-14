# Agentic Persona

Create and maintain one consistent, transparent AI persona across social content.

## Install and verify

```sh
npm install
npm run build && npm run typecheck && npm test
```

## Library

```js
import { definePersona, consistencyCheck, promptPack } from "agentic-persona";

const persona = definePersona({
  name: "Ari", handle: "@ari", niche: "sustainable fashion",
  voiceRules: ["warm", "practical"], bannedPhrases: ["guaranteed"],
  disclosureLine: "Created with AI assistance.",
  visualStyle: "sunlit editorial portrait", voiceStyle: "calm and conversational"
});
console.log(consistencyCheck(persona, "A warm tip. Created with AI assistance."));
console.log(promptPack(persona, "repairing denim"));
```

`promptPack` always includes the persona identity/style and an exact disclosure instruction for captions. `addNote` and `listNotes` hold process-local memory notes.

## CLI

Store the profile JSON above in `persona.json`, then:

```sh
node dist/cli.js create --profile persona.json
node dist/cli.js check --profile persona.json --text "A warm tip. Created with AI assistance."
node dist/cli.js prompts --profile persona.json --topic "repairing denim"
node dist/cli.js add-note --note "Prefer natural light"
node dist/cli.js list-notes
node dist/cli.js --help
```

## MCP

```sh
node dist/cli.js mcp
```

Available tools: `define_persona`, `validate_persona`, `consistency_check`, `prompt_pack`, `add_persona_note`, and `list_persona_notes`.
