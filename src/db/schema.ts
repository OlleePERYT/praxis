import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const practices = sqliteTable("practices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subdomain: text("subdomain").notNull().unique(),
  name: text("name").notNull(),
  logoPath: text("logo_path"),
  config: text("config").notNull(),
  createdAt: text("created_at").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  practiceId: integer("practice_id")
    .notNull()
    .references(() => practices.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const scenarios = sqliteTable("scenarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  practiceId: integer("practice_id")
    .notNull()
    .references(() => practices.id),
  name: text("name").notNull(),
  data: text("data").notNull(),
  createdAt: text("created_at").notNull(),
});
