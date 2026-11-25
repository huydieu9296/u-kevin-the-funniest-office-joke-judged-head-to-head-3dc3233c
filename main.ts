import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const INPUT = "./entry.txt";
const OUTPUT = "/output/entry.txt";
const MIN_CHARS = 1;
const MAX_CHARS = 200;

const raw = readFileSync(INPUT, "utf8");
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
  console.error("Verification failed: /output/entry.txt does not match entry.txt.");
  process.exit(1);
}

console.log(entry);
console.log(
  `OK: ${entry.length} characters (${byteLength} bytes UTF-8), 1 line, written to ${OUTPUT}.`
);
