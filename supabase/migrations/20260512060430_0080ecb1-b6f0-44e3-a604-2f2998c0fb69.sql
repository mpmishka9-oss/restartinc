
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND lower(email) = 'mpmishka9@gmail.com'
  );
$$;

CREATE POLICY "Admin reads all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin reads all check_ins"
ON public.check_ins
FOR SELECT
USING (public.is_admin());
