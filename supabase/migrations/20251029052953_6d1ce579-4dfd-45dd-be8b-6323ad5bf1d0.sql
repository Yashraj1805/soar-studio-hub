-- Create table for storing connected social media accounts
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_id TEXT NOT NULL,
  account_username TEXT,
  account_metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Create table for caching dashboard data
CREATE TABLE IF NOT EXISTS public.dashboard_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'trending')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_status TEXT DEFAULT 'success' CHECK (sync_status IN ('success', 'error', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view their own connected accounts"
  ON public.connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connected accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected accounts"
  ON public.connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts"
  ON public.connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for dashboard_cache
CREATE POLICY "Users can view their own dashboard cache"
  ON public.dashboard_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard cache"
  ON public.dashboard_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard cache"
  ON public.dashboard_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard cache"
  ON public.dashboard_cache FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX idx_connected_accounts_platform ON public.connected_accounts(platform);
CREATE INDEX idx_dashboard_cache_user_id ON public.dashboard_cache(user_id);
CREATE INDEX idx_dashboard_cache_platform ON public.dashboard_cache(platform);
CREATE INDEX idx_dashboard_cache_last_synced ON public.dashboard_cache(last_synced);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_cache_updated_at
  BEFORE UPDATE ON public.dashboard_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();