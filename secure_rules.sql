-- 1. Create a secure RPC function to boost the pots (Restricted to 'tripseven' admin only)
CREATE OR REPLACE FUNCTION public.boost_global_pot(
  p_wallet TEXT,
  p_amount NUMERIC,
  p_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Strict server-side verification of the admin account
  IF LOWER(p_wallet) <> 'tripseven' THEN
    RAISE EXCEPTION 'Access Denied: Only the apex administrator can boost the global pots.';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid Amount: Boost amount must be positive.';
  END IF;

  IF p_type = 'XPR' THEN
    UPDATE public.climber_profiles
    SET highest_multiplier = highest_multiplier + p_amount
    WHERE wallet_address = 'global_pots_config';
  ELSIF p_type = 'GUY' THEN
    UPDATE public.climber_profiles
    SET xp = xp + p_amount
    WHERE wallet_address = 'global_pots_config';
  ELSE
    RAISE EXCEPTION 'Invalid Pot Type: Must be XPR or GUY.';
  END IF;
END;
$$;

-- 2. Create a secure RPC function for users to increment the pot when purchasing goes (Prevents arbitrary overwrites)
CREATE OR REPLACE FUNCTION public.increment_pot_on_purchase(
  p_amount NUMERIC,
  p_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid Amount';
  END IF;

  IF p_type = 'XPR' THEN
    UPDATE public.climber_profiles
    SET highest_multiplier = highest_multiplier + p_amount
    WHERE wallet_address = 'global_pots_config';
  ELSIF p_type = 'GUY' THEN
    UPDATE public.climber_profiles
    SET xp = xp + p_amount
    WHERE wallet_address = 'global_pots_config';
  ELSE
    RAISE EXCEPTION 'Invalid Pot Type';
  END IF;
END;
$$;

-- Grant execution privileges to public anonymous and authenticated roles
GRANT EXECUTE ON FUNCTION public.boost_global_pot(TEXT, NUMERIC, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.boost_global_pot(TEXT, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_pot_on_purchase(NUMERIC, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_pot_on_purchase(NUMERIC, TEXT) TO authenticated;

-- 3. Tighten the Row-Level Security Policy for updates on profiles to prevent modifying the global config directly
DROP POLICY IF EXISTS "Allow public update profiles" ON public.climber_profiles;

CREATE POLICY "Allow public update profiles" ON public.climber_profiles
FOR UPDATE
USING (wallet_address IS NOT NULL AND LOWER(wallet_address) <> 'global_pots_config');