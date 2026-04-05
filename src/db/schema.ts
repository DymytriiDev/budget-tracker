import { pgTable, text, integer, real, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const owners = pgTable("owners", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  categoryId: text("category_id").notNull(),
  month: text("month").notNull(), // YYYY-MM format
  limit: real("limit").notNull(),
  ownerId: text("owner_id"),
  ownerSplits:
    jsonb("owner_splits").$type<{ ownerId: string; limit: number }[]>(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  categoryId: text("category_id").notNull(),
  date: text("date").notNull(), // ISO datetime string
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  ownerId: text("owner_id"),
});

export const settings = pgTable("settings", {
  userId: text("user_id").primaryKey(),
  monthStartDay: integer("month_start_day").default(1),
  currency: text("currency").default("EUR"),
  defaultOwnerId: text("default_owner_id"),
});
