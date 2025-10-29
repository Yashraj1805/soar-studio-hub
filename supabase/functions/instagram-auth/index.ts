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
    const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID');
    const INSTAGRAM_REDIRECT_URI = Deno.env.get('INSTAGRAM_REDIRECT_URI') || 
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-callback`;

    if (!INSTAGRAM_APP_ID) {
      return new Response(
        JSON.stringify({ 
          error: 'Instagram App ID not configured',
          notes: 'Set INSTAGRAM_APP_ID in Supabase secrets'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Instagram Basic Display API OAuth URL
    const scopes = ['user_profile', 'user_media'];
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&scope=${scopes.join(',')}&response_type=code`;

    console.log('Instagram OAuth URL generated:', authUrl);

    return new Response(
      JSON.stringify({ 
        authUrl,
        notes: 'Redirect user to this URL. For business account insights, use Instagram Graph API with app review.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating Instagram auth URL:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
