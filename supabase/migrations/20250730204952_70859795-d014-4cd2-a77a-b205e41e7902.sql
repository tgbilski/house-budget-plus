-- Clear PDF processing logs for the current user (the one actually using the app)
DELETE FROM pdf_processing_logs WHERE user_id = '306ca59e-3ca0-4b8e-b2d2-118ce7770be1';