import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pdfPath = join(root, "public/resume.pdf");
const texPath = join(root, "Latex Resume.tex");

function isValidPdfHeader(buffer) {
  if (buffer.length < 8) return false;
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") return false;
  // Corruption from editing the binary as text turns bytes into the UTF-8
  // replacement char (EF BF BD). A clean PDF header has none in this range.
  return !buffer.subarray(0, 64).includes(0xef);
}

function tryRebuild() {
  if (!existsSync(texPath)) return false;
  console.log("ensure-resume-pdf: rebuilding from Latex Resume.tex…");
  try {
    execSync("bash scripts/build-resume.sh", { cwd: root, stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

function warnAndContinue(reason) {
  console.warn(
    `ensure-resume-pdf: ${reason}\n` +
      "  The site will still build; the resume preview falls back to a download link.\n" +
      "  To restore it: add a valid public/resume.pdf (or `Latex Resume.tex` + `npm run build:resume`)."
  );
  // Non-fatal: never block `next dev` / `next build` over the resume asset.
  process.exit(0);
}

if (!existsSync(pdfPath)) {
  if (!tryRebuild()) {
    warnAndContinue("public/resume.pdf is missing and no LaTeX source is available");
  }
}

const pdf = readFileSync(pdfPath);
if (!isValidPdfHeader(pdf)) {
  if (!tryRebuild()) {
    warnAndContinue("public/resume.pdf looks corrupt and no LaTeX source is available to rebuild it");
  }

  const rebuilt = readFileSync(pdfPath);
  if (!isValidPdfHeader(rebuilt)) {
    warnAndContinue("public/resume.pdf is still invalid after rebuild");
  }
}

console.log("ensure-resume-pdf: ok");
