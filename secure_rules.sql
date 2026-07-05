-- =========================================================================
-- CLEAN UP OLD PUBLIC RPC FUNCTION
-- =========================================================================
DROP FUNCTION IF EXISTS public.increment_pot_on_purchase(numeric, text);

-- =========================================================================
-- CREATE SECURE INTERNAL LOGGING TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.pot_increments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('XPR', 'GUY')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.pot_increments ENABLE ROW LEVEL SECURITY;

-- Grant standard client insert privileges
GRANT INSERT ON TABLE public.pot_increments TO anon;
GRANT INSERT ON TABLE public.pot_increments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pot_increments TO service_role;

-- Allow public users to insert new increment requests
CREATE POLICY "Allow public insert pot_increments" ON public.pot_increments
FOR INSERT TO anon, authenticated 
WITH CHECK (amount > 0);

-- =========================================================================
-- CREATE SECURE INTERNAL TRIGGER FUNCTION (SECURITY DEFINER)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.process_pot_increment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Invalid Amount';
  END IF;

  IF NEW.type = 'XPR' THEN
    UPDATE public.climber_profiles
    SET highest_multiplier = highest_multiplier + NEW.amount
    WHERE wallet_address = 'global_pots_config';
  ELSIF NEW.type = 'GUY' THEN
    UPDATE public.climber_profiles
    SET xp = xp + NEW.amount
    WHERE wallet_address = 'global_pots_config';
  ELSE
    RAISE EXCEPTION 'Invalid Pot Type';
  END IF;

  RETURN NEW;
END;
$$;

-- Bind the trigger to the increments table
DROP TRIGGER IF EXISTS on_pot_increment_inserted ON public.pot_increments;
CREATE TRIGGER on_pot_increment_inserted
  AFTER INSERT ON public.pot_increments
  FOR EACH ROW EXECUTE FUNCTION public.process_pot_increment();

-- =========================================================================
-- STRICT REVOLKED EXECUTION (Advisor Protection)
-- =========================================================================
-- Revoke PUBLIC execution on the internal trigger function
REVOKE EXECUTE ON FUNCTION public.process_pot_increment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_pot_increment() FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_pot_increment() FROM authenticated;

-- Ensure admin boost function is also completely revoked from clients
REVOKE EXECUTE ON FUNCTION public.boost_global_pot(TEXT, NUMERIC, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.boost_global_pot(TEXT, NUMERIC, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.boost_global_pot(TEXT, NUMERIC, TEXT) FROM authenticated;

-- Tighten the Row-Level Security Policy for updates on profiles to prevent modifying the global config directly
DROP POLICY IF EXISTS "Allow public update profiles" ON public.climber_profiles;
CREATE POLICY "Allow public update profiles" ON public.climber_profiles
FOR UPDATE TO authenticated, anon
USING (wallet_address IS NOT NULL AND LOWER(wallet_address) <> 'global_pots_config');