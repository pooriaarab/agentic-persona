import { describe, expect, test } from "vitest";
import { parseArgs, runCli, UsageError, type CliIo } from "./cli.js";
const profile = JSON.stringify({ name: "Ari", handle: "@ari", niche: "fashion", voiceRules: ["warm"], bannedPhrases: ["guaranteed"], disclosureLine: "Created with AI assistance.", visualStyle: "editorial", voiceStyle: "calm" });
function io(): CliIo & { outLines: string[]; errLines: string[] } { const outLines: string[] = [], errLines: string[] = []; return { outLines, errLines, out: (x) => outLines.push(x), err: (x) => errLines.push(x), readFile: () => profile }; }
describe("CLI", () => {
 test("parses persona commands", () => expect(parseArgs(["check", "--profile", "p.json", "--text", "hi"])).toMatchObject({ command: "check", text: "hi" }));
 test("rejects missing profile", () => expect(() => parseArgs(["check", "--text", "hi"])).toThrow(UsageError));
 test("checks persona text", async () => { const out = io(); expect(await runCli(["check", "--profile", "p", "--text", "warm Created with AI assistance."], out)).toBe(0); expect(JSON.parse(out.outLines[0])).toMatchObject({ missingDisclosure: false }); });
 test("prints prompt pack", async () => { const out = io(); await runCli(["prompts", "--profile", "p", "--topic", "denim"], out); expect(JSON.parse(out.outLines[0]).captionPrompt).toContain("Created with AI assistance."); });
 test("bad usage exits 2", async () => { const out = io(); expect(await runCli(["bogus"], out)).toBe(2); });
});
