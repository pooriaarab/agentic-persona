/** Domain functions for maintaining a consistent, disclosed AI persona. */
export interface PersonaProfile {
  name: string;
  handle: string;
  niche: string;
  voiceRules: readonly string[];
  bannedPhrases: readonly string[];
  disclosureLine: string;
  visualStyle: string;
  voiceStyle: string;
}

export type Persona = Readonly<PersonaProfile>;

export interface ConsistencyCheckResult {
  score: number;
  voiceMatches: string[];
  flags: string[];
  bannedPhrases: string[];
  missingDisclosure: boolean;
}

export interface PromptPack {
  topic: string;
  imagePrompt: string;
  videoPrompt: string;
  captionPrompt: string;
}

export interface PersonaNote {
  id: number;
  note: string;
  createdAt: string;
}

function clean(value: string): string {
  return value.trim();
}

/** Validate profile fields and return all human-readable problems. */
export function validatePersona(profile: PersonaProfile): string[] {
  const errors: string[] = [];
  for (const key of ["name", "handle", "niche", "disclosureLine", "visualStyle", "voiceStyle"] as const) {
    if (typeof profile[key] !== "string" || clean(profile[key]).length === 0) errors.push(`${key} must not be empty`);
  }
  for (const key of ["voiceRules", "bannedPhrases"] as const) {
    if (!Array.isArray(profile[key])) errors.push(`${key} must be an array`);
    else if (profile[key].some((value) => typeof value !== "string" || clean(value).length === 0)) {
      errors.push(`${key} must contain non-empty strings`);
    }
  }
  return errors;
}

/** Create an immutable persona after validating its identity and styles. */
export function definePersona(profile: PersonaProfile): Persona {
  const errors = validatePersona(profile);
  if (errors.length > 0) throw new Error(`invalid persona: ${errors.join("; ")}`);
  return Object.freeze({
    ...profile,
    name: clean(profile.name), handle: clean(profile.handle), niche: clean(profile.niche),
    disclosureLine: clean(profile.disclosureLine), visualStyle: clean(profile.visualStyle), voiceStyle: clean(profile.voiceStyle),
    voiceRules: Object.freeze(profile.voiceRules.map(clean)),
    bannedPhrases: Object.freeze(profile.bannedPhrases.map(clean)),
  });
}

/** Score text for persona voice, prohibited phrases, and mandatory AI disclosure. */
export function consistencyCheck(persona: Persona, text: string): ConsistencyCheckResult {
  const lowered = text.toLowerCase();
  const voiceMatches = persona.voiceRules.filter((rule) => lowered.includes(rule.toLowerCase()));
  const bannedPhrases = persona.bannedPhrases.filter((phrase) => lowered.includes(phrase.toLowerCase()));
  const missingDisclosure = !lowered.includes(persona.disclosureLine.toLowerCase());
  const flags: string[] = [];
  for (const phrase of bannedPhrases) flags.push(`banned phrase: ${phrase}`);
  if (missingDisclosure) flags.push("missing AI disclosure line");
  if (voiceMatches.length === 0 && persona.voiceRules.length > 0) flags.push("no voice rules matched");
  const voiceScore = persona.voiceRules.length === 0 ? 100 : Math.round((voiceMatches.length / persona.voiceRules.length) * 100);
  const score = Math.max(0, voiceScore - bannedPhrases.length * 25 - (missingDisclosure ? 20 : 0));
  return { score, voiceMatches, flags, bannedPhrases, missingDisclosure };
}

/** Produce image, video, and caption prompts that preserve the persona identity. */
export function promptPack(persona: Persona, topic: string): PromptPack {
  const subject = clean(topic);
  if (!subject) throw new Error("topic must not be empty");
  const identity = `${persona.name} (${persona.handle}), a ${persona.niche} creator`;
  return {
    topic: subject,
    imagePrompt: `Create an editorial image of ${identity} discussing ${subject}. Keep the same recognizable face and ${persona.visualStyle} visual style across every asset. No other identity or style changes.`,
    videoPrompt: `Create a short video of ${identity} about ${subject}. Preserve the same face, ${persona.visualStyle} visuals, and ${persona.voiceStyle} voice style. Delivery follows: ${persona.voiceRules.join("; ")}.`,
    captionPrompt: `Write a caption for ${identity} about ${subject}. Follow these voice rules: ${persona.voiceRules.join("; ")}. Never use: ${persona.bannedPhrases.join("; ") || "none"}. Include this exact disclosure: ${persona.disclosureLine}`,
  };
}

const notes: PersonaNote[] = [];
let nextNoteId = 1;

/** Add a process-local memory note for the persona. */
export function addNote(note: string): PersonaNote {
  const normalized = clean(note);
  if (!normalized) throw new Error("note must not be empty");
  const entry = Object.freeze({ id: nextNoteId++, note: normalized, createdAt: new Date().toISOString() });
  notes.push(entry);
  return { ...entry };
}

/** List process-local persona memory notes, oldest first. */
export function listNotes(): PersonaNote[] {
  return notes.map((note) => ({ ...note }));
}
