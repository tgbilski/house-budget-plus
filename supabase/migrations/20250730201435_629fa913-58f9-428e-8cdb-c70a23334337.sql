-- Clear PDF processing logs for the current user
DELETE FROM pdf_processing_logs WHERE user_id = auth.uid();