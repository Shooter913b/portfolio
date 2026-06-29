import { cache } from "react";
import { readJsonFile } from "./readJson";
import { profileSchema, type Profile } from "@/lib/schemas/profile";

export const getProfile = cache((): Profile => {
  return profileSchema.parse(readJsonFile("content/profile.json"));
});
