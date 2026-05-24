
-- 1. Fix cohort_2_waitlist: replace permissive INSERT, add owner SELECT
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.cohort_2_waitlist;

CREATE POLICY "Authenticated users join waitlist for themselves"
ON public.cohort_2_waitlist
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

CREATE POLICY "Users read own waitlist entry"
ON public.cohort_2_waitlist
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from client roles.
-- These are used internally (RLS predicates / triggers) and should not be
-- callable directly by signed-in users.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
