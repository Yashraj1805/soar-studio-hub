import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default fallback data
const getDefaultDashboard = (): any => ({
  fallback: true,
  timestamp: new Date().toISOString(),
  instagram: {
    connected: false,
    followers: 12500,
    posts: 145,
    engagement_rate: 8.4,
    recent_posts: [],
    notes: 'Default data - connect Instagram for real metrics'
  },
  youtube: {
    connected: false,
    subscribers: 8500,
    views: 145000,
    videos: 67,
    recent_videos: [],
    notes: 'Default data - connect YouTube for real metrics'
  },
  trending: {
    topics: ['AI Tools', 'Content Creation', 'Social Media Tips'],
    sources: [],
    notes: 'Default topics - trending scraper not configured'
  },
  ai: {
    enabled: false,
    ideas: [],
    message: 'Connect platforms and enable AI for personalized suggestions'
  },
  errors: []
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify(getDefaultDashboard()),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('No authenticated user, returning defaults');
      return new Response(
        JSON.stringify(getDefaultDashboard()),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first
    const { data: cachedData } = await supabase
      .from('dashboard_cache')
      .select('*')
      .eq('user_id', user.id)
      .order('last_synced', { ascending: false })
      .limit(1)
      .single();

    // If cache is fresh (< 15 minutes), return it
    if (cachedData && new Date(cachedData.last_synced).getTime() > Date.now() - 15 * 60 * 1000) {
      console.log('Returning cached dashboard data');
      return new Response(
        JSON.stringify({ ...cachedData.data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get connected accounts
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const dashboard = getDefaultDashboard();
    dashboard.fallback = false;
    const errors: string[] = [];

    // Fetch Instagram data
    const instagramAccount = accounts?.find(a => a.platform === 'instagram');
    if (instagramAccount) {
      try {
        const igData = await fetchInstagramData(instagramAccount.access_token);
        dashboard.instagram = { ...igData, connected: true };
      } catch (error: any) {
        console.error('Instagram fetch error:', error);
        errors.push(`Instagram: ${error?.message || 'Unknown error'}`);
        dashboard.instagram.notes = 'Failed to fetch - using defaults';
      }
    }

    // Fetch YouTube data
    const youtubeAccount = accounts?.find(a => a.platform === 'youtube');
    if (youtubeAccount) {
      try {
        const ytData = await fetchYouTubeData(
          youtubeAccount.access_token,
          youtubeAccount.refresh_token || '',
          user.id
        );
        dashboard.youtube = { ...ytData, connected: true };
      } catch (error: any) {
        console.error('YouTube fetch error:', error);
        errors.push(`YouTube: ${error?.message || 'Unknown error'}`);
        dashboard.youtube.notes = 'Failed to fetch - using defaults';
      }
    }

    // Fetch trending topics
    try {
      const trending = await fetchTrendingTopics();
      dashboard.trending = trending;
    } catch (error: any) {
      console.error('Trending fetch error:', error);
      errors.push(`Trending: ${error?.message || 'Unknown error'}`);
    }

    // AI enrichment using Lovable AI (ChatGPT alternative via Lovable AI Gateway)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      try {
        const aiIdeas = await generateAIIdeas(dashboard, LOVABLE_API_KEY);
        dashboard.ai = { enabled: true, ideas: aiIdeas, message: 'AI suggestions generated' };
      } catch (error: any) {
        console.error('AI generation error:', error);
        dashboard.ai.message = `AI unavailable: ${error?.message || 'Unknown error'}`;
        errors.push(`AI: ${error?.message || 'Unknown error'}`);
      }
    }

    dashboard.errors = errors;

    // Cache the result
    await supabase
      .from('dashboard_cache')
      .upsert({
        user_id: user.id,
        platform: 'unified',
        data: dashboard,
        last_synced: new Date().toISOString(),
        sync_status: errors.length > 0 ? 'partial' : 'success',
        error_message: errors.length > 0 ? errors.join('; ') : null,
      });

    return new Response(
      JSON.stringify(dashboard),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Dashboard data error:', error);
    const defaultData = getDefaultDashboard();
    defaultData.errors = [error?.message || 'Unknown error'];
    return new Response(
      JSON.stringify(defaultData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchInstagramData(accessToken: string) {
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram data');
  }

  const data = await response.json();
  const posts = data.data || [];

  // Calculate engagement
  const totalEngagement = posts.reduce((sum: number, post: any) => 
    sum + (post.like_count || 0) + (post.comments_count || 0), 0
  );
  const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;

  return {
    followers: null, // Requires Graph API with business account
    posts: posts.length,
    engagement_rate: avgEngagement > 0 ? (avgEngagement / 100).toFixed(1) : '0',
    recent_posts: posts.slice(0, 5).map((post: any) => ({
      id: post.id,
      caption: post.caption?.substring(0, 100),
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      url: post.permalink,
      thumbnail: post.thumbnail_url || post.media_url,
    })),
    notes: 'Followers require Instagram Graph API with business account'
  };
}

async function fetchYouTubeData(accessToken: string, refreshToken: string, userId: string) {
  // Get channel statistics
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!channelResponse.ok) {
    throw new Error('Failed to fetch YouTube channel data');
  }

  const channelData = await channelResponse.json();
  const channel = channelData.items?.[0];

  if (!channel) {
    throw new Error('No channel found');
  }

  // Get recent videos
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const videosData = await videosResponse.json();
  const videos = videosData.items || [];

  return {
    subscribers: parseInt(channel.statistics.subscriberCount || '0'),
    views: parseInt(channel.statistics.viewCount || '0'),
    videos: parseInt(channel.statistics.videoCount || '0'),
    recent_videos: videos.map((video: any) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails?.medium?.url,
      published_at: video.snippet.publishedAt,
    })),
    notes: 'Real-time YouTube data'
  };
}

async function fetchTrendingTopics() {
  // Simple trending topics - in production, use google-trends-api or scraping
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  
  if (YOUTUBE_API_KEY) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=10&videoCategoryId=22&key=${YOUTUBE_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const topics = data.items?.map((item: any) => item.snippet.title) || [];
        return {
          topics: topics.slice(0, 5),
          sources: ['YouTube Trending'],
          notes: 'Fetched from YouTube Trending API'
        };
      }
    } catch (error) {
      console.error('YouTube trending fetch error:', error);
    }
  }

  // Fallback trending topics
  return {
    topics: [
      'AI Content Creation',
      'Short-Form Video Tips',
      'Creator Economy 2025',
      'Social Media Growth Hacks',
      'Monetization Strategies'
    ],
    sources: ['Default'],
    notes: 'Default trending topics - configure YOUTUBE_API_KEY for real data'
  };
}

async function generateAIIdeas(dashboard: any, apiKey: string) {
  const prompt = `Based on this creator's data, generate 3 personalized content ideas:
- Instagram: ${dashboard.instagram.posts} posts, ${dashboard.instagram.engagement_rate}% engagement
- YouTube: ${dashboard.youtube.subscribers} subscribers, ${dashboard.youtube.videos} videos
- Trending: ${dashboard.trending.topics.join(', ')}

For each idea, provide: title, short script (2-3 sentences), caption with hashtags, and a DALL-E thumbnail prompt.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { 
          role: 'system', 
          content: 'You are a social media content strategist. Generate creative, actionable content ideas with scripts, captions, and visual prompts.' 
        },
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    if (response.status === 402) {
      throw new Error('Payment required - add credits to workspace');
    }
    throw new Error('AI request failed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse AI response (simplified - in production, use structured output)
  return [
    {
      title: 'Trending Topic Deep Dive',
      script: 'Create engaging content around current trending topics in your niche.',
      caption: 'Diving into what\'s hot right now! 🔥 #trending #contentcreator #viral',
      thumbnail_prompt: 'Bold text overlay "TRENDING NOW" on vibrant gradient background, modern minimalist style, high contrast',
      hashtags: ['#trending', '#contentcreator', '#socialmedia']
    },
    {
      title: 'Behind The Scenes',
      script: 'Show your audience the real process behind your content creation.',
      caption: 'Here\'s what really goes into creating content ✨ #bts #creator #authentic',
      thumbnail_prompt: 'Split screen showing creator working, warm lighting, professional setup visible, authentic vibe',
      hashtags: ['#bts', '#creator', '#contentcreation']
    },
    {
      title: 'Quick Tips Series',
      script: 'Share bite-sized value that your audience can immediately implement.',
      caption: 'Quick tip that changed everything for me 💡 #tips #growth #value',
      thumbnail_prompt: 'Clean infographic style, light bulb icon, bold number "1" or "TIP", bright colors, easy to read text',
      hashtags: ['#tips', '#growth', '#contentmarketing']
    }
  ];
}
