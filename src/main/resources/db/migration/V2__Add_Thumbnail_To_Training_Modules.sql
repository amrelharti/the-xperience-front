-- ============================================
-- Migration: Add thumbnail_url to training_modules table
-- ============================================

-- Check if training_modules table exists and add thumbnail_url column
DO $$ 
BEGIN
    -- Check if training_modules table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'training_modules'
    ) THEN
        -- Check if column already exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'training_modules' 
            AND column_name = 'thumbnail_url'
        ) THEN
            ALTER TABLE training_modules ADD COLUMN thumbnail_url TEXT;
            RAISE NOTICE 'Added thumbnail_url column to training_modules table';
        ELSE
            RAISE NOTICE 'thumbnail_url column already exists in training_modules table';
        END IF;
    ELSE
        RAISE NOTICE 'training_modules table does not exist yet';
    END IF;
END $$;


