-- Clear all PDF processing logs for the authenticated user
DELETE FROM pdf_processing_logs WHERE user_id = auth.uid();

-- Clear any orphaned records without user_id
DELETE FROM pdf_processing_logs WHERE user_id IS NULL;