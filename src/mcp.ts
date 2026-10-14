import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createLogger, type Logger } from "./core.js";
import { addNote, consistencyCheck, definePersona, listNotes, promptPack, type PersonaProfile } from "./persona.js";
import { DEFAULT_BRAND } from "./index.js";
export interface McpDeps { logger?: Logger; }
const profileShape = { name: z.string(), handle: z.string(), niche: z.string(), voiceRules: z.array(z.string()), bannedPhrases: z.array(z.string()), disclosureLine: z.string(), visualStyle: z.string(), voiceStyle: z.string() };
function okResult(value: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(value) }] }; }
function errorResult(error: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) }], isError: true as const }; }
export function createMcpServer(_deps: McpDeps = {}): McpServer {
  const server = new McpServer({ name: DEFAULT_BRAND.command, version: DEFAULT_BRAND.version });
  server.registerTool("define_persona", { description: "Validate and define one consistent AI persona.", inputSchema: { ...profileShape } }, async (profile) => { try { return okResult(definePersona(profile as PersonaProfile)); } catch (e) { return errorResult(e); } });
  server.registerTool("validate_persona", { description: "Validate a persona profile and return its errors.", inputSchema: { ...profileShape } }, async (profile) => { const { validatePersona } = await import("./persona.js"); return okResult(validatePersona(profile as PersonaProfile)); });
  server.registerTool("consistency_check", { description: "Check persona voice, prohibited phrases, and mandatory disclosure.", inputSchema: { persona: z.object(profileShape), text: z.string() }, annotations: { readOnlyHint: true } }, async ({ persona, text }) => { try { return okResult(consistencyCheck(definePersona(persona), text)); } catch (e) { return errorResult(e); } });
  server.registerTool("prompt_pack", { description: "Generate consistent image, video, and disclosed caption prompts.", inputSchema: { persona: z.object(profileShape), topic: z.string() } }, async ({ persona, topic }) => { try { return okResult(promptPack(definePersona(persona), topic)); } catch (e) { return errorResult(e); } });
  server.registerTool("add_persona_note", { description: "Add a process-local persona memory note.", inputSchema: { note: z.string() } }, async ({ note }) => { try { return okResult(addNote(note)); } catch (e) { return errorResult(e); } });
  server.registerTool("list_persona_notes", { description: "List process-local persona memory notes.", inputSchema: {}, annotations: { readOnlyHint: true } }, async () => okResult(listNotes()));
  return server;
}
export async function startMcp(deps: McpDeps = {}): Promise<void> { const server = createMcpServer(deps); await server.connect(new StdioServerTransport()); }
