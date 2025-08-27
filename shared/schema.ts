import { sql } from "drizzle-orm";
import { pgTable, bigserial, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const aiTools = pgTable("ai_tools", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category"),
  source: text("source"),
  lastSeen: timestamp("last_seen").default(sql`now()`),
}, (table) => ({
  urlIndex: index("uniq_ai_tools_url").on(sql`(lower(${table.url}))`),
  categoryIndex: index("idx_ai_tools_category").on(table.category),
  lastSeenIndex: index("idx_ai_tools_last_seen").on(table.lastSeen),
}));

export const insertAiToolSchema = createInsertSchema(aiTools).omit({
  id: true,
  lastSeen: true,
});

export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type AiTool = typeof aiTools.$inferSelect;
