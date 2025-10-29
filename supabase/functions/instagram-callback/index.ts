import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Instagram OAuth error:', error);
      return new Response(
        `<html><body><script>window.opener.postMessage({type:'instagram_error',error:'${error}'},'*');window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID');
    const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET');
    const INSTAGRAM_REDIRECT_URI = Deno.env.get('INSTAGRAM_REDIRECT_URI') || 
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-callback`;

    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
      throw new Error('Instagram credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Get long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`
    );
    
    const longLivedData = await longLivedResponse.json();
    const accessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || 3600;

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    console.log('Instagram user authenticated:', userData.username);

    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store in database (you'll need to pass user_id properly in production)
    // For now, returning data to be stored client-side
    const connectionData = {
      platform: 'instagram',
      account_id: userData.id,
      account_username: userData.username,
      access_token: accessToken,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      account_metadata: {
        user_id: userData.id,
        username: userData.username,
      },
    };

    // Return success to opener window
    return new Response(
      `<html><body><script>window.opener.postMessage({type:'instagram_success',data:${JSON.stringify(connectionData)}},'*');window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Instagram callback error:', error);
    return new Response(
      `<html><body><script>window.opener.postMessage({type:'instagram_error',error:'${error.message}'},'*');window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
