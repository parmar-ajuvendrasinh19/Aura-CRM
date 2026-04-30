-- Update existing clients to set isArchived to false
UPDATE "Client" SET "isArchived" = false WHERE "isArchived" IS NULL;
