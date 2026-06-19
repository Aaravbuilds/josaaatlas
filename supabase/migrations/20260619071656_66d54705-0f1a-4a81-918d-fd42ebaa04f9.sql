
CREATE TABLE public.saved_colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institute TEXT NOT NULL,
  program TEXT,
  year TEXT,
  round TEXT,
  quota TEXT,
  seat_type TEXT,
  gender TEXT,
  closing_rank TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, institute, program, seat_type, quota)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_colleges TO authenticated;
GRANT ALL ON public.saved_colleges TO service_role;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved colleges" ON public.saved_colleges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX saved_colleges_user_idx ON public.saved_colleges(user_id, created_at DESC);

CREATE TABLE public.shortlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlists TO authenticated;
GRANT ALL ON public.shortlists TO service_role;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shortlists" ON public.shortlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.shortlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shortlist_id UUID NOT NULL REFERENCES public.shortlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institute TEXT NOT NULL,
  program TEXT,
  quota TEXT,
  seat_type TEXT,
  closing_rank TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlist_items TO authenticated;
GRANT ALL ON public.shortlist_items TO service_role;
ALTER TABLE public.shortlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shortlist items" ON public.shortlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX shortlist_items_list_idx ON public.shortlist_items(shortlist_id, position);

CREATE TABLE public.recent_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recent_searches TO authenticated;
GRANT ALL ON public.recent_searches TO service_role;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recent searches" ON public.recent_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX recent_searches_user_idx ON public.recent_searches(user_id, created_at DESC);

CREATE TRIGGER shortlists_updated_at BEFORE UPDATE ON public.shortlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
