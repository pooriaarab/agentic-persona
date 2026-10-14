import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createMcpServer } from "./mcp.js";
const persona = { name: "Ari", handle: "@ari", niche: "fashion", voiceRules: ["warm"], bannedPhrases: ["guaranteed"], disclosureLine: "Created with AI assistance.", visualStyle: "editorial", voiceStyle: "calm" };
function textOf(result: unknown) { return (result as { content: { text: string }[] }).content[0].text; }
describe("mcp server", () => test("serves persona tools", async () => { const [a,b] = InMemoryTransport.createLinkedPair(); const server = createMcpServer(); await server.connect(b); const client = new Client({ name: "probe", version: "0" }); await client.connect(a); try { expect((await client.listTools()).tools.map(x => x.name).sort()).toEqual(["add_persona_note", "consistency_check", "define_persona", "list_persona_notes", "prompt_pack", "validate_persona"]); const checked = await client.callTool({ name: "consistency_check", arguments: { persona, text: "warm Created with AI assistance." } }); expect(JSON.parse(textOf(checked))).toMatchObject({ missingDisclosure: false }); } finally { await client.close(); await server.close(); } }));
