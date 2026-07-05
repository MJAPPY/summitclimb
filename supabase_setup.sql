-- ==========================================
-- SUMMIT CLIMB SYSTEM DATABASE LAUNCH SETUP
-- ==========================================

-- 1. Create Profiles Table (Stores Climber progression & credits)
CREATE TABLE IF NOT EXISTS public.climber_profiles (
  wallet_address TEXT PRIMARY KEY,
  remaining_goes INTEGER DEFAULT 0,
  highest_multiplier NUMERIC DEFAULT 1.00,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  lifetime_games INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Leaderboard Table (Stores current weekly flight apexes)
CREATE TABLE IF NOT EXISTS public.climber_leaderboard (
  wallet_address TEXT PRIMARY KEY,
  score NUMERIC DEFAULT 1.00,
  games_played INTEGER DEFAULT 0,
  country TEXT DEFAULT 'USA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Payout History Table (Archived records of previous tournament distributions)
CREATE TABLE IF NOT EXISTS public.climber_payout_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xpr_pot_total NUMERIC,
  guy_pot_total NUMERIC,
  winner_wallet TEXT,
  rank INTEGER,
  prize_fraction NUMERIC,
  xpr_payout NUMERIC,
  guy_payout NUMERIC
);

-- 4. Enable Row Level Security (RLS) across all tables
ALTER TABLE public.climber_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climber_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climber_payout_history ENABLE ROW LEVEL SECURITY;

-- 5. Enable Data API Grants for Anon, Authenticated and Service Role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.climber_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.climber_leaderboard TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.climber_payout_history TO anon, authenticated, service_role;

-- 6. Configure RLS Policies (Allow client-side WebAuth reads and conditional writes)
DROP POLICY IF EXISTS "Allow public read profiles" ON public.climber_profiles;
CREATE POLICY "Allow public read profiles" ON public.climber_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write profiles" ON public.climber_profiles;
CREATE POLICY "Allow public write profiles" ON public.climber_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read leaderboard" ON public.climber_leaderboard;
CREATE POLICY "Allow public read leaderboard" ON public.climber_leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write leaderboard" ON public.climber_leaderboard;
CREATE POLICY "Allow public write leaderboard" ON public.climber_leaderboard FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read payouts" ON public.climber_payout_history;
CREATE POLICY "Allow public read payouts" ON public.climber_payout_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write payouts" ON public.climber_payout_history;
CREATE POLICY "Allow public write payouts" ON public.climber_payout_history FOR ALL USING (true) WITH CHECK (true);

-- 7. Initialize Global Shared Pots Configuration Row
INSERT INTO public.climber_profiles (wallet_address, highest_multiplier, xp, level, remaining_goes)
VALUES ('global_pots_config', 5000.0, 25000.0, 1, 0)
ON CONFLICT (wallet_address) DO NOTHING;

-- 8. Core Business Logic Function: process_weekly_payout()
-- Distributes 93% of XPR and GUY pots exponentially to top 15, retains 7%, logs payout details, resets pots.
CREATE OR REPLACE FUNCTION public.process_weekly_payout()
RETURNS VOID AS $$
DECLARE
  v_xpr_pot NUMERIC;
  v_guy_pot NUMERIC;
  v_rec RECORD;
  v_rank INT := 0;
  v_fraction NUMERIC;
BEGIN
  -- Query current pot state
  SELECT highest_multiplier, xp INTO v_xpr_pot, v_guy_pot 
  FROM public.climber_profiles 
  WHERE wallet_address = 'global_pots_config';

  IF v_xpr_pot IS NULL THEN
    v_xpr_pot := 5000.0;
  END IF;
  IF v_guy_pot IS NULL THEN
    v_guy_pot := 25000.0;
  END IF;

  -- Distribute 93% of the accumulated prize pools
  FOR v_rec IN 
    SELECT wallet_address, score 
    FROM public.climber_leaderboard 
    ORDER BY score DESC 
    LIMIT 15
  LOOP
    v_rank := v_rank + 1;
    
    -- Calculate prize fraction exponentially
    IF v_rank = 1 THEN v_fraction := 40.0;
    ELSIF v_rank = 2 THEN v_fraction := 25.0;
    ELSIF v_rank = 3 THEN v_fraction := 15.0;
    ELSIF v_rank = 4 THEN v_fraction := 8.0;
    ELSIF v_rank = 5 THEN v_fraction := 5.0;
    ELSE v_fraction := 0.77; -- Remainder split equally among ranks 6-15
    END IF;

    -- Record transaction history for each winner
    INSERT INTO public.climber_payout_history (
      payout_date,
      xpr_pot_total,
      guy_pot_total,
      winner_wallet,
      rank,
      prize_fraction,
      xpr_payout,
      guy_payout
    ) VALUES (
      NOW(),
      v_xpr_pot,
      v_guy_pot,
      v_rec.wallet_address,
      v_rank,
      v_fraction,
      (v_fraction / 100) * (v_xpr_pot * 0.93),
      (v_fraction / 100) * (v_guy_pot * 0.93)
    );
  END LOOP;

  -- Reset accumulated global pots row back to base seed parameters
  UPDATE public.climber_profiles 
  SET highest_multiplier = 5000.0, xp = 25000.0 
  WHERE wallet_address = 'global_pots_config';

  -- Clear current weekly leaderboard scoreboard for the new cycle
  DELETE FROM public.climber_leaderboard;
END;
$$ LANGUAGE plpgsql;