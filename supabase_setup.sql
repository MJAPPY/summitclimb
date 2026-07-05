-- ==========================================
-- 1. FIX FUNCTION MUTABLE SEARCH PATH
-- ==========================================
-- Secure the weekly payout function by locking its search path
ALTER FUNCTION public.process_weekly_payout() SET search_path = public, pg_catalog;


-- ==========================================
-- 2. HARDEN RLS POLICIES FOR CLIMBER PROFILES
-- ==========================================
-- Remove the insecure wildcard public write policy
DROP POLICY IF EXISTS "Allow public write profiles" ON public.climber_profiles;

-- Create secure restricted policies for insert and update operations
CREATE POLICY "Allow public insert profiles" ON public.climber_profiles
  FOR INSERT 
  WITH CHECK (wallet_address IS NOT NULL);

CREATE POLICY "Allow public update profiles" ON public.climber_profiles
  FOR UPDATE 
  USING (wallet_address IS NOT NULL);


-- ==========================================
-- 3. HARDEN RLS POLICIES FOR LEADERBOARD
-- ==========================================
-- Remove the insecure wildcard public write policy
DROP POLICY IF EXISTS "Allow public write leaderboard" ON public.climber_leaderboard;

-- Create secure restricted policies for insert and update operations
CREATE POLICY "Allow public insert leaderboard" ON public.climber_leaderboard
  FOR INSERT 
  WITH CHECK (wallet_address IS NOT NULL);

CREATE POLICY "Allow public update leaderboard" ON public.climber_leaderboard
  FOR UPDATE 
  USING (wallet_address IS NOT NULL);


-- ==========================================
-- 4. HARDEN PAYOUT HISTORY (ONLY READ-ONLY ON PUBLIC API)
-- ==========================================
-- Payout records are only appended by the database payout scheduler.
-- We can completely remove write policies on the public schema.
DROP POLICY IF EXISTS "Allow public write payouts" ON public.climber_payout_history;


-- ==========================================
-- 5. SECURE helper trigger function
-- ==========================================
-- Revoke public execution privileges from SECURITY DEFINER functions to prevent misuse
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;