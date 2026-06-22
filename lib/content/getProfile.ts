import { readJsonFile } from "./readJson";
import { profileSchema, type Profile } from "@/lib/schemas/profile";

export function getProfile(): Profile {
  return profileSchema.parse(readJsonFile("content/profile.json"));
}
