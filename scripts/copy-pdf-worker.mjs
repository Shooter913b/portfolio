import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const dest = join(root, "public/pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.warn("copy-pdf-worker: pdfjs-dist worker not found, skipping");
  process.exit(0);
}

copyFileSync(source, dest);
console.log("copy-pdf-worker: wrote public/pdf.worker.min.mjs");
