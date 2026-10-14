export { VERSION } from "./version.js";
export {
  defineBrand, createLogger, GuardError, VendorError, createGuards, LocalRouterAdapter,
  HttpRouterAdapter, recordCost, getCostReport, resetCosts, createDryRunResult, dispatchText, summarizeText,
} from "./core.js";
export type {
  BrandConfig, LogLevel, Logger, LoggerOptions, CapsConfig, QuietHoursConfig, GuardsConfig, Guards,
  DispatchReceipt, RouterAdapter, HttpRouterOptions, CostEntry, CostReport, DispatchOptions, DispatchResult,
  TopWord, TextSummary, SummarizeOptions,
} from "./core.js";
export { definePersona, validatePersona, consistencyCheck, promptPack, addNote, listNotes } from "./persona.js";
export type { PersonaProfile, Persona, ConsistencyCheckResult, PromptPack, PersonaNote } from "./persona.js";

import { defineBrand, type BrandConfig } from "./core.js";
import { VERSION } from "./version.js";
export const DEFAULT_BRAND: BrandConfig = defineBrand({
  name: "Agentic Persona", command: "agentic-persona",
  description: "Keep one consistent AI persona across social content.",
  keywords: ["persona", "influencer", "brand-voice", "agentic-suite", "cli", "mcp"], version: VERSION,
});
