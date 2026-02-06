import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const arrests = pgTable("arrests", {
  id: serial("id").primaryKey(),
  suspect: text("suspect").notNull(),
  agency: text("agency").default("TES").notNull(),
  officerDiscordId: text("officer_discord_id").notNull(),
  officerName: text("officer_name").notNull(),
  charges: text("charges").array().notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertArrestSchema = createInsertSchema(arrests).omit({ 
  id: true, 
  createdAt: true 
});

export type Arrest = typeof arrests.$inferSelect;
export type InsertArrest = z.infer<typeof insertArrestSchema>;
