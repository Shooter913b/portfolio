import { cache } from "react";
import { readJsonFile } from "./readJson";
import { siteSchema, type Site } from "@/lib/schemas/site";

export const getSite = cache((): Site => {
  return siteSchema.parse(readJsonFile("content/site.json"));
});
