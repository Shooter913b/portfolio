import { z } from "zod";

export const LOG_REACTIONS = ["👍", "👎", "❤️", "🎉", "🚀", "💡"] as const;

export type LogReaction = (typeof LOG_REACTIONS)[number];

export const postEngagementSchema = z.object({
  views: z.number().int().nonnegative().default(0),
  reactions: z.record(z.string(), z.number().int().nonnegative()).default({}),
});

export const logEngagementSchema = z.object({
  posts: z.record(z.string(), postEngagementSchema).default({}),
});

export type PostEngagement = z.infer<typeof postEngagementSchema>;
export type LogEngagementData = z.infer<typeof logEngagementSchema>;

export function emptyPostEngagement(): PostEngagement {
  return { views: 0, reactions: {} };
}

export function normalizePostEngagement(data: unknown): PostEngagement {
  return postEngagementSchema.parse(data ?? {});
}

export function normalizeLogEngagement(data: unknown): LogEngagementData {
  return logEngagementSchema.parse(data ?? { posts: {} });
}

export function isLogReaction(value: string): value is LogReaction {
  return (LOG_REACTIONS as readonly string[]).includes(value);
}
