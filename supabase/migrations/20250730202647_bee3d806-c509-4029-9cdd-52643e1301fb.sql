-- Clear all PDF processing logs for the authenticated user
DELETE FROM pdf_processing_logs WHERE user_id = auth.uid();

-- Also clear any records that might not have user_id set properly
DELETE FROM pdf_processing_logs WHERE user_id IS NULL;