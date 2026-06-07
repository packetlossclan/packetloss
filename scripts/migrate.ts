import "dotenv/config";
import { createClient } from "@libsql/client";

(async () => {
  const db = createClient({ url: process.env.DB_FILE_NAME! });

  // CREATE TABLE IF NOT EXISTS — safe to run on any DB state
  const tables: { sql: string; label: string }[] = [
    {
      label: "matches",
      sql: `CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inscription_id INTEGER REFERENCES inscriptions(id) ON DELETE CASCADE,
        lobbies TEXT NOT NULL DEFAULT '[]',
        suplentes TEXT NOT NULL DEFAULT '[]',
        channel_id TEXT,
        message_id TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )`,
    },
    {
      label: "lobby_results",
      sql: `CREATE TABLE IF NOT EXISTS lobby_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        lobby_number INTEGER NOT NULL,
        scores TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'pending',
        submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )`,
    },
  ];

  for (const { sql, label } of tables) {
    try {
      await db.execute(sql);
      console.log(`✓ table ${label}`);
    } catch (e: unknown) {
      console.error(`✗ table ${label}: ${e instanceof Error ? e.message : e}`);
      process.exit(1);
    }
  }

  // ALTER TABLE ADD COLUMN — idempotent via duplicate-column-name catch
  const columns: { sql: string; label: string }[] = [
    // inscriptions — columns added after the initial schema
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN ranked_number INTEGER",
      label: "inscriptions.ranked_number",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN season INTEGER",
      label: "inscriptions.season",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN description TEXT",
      label: "inscriptions.description",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN played INTEGER NOT NULL DEFAULT 0",
      label: "inscriptions.played",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN channel_id TEXT",
      label: "inscriptions.channel_id",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN message_id TEXT",
      label: "inscriptions.message_id",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN max_participants INTEGER",
      label: "inscriptions.max_participants",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1",
      label: "inscriptions.enabled",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN starts_at INTEGER",
      label: "inscriptions.starts_at",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN expires_at INTEGER",
      label: "inscriptions.expires_at",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN closed_at INTEGER",
      label: "inscriptions.closed_at",
    },
    {
      sql: "ALTER TABLE inscriptions ADD COLUMN announcement_hours_before INTEGER DEFAULT 2",
      label: "inscriptions.announcement_hours_before",
    },
  ];

  for (const { sql, label } of columns) {
    try {
      await db.execute(sql);
      console.log(`✓ ${label}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes("duplicate column name") ||
        msg.includes("already exists")
      ) {
        console.log(`– ${label} already exists, skipping`);
      } else {
        console.error(`✗ ${label}: ${msg}`);
        process.exit(1);
      }
    }
  }
})();
