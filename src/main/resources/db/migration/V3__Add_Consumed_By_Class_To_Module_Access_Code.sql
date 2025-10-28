-- ============================================
-- Migration: Add consumed_by_class_id to module_access_code table
-- ============================================

-- Check if module_access_code table exists and add consumed_by_class_id column
DO $$ 
BEGIN
    -- Check if module_access_code table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'module_access_code'
    ) THEN
        -- Check if column already exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'module_access_code' 
            AND column_name = 'consumed_by_class_id'
        ) THEN
            ALTER TABLE module_access_code 
            ADD COLUMN consumed_by_class_id UUID;
            
            -- Add foreign key constraint if class table exists
            IF EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'class'
            ) THEN
                ALTER TABLE module_access_code 
                ADD CONSTRAINT fk_module_access_code_consumed_by_class 
                FOREIGN KEY (consumed_by_class_id) 
                REFERENCES class(id) ON DELETE CASCADE;
            END IF;
            
            RAISE NOTICE 'Added consumed_by_class_id column to module_access_code table';
        ELSE
            RAISE NOTICE 'consumed_by_class_id column already exists in module_access_code table';
        END IF;
    ELSE
        RAISE NOTICE 'module_access_code table does not exist yet';
    END IF;
END $$;

