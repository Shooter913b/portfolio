import { readJsonFile } from "./readJson";
import { normalizeAbout } from "@/lib/about/normalize";

export function getAbout() {
  return normalizeAbout(
    readJsonFile("content/about.json"),
    readJsonFile("content/site.json")
  );
}
