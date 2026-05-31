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
  /** Discord channel ID override; null means use the bot default */
  channelId: text("channel_id"),
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

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Personal info
  fullName: text("full_name").notNull(),
  birthDate: text("birth_date").notNull(), // ISO date string YYYY-MM-DD
  country: text("country").notNull().default("Brasil"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  // Gaming info
  reason: text("reason").notNull(),
  favoriteRole: text("favorite_role", {
    enum: ["crewmate", "impostor", "both"],
  })
    .notNull()
    .default("both"),
  amogusHours: integer("amogus_hours").notNull().default(0),
  hoursPerWeek: integer("hours_per_week").notNull().default(0),
  otherGames: text("other_games"),
  howFound: text("how_found"),
  extraInfo: text("extra_info"),
  // Status
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  reviewedBy: integer("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewNote: text("review_note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const inscriptions = sqliteTable("inscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  channelId: text("channel_id"),
  messageId: text("message_id"),
  /** JSON array of { discordId, displayName, joinedAt } */
  participants: text("participants").notNull().default("[]"),
  maxParticipants: integer("max_participants"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  closedAt: integer("closed_at", { mode: "timestamp_ms" }),
  /** Hours before match (expiresAt) to post the announcement */
  announcementHoursBefore: integer("announcement_hours_before").default(2),
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

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inscriptionId: integer("inscription_id").references(() => inscriptions.id, {
    onDelete: "cascade",
  }),
  /** JSON array of { number: 1, players: Participant[] } */
  lobbies: text("lobbies").notNull().default("[]"),
  /** JSON array of Participant */
  suplentes: text("suplentes").notNull().default("[]"),
  channelId: text("channel_id"),
  messageId: text("message_id"),
  status: text("status", { enum: ["draft", "active", "finished"] })
    .notNull()
    .default("draft"),
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

export const lobbyResults = sqliteTable("lobby_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  lobbyNumber: integer("lobby_number").notNull(),
  /** JSON array of { discordId, displayName, points, role, outcome } */
  scores: text("scores").notNull().default("[]"),
  status: text("status", { enum: ["pending", "submitted"] })
    .notNull()
    .default("pending"),
  submittedBy: integer("submitted_by").references(() => users.id, {
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
export type Application = typeof applications.$inferSelect;
export type Inscription = typeof inscriptions.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type LobbyResult = typeof lobbyResults.$inferSelect;
