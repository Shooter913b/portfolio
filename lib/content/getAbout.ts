import { cache } from "react";
import { readJsonFile } from "./readJson";
import { normalizeAbout } from "@/lib/about/normalize";

export const getAbout = cache(() => {
  return normalizeAbout(
    readJsonFile("content/about.json"),
    readJsonFile("content/site.json")
  );
});
