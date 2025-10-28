-- Quick fix for module_access_code table
-- Run this directly on your PostgreSQL database

ALTER TABLE module_access_code ADD COLUMN IF NOT EXISTS consumed_by_class_id UUID;

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_module_access_code_consumed_by_class'
    ) THEN
        ALTER TABLE module_access_code 
        ADD CONSTRAINT fk_module_access_code_consumed_by_class 
        FOREIGN KEY (consumed_by_class_id) 
        REFERENCES class(id) ON DELETE CASCADE;
    END IF;
END $$;

