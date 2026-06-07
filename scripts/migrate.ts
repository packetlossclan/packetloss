import "dotenv/config";
import { createClient } from "@libsql/client";

const migrations: { sql: string; label: string }[] = [
  {
    sql: "ALTER TABLE inscriptions ADD COLUMN ranked_number INTEGER",
    label: "inscriptions.ranked_number",
  },
  {
    sql: "ALTER TABLE inscriptions ADD COLUMN season INTEGER",
    label: "inscriptions.season",
  },
];

(async () => {
  const db = createClient({ url: process.env.DB_FILE_NAME! });

  for (const { sql, label } of migrations) {
    try {
      await db.execute(sql);
      console.log(`✓ ${label}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate column name") || msg.includes("already exists")) {
        console.log(`– ${label} already exists, skipping`);
      } else {
        console.error(`✗ ${label}: ${msg}`);
        process.exit(1);
      }
    }
  }
})();
