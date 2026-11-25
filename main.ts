import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths relative to this script file, not the working directory:
// the judge runs `node /bot/main.ts` from a different CWD, so a
// CWD-relative "./entry.txt" would throw ENOENT and exit 1.
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const INPUT = join(SCRIPT_DIR, "entry.txt");
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT = join(OUTPUT_DIR, "entry.txt");
const MIN_CHARS = 1;
const MAX_CHARS = 200;

let raw: string;
try {
  raw = readFileSync(INPUT, "utf8");
} catch (error) {
  // Name the resolved path so a future failure is diagnosable at a glance:
  // INPUT is script-relative, so this should only fail if entry.txt itself
  // is missing next to main.ts (not because of the caller's working dir).
  console.error(
    `Failed to read entry file at ${INPUT} (resolved relative to main.ts in ${SCRIPT_DIR}): ${
      error instanceof Error ? error.message : String(error)
    }`
  );
  process.exit(1);
}
const entry = raw.trim();

if (entry.length < MIN_CHARS || entry.length > MAX_CHARS) {
  console.error(
    `Invalid entry: ${entry.length} characters, must be ${MIN_CHARS}–${MAX_CHARS} characters.`
  );
  process.exit(1);
}

// The brief requires one short line as the whole entry.
if (entry.includes("\n")) {
  console.error("Invalid entry: must be exactly one line, no line breaks allowed.");
  process.exit(1);
}

const byteLength = Buffer.byteLength(entry, "utf8");

// entry.txt ends with a single trailing newline; preserve it so the
// written file is byte-identical to the source file.
const outputText = entry + "\n";

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, outputText, "utf8");

const written = readFileSync(OUTPUT, "utf8");
if (written !== raw) {
  console.error(`Verification failed: ${OUTPUT} does not match ${INPUT}.`);
  process.exit(1);
}

console.log(entry);
console.log(
  `OK: ${entry.length} characters (${byteLength} bytes UTF-8), 1 line, written to ${OUTPUT}.`
);
