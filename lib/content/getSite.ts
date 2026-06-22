import { readJsonFile } from "./readJson";
import { siteSchema, type Site } from "@/lib/schemas/site";

export function getSite(): Site {
  return siteSchema.parse(readJsonFile("content/site.json"));
}
