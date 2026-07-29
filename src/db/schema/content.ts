import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { redirectEntityType, staticPageSlug, storefront } from "./enums";

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("global"),
  businessName: text("business_name").notNull().default("HouseCam"),
  whatsappNumber: text("whatsapp_number").notNull(),
  developmentModeEnabled: boolean("development_mode_enabled").notNull().default(true),
  homeAppSectionEnabled: boolean("home_app_section_enabled").notNull().default(true),
  homeAppQrUrl: text("home_app_qr_url"),
  homeAppQrPathname: text("home_app_qr_pathname"),
  homeAppStoreUrl: text("home_app_store_url"),
  homeGooglePlayUrl: text("home_google_play_url"),
  pickupAddress: text("pickup_address"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  defaultSeoTitle: text("default_seo_title").notNull().default("HouseCam"),
  defaultSeoDescription: text("default_seo_description").notNull().default("Seguridad y tranquilidad para tu hogar."),
  timezone: text("timezone").notNull().default("America/Argentina/Cordoba"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storefrontContent = pgTable("storefront_content", {
  storefront: storefront("storefront").primaryKey(),
  heroTitle: text("hero_title").notNull(),
  heroDescription: text("hero_description").notNull(),
  sections: jsonb("sections").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staticPages = pgTable("static_pages", {
  slug: staticPageSlug("slug").primaryKey(),
  title: text("title").notNull(),
  contentMarkdown: text("content_markdown").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  storefront: storefront("storefront"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => [index("faqs_public_idx").on(table.storefront, table.isActive, table.sortOrder)]);

export const slugRedirects = pgTable("slug_redirects", {
  id: uuid("id").primaryKey().defaultRandom(),
  oldPath: text("old_path").notNull(),
  newPath: text("new_path").notNull(),
  storefront: storefront("storefront").notNull(),
  entityType: redirectEntityType("entity_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("slug_redirects_old_path_uidx").on(table.oldPath)]);
