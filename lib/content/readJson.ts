import { readFileSync } from "fs";
import path from "path";

export function readJsonFile<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), relativePath);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}
