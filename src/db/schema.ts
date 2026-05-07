import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  role: text("role", { enum: ["user", "admin", "super_admin"] })
    .notNull()
    .default("user"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const ads = sqliteTable("ads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  /** "minutes" | "hours" | "days" | "once" | "daily_time" | "specific_dates" */
  scheduleType: text("schedule_type").notNull().default("hours"),
  /** Interval value for minutes/hours/days types */
  scheduleInterval: integer("schedule_interval"),
  /** HH:MM for daily_time; "YYYY-MM-DDTHH:MM" for once */
  scheduleTime: text("schedule_time"),
  /** JSON array of "YYYY-MM-DDTHH:MM" strings for specific_dates */
  scheduleDates: text("schedule_dates"),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  lastPostedAt: integer("last_posted_at", { mode: "timestamp_ms" }),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type User = typeof users.$inferSelect;
export type Ad = typeof ads.$inferSelect;
