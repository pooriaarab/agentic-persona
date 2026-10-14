---
name: agentic-persona
description: Keep one consistent AI persona across social content. Keywords: persona,influencer,brand-voice,agentic-suite,cli,mcp.
---

# agentic-persona

Keep one consistent AI persona across social content.

## Use the SDK

```js
import { summarizeText, dispatchText } from "agentic-persona";

summarizeText("some text");
await dispatchText("some text", { dryRun: true });
```

## Use the CLI

```sh
agentic-persona summary --text "some text"
agentic-persona dispatch --text "some text" --dry-run
```

## Use the MCP server

Start the server with `agentic-persona mcp`. Call `summarize_text`
for stats, `dispatch_text` for routes, `get_cost_report` for costs.

## Rules

- Preview each route with dry run first.
- Report guard denials and adapter errors as failures.
- Read the cost report at the end.
