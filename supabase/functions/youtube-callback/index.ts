import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      console.error('YouTube OAuth error:', error);
      return new Response(
        `<html><body><script>window.opener.postMessage({type:'youtube_error',error:'${error}'},'*');window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || 
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-callback`;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google credentials not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get channel info
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      throw new Error('No YouTube channel found for this account');
    }

    console.log('YouTube channel authenticated:', channel.snippet.title);

    const connectionData = {
      platform: 'youtube',
      account_id: channel.id,
      account_username: channel.snippet.title,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      account_metadata: {
        channel_id: channel.id,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails?.default?.url,
        subscriber_count: channel.statistics?.subscriberCount,
      },
    };

    return new Response(
      `<html><body><script>window.opener.postMessage({type:'youtube_success',data:${JSON.stringify(connectionData)}},'*');window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: any) {
    console.error('YouTube callback error:', error);
    return new Response(
      `<html><body><script>window.opener.postMessage({type:'youtube_error',error:'${error.message}'},'*');window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
