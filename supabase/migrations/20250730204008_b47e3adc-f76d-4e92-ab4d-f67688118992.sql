-- Clear all PDF processing logs for the user
DELETE FROM pdf_processing_logs WHERE user_id = '8adfab8c-5126-462f-ad50-4dabfc26b3c5';

-- Clear orphaned records
DELETE FROM pdf_processing_logs WHERE user_id IS NULL;