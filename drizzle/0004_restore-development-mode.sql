UPDATE "site_settings"
SET "development_mode_enabled" = true,
    "updated_at" = now()
WHERE "id" = 'global';
