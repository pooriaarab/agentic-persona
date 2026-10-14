#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { getCostReport, GuardError, VendorError } from "./core.js";
import { addNote, consistencyCheck, definePersona, listNotes, promptPack, type PersonaProfile } from "./persona.js";
import { DEFAULT_BRAND } from "./index.js";
import { VERSION } from "./version.js";

export class UsageError extends Error { constructor(message: string) { super(message); this.name = "UsageError"; } }
export type CliCommand = "create" | "show" | "check" | "prompts" | "add-note" | "list-notes" | "costs" | "mcp" | "help" | "version";
export interface CliRequest { command: CliCommand; profile?: string; text?: string; topic?: string; note?: string; }

export function parseArgs(argv: string[]): CliRequest {
  const args = [...argv]; const first = args.shift();
  if (!first || first === "--help" || first === "-h") return { command: "help" };
  if (first === "--version" || first === "-V") return { command: "version" };
  const aliases: Record<string, CliCommand> = { create: "create", show: "show", check: "check", prompts: "prompts", "add-note": "add-note", "list-notes": "list-notes", costs: "costs", mcp: "mcp" };
  if (!(first in aliases)) throw new UsageError(`unknown command "${first}"`);
  const request: CliRequest = { command: aliases[first] };
  while (args.length) {
    const flag = args.shift() as string;
    if (!["--profile", "--text", "--topic", "--note"].includes(flag) || !args.length) throw new UsageError(`unknown or incomplete flag "${flag}"`);
    const value = args.shift() as string;
    if (flag === "--profile") request.profile = value;
    if (flag === "--text") request.text = value;
    if (flag === "--topic") request.topic = value;
    if (flag === "--note") request.note = value;
  }
  if (["create", "show", "check", "prompts"].includes(request.command) && !request.profile) throw new UsageError(`${request.command} needs --profile <json>`);
  if (request.command === "check" && request.text === undefined) throw new UsageError("check needs --text");
  if (request.command === "prompts" && !request.topic) throw new UsageError("prompts needs --topic");
  if (request.command === "add-note" && !request.note) throw new UsageError("add-note needs --note");
  return request;
}
export interface CliIo { out(line: string): void; err(line: string): void; readFile(path: string): string; }
function defaultIo(): CliIo { return { out: console.log, err: console.error, readFile: (path) => readFileSync(path, "utf8") }; }
function profileFrom(request: CliRequest, io: CliIo): PersonaProfile {
  try { return JSON.parse(io.readFile(request.profile as string)) as PersonaProfile; } catch (error) { throw new UsageError(`could not read persona profile: ${error instanceof Error ? error.message : String(error)}`); }
}
function helpText(): string { return `${DEFAULT_BRAND.name} ${VERSION}\n\nUsage: ${DEFAULT_BRAND.command} <command> [flags]\n\nCommands:\n  create --profile <json>             Validate and print a persona.\n  show --profile <json>               Print a persona.\n  check --profile <json> --text <t>   Check voice, bans, and disclosure.\n  prompts --profile <json> --topic <t> Generate image/video/caption prompts.\n  add-note --note <t>                 Add an in-memory persona memory note.\n  list-notes                          List in-memory persona memory notes.\n  costs                               Print the cost report.\n  mcp                                 Start the MCP server on stdio.`; }
export async function runCli(argv: string[], io: CliIo = defaultIo()): Promise<number> {
  let request: CliRequest; try { request = parseArgs(argv); } catch (e) { io.err(e instanceof Error ? e.message : String(e)); return 2; }
  try {
    switch (request.command) {
      case "help": io.out(helpText()); return 0;
      case "version": io.out(VERSION); return 0;
      case "create": case "show": io.out(JSON.stringify(definePersona(profileFrom(request, io)))); return 0;
      case "check": io.out(JSON.stringify(consistencyCheck(definePersona(profileFrom(request, io)), request.text as string))); return 0;
      case "prompts": io.out(JSON.stringify(promptPack(definePersona(profileFrom(request, io)), request.topic as string))); return 0;
      case "add-note": io.out(JSON.stringify(addNote(request.note as string))); return 0;
      case "list-notes": io.out(JSON.stringify(listNotes())); return 0;
      case "costs": io.out(JSON.stringify(getCostReport())); return 0;
      case "mcp": { const { startMcp } = await import("./mcp.js"); await startMcp(); return 0; }
    }
  } catch (e) { if (e instanceof GuardError || e instanceof VendorError || e instanceof UsageError || e instanceof Error) { io.err(`${e.name}: ${e.message}`); return 1; } throw e; }
}
function isMainModule(): boolean { const invoked = process.argv[1]; try { return typeof invoked === "string" && import.meta.url === pathToFileURL(realpathSync(invoked)).href; } catch { return false; } }
if (isMainModule()) runCli(process.argv.slice(2)).then((code) => { if (code) process.exit(code); }, (e: unknown) => { console.error(String(e)); process.exit(1); });
