-- One-time wipe of all user data
DELETE FROM public.check_ins;
DELETE FROM public.user_journey_progress;
DELETE FROM public.plans;
DELETE FROM public.subscriptions;
DELETE FROM public.profiles;
DELETE FROM auth.users;