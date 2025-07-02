-- Check what policies currently exist and if any are still using problematic functions
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'project_members', 'meetings', 'meeting_invitations', 'project_presence');