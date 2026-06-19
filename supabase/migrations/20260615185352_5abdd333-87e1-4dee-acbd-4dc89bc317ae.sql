
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cutoffs are publicly readable"
  ON public.cutoffs FOR SELECT
  USING (true);
