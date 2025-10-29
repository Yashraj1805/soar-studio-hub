# SochBox Production Social Media Integration

## Overview

This is a **production-ready** integration that connects Instagram and YouTube to your SochBox dashboard, providing real-time metrics, trending topics, and AI-powered content suggestions.

## Architecture

**Backend**: Supabase Edge Functions (Deno runtime)  
**Database**: PostgreSQL with Row-Level Security  
**Frontend**: React + TypeScript  
**AI**: Lovable AI Gateway (ChatGPT-equivalent using Google Gemini)  
**Auth**: OAuth 2.0 for Instagram & YouTube

## Database Schema

### `connected_accounts` table
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- platform (text) - 'instagram' or 'youtube'
- account_id (text) - Platform account ID
- account_username (text) - Display name
- access_token (text) - OAuth access token
- refresh_token (text) - OAuth refresh token (YouTube only)
- token_expires_at (timestamptz) - Token expiration
- account_metadata (jsonb) - Additional platform data
- is_active (boolean) - Connection status
- created_at, updated_at (timestamptz)
```

### `dashboard_cache` table
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- platform (text) - 'unified' for aggregated data
- data (jsonb) - Cached dashboard data
- last_synced (timestamptz) - Last sync timestamp
- sync_status (text) - 'success', 'partial', 'failed'
- error_message (text) - Error details if any
- created_at, updated_at (timestamptz)
```

## Environment Variables & Secrets

### Supabase Secrets (Backend - Set via Lovable Cloud Dashboard)
```
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=https://your-project.supabase.co/functions/v1/instagram-callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-project.supabase.co/functions/v1/youtube-callback

YOUTUBE_API_KEY=your_youtube_api_key (optional, for trending)

LOVABLE_API_KEY=auto_configured (Already set up via Lovable AI)
```

### Frontend .env (Already configured)
```
VITE_SUPABASE_URL=https://xangpqeornxcjyiqbtkh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

## Setup Instructions

### 1. Instagram App Setup

**Option A: Basic Display API (Personal accounts only)**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app → Type: "Consumer"
3. Add Instagram Basic Display product
4. Configure OAuth Redirect URIs:
   - `https://xangpqeornxcjyiqbtkh.supabase.co/functions/v1/instagram-callback`
5. Add test users (Instagram accounts)
6. Copy App ID and App Secret to Supabase secrets

**Limitations**: Cannot fetch follower count or insights (likes, comments only)

**Option B: Instagram Graph API (Business accounts - RECOMMENDED)**
1. Convert Instagram account to Business/Creator account
2. Link to Facebook Page
3. In Facebook App, add Instagram Graph API
4. Request these permissions (requires App Review):
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_read_engagement`
5. After approval, you can fetch:
   - Follower count
   - Reach & impressions
   - Profile insights
   - Media insights

**Current Implementation**: Uses Basic Display API. To upgrade:
- Update `dashboard-data` edge function to use Graph API endpoints
- Change base URL to `https://graph.facebook.com/v18.0/`
- Use `/me/insights` for metrics

### 2. YouTube Data API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 Credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://xangpqeornxcjyiqbtkh.supabase.co/functions/v1/youtube-callback`
5. Copy Client ID and Client Secret to Supabase secrets
6. (Optional) Create API Key for non-authenticated trending requests

**Scopes used**:
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/youtube.force-ssl`
- `https://www.googleapis.com/auth/userinfo.profile`

### 3. Configure Secrets in Lovable Cloud

**IMPORTANT**: You need to add these secrets to your Supabase project:

1. Open your Lovable Cloud dashboard:
   - Click "View Backend" in your project
   - Navigate to Settings → Secrets

2. Add the following secrets:
   ```
   INSTAGRAM_APP_ID
   INSTAGRAM_APP_SECRET
   INSTAGRAM_REDIRECT_URI
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   GOOGLE_REDIRECT_URI
   YOUTUBE_API_KEY (optional)
   ```

3. The `LOVABLE_API_KEY` is already configured automatically

## API Endpoints

### OAuth Flows

#### Instagram
- `GET /functions/v1/instagram-auth` - Initiates OAuth (returns auth URL)
- `GET /functions/v1/instagram-callback` - OAuth callback handler

#### YouTube
- `GET /functions/v1/youtube-auth` - Initiates OAuth (returns auth URL)
- `GET /functions/v1/youtube-callback` - OAuth callback handler

### Data Endpoints

#### `GET /functions/v1/dashboard-data`
**Returns**: Unified dashboard JSON

**Response Schema**:
```json
{
  "fallback": false,
  "cached": false,
  "timestamp": "2025-10-29T...",
  "instagram": {
    "connected": true,
    "followers": 12500,
    "posts": 145,
    "engagement_rate": "8.4",
    "recent_posts": [...],
    "notes": "..."
  },
  "youtube": {
    "connected": true,
    "subscribers": 8500,
    "views": 145000,
    "videos": 67,
    "recent_videos": [...],
    "notes": "..."
  },
  "trending": {
    "topics": ["AI Tools", "Content Creation", ...],
    "sources": ["YouTube Trending"],
    "notes": "..."
  },
  "ai": {
    "enabled": true,
    "ideas": [
      {
        "title": "...",
        "script": "...",
        "caption": "...",
        "thumbnail_prompt": "...",
        "hashtags": [...]
      }
    ],
    "message": "AI suggestions generated"
  },
  "errors": []
}
```

#### `POST /functions/v1/sync-data`
**Auth**: Required  
**Returns**: Refreshed dashboard data

**Response**:
```json
{
  "message": "Data synced successfully",
  "data": { ... },
  "synced_at": "2025-10-29T..."
}
```

## Fallback & Error Handling

### Graceful Degradation
- **No API keys**: Returns default/static data with `fallback: true`
- **API failures**: Individual platform errors are logged in `errors` array
- **Token expiration**: Attempts refresh (YouTube), then falls back
- **Rate limits**: Retries with exponential backoff, then uses cache

### Cache Strategy
- **Duration**: 15 minutes
- **Storage**: PostgreSQL `dashboard_cache` table
- **Invalidation**: Manual via sync endpoint or automatic on expiration

### Error Messages
All errors are user-friendly and include:
- Platform context (Instagram, YouTube, AI)
- Actionable instructions (e.g., "Reconnect account")
- Never exposes secrets or internal details

## AI Enrichment

**Provider**: Lovable AI Gateway (Google Gemini 2.5 Flash)  
**Fallback**: Uses ChatGPT-compatible API via Lovable AI  
**Model**: `google/gemini-2.5-flash`

**AI Features**:
1. **Content Ideas**: 3 personalized suggestions based on:
   - Platform metrics (engagement, subscriber count)
   - Trending topics
   - Creator's niche

2. **Thumbnail Prompts**: DALL-E-style prompts for each idea
   - Example: "Bold text overlay 'TRENDING NOW' on vibrant gradient background, modern minimalist style, high contrast"

3. **Captions & Scripts**: Ready-to-use content with hashtags

**Rate Limits**:
- Lovable AI has workspace-level rate limits
- 429 errors are caught and displayed to users
- 402 errors prompt credit top-up

**To Use OpenAI Directly** (if needed):
1. Add `OPENAI_API_KEY` to Supabase secrets
2. Update `dashboard-data` edge function to use OpenAI endpoint
3. Change model to `gpt-4o-mini` or `gpt-5-mini-2025-08-07`

## Frontend Components

### `ConnectPlatforms.tsx`
- OAuth connection UI for Instagram & YouTube
- Shows connection status with badges
- Handles OAuth popup flow and callbacks
- Persists connections to `connected_accounts` table

### `Dashboard.tsx` (Enhanced)
- Displays unified metrics from all platforms
- Real-time sync button
- Trending topics display
- AI-powered content idea cards
- Fallback state indicator (yellow banner)
- Platform-specific badges on stat cards

## Testing Locally

1. **Start dev server**: `npm run dev`
2. **Test OAuth flows**:
   - Click "Connect Instagram" or "Connect YouTube"
   - Authorize in popup
   - Check database for new `connected_accounts` record
3. **Test dashboard data**:
   - Click "Sync Data" button
   - Verify metrics update
   - Check browser console for any errors
4. **Test fallbacks**:
   - Remove secrets from Supabase
   - Verify default data is shown with fallback banner

## Production Deployment

**Automatic**: Edge functions deploy automatically with your Lovable project.

**Manual Deploy** (if needed):
```bash
supabase functions deploy instagram-auth
supabase functions deploy instagram-callback
supabase functions deploy youtube-auth
supabase functions deploy youtube-callback
supabase functions deploy dashboard-data
supabase functions deploy sync-data
```

## Security Notes

### ✅ Implemented
- OAuth 2.0 for all platform connections
- Row-Level Security (RLS) on all tables
- Secrets stored in Supabase Secrets (never in code)
- CORS headers on all edge functions
- Token expiration tracking
- JWT verification on sync endpoint

### ⚠️ Production Checklist
- [ ] Enable HTTPS for custom domains
- [ ] Set up monitoring for API rate limits
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Implement refresh token rotation for YouTube
- [ ] Add rate limiting on sync endpoint
- [ ] Enable Supabase database backups
- [ ] Review and minimize OAuth scopes
- [ ] Set up alerts for token expiration

## Rate Limits & Quotas

### Instagram Basic Display
- **Limit**: 200 requests/hour per user
- **Token lifetime**: 60 days (long-lived), then requires re-auth

### YouTube Data API
- **Default quota**: 10,000 units/day
- **Cost**: 1 unit per read, 50 units per write
- **Refresh tokens**: Valid indefinitely until revoked

### Lovable AI
- **Rate limit**: Per-workspace (see Lovable docs)
- **Free tier**: Limited requests/month
- **Errors**: 429 (rate limit), 402 (payment required)

## Trending Topics Implementation

**Current**: Falls back to default topics + optional YouTube Trending API

**Production Options**:
1. **Google Trends API** (requires `google-trends-api` npm package)
   ```typescript
   import googleTrends from 'google-trends-api';
   const data = await googleTrends.dailyTrends({ geo: 'US' });
   ```

2. **Web Scraping** (use Puppeteer or Cheerio)
   - Scrape YouTube Trending: `https://www.youtube.com/feed/trending`
   - Scrape X/Twitter Trending (requires auth)
   - Respect `robots.txt` and rate limits

3. **Paid APIs**
   - RapidAPI trending endpoints
   - NewsAPI for news trends
   - Reddit API for subreddit trends

**Recommendation**: Use YouTube Trending API (requires `YOUTUBE_API_KEY`) for reliable, legal data.

## Troubleshooting

### "Showing fallback/default data" banner
- **Cause**: No API keys configured OR platform fetch failed
- **Fix**: Add required secrets in Lovable Cloud dashboard

### Instagram: "Followers require business account"
- **Cause**: Using Basic Display API with personal account
- **Fix**: Convert to Business account + use Graph API (requires app review)

### YouTube: "No channel found"
- **Cause**: Google account doesn't have a YouTube channel
- **Fix**: Create a YouTube channel first, then reconnect

### AI: "AI unavailable" message
- **Cause**: LOVABLE_API_KEY missing or rate limited
- **Fix**: Check Lovable AI status in dashboard, top up credits if needed

### OAuth popup blocked
- **Cause**: Browser popup blocker
- **Fix**: Allow popups for your domain

## File Structure

```
supabase/
├── functions/
│   ├── instagram-auth/index.ts       # Instagram OAuth init
│   ├── instagram-callback/index.ts   # Instagram OAuth callback
│   ├── youtube-auth/index.ts         # YouTube OAuth init
│   ├── youtube-callback/index.ts     # YouTube OAuth callback
│   ├── dashboard-data/index.ts       # Unified dashboard endpoint
│   └── sync-data/index.ts            # Force refresh endpoint
└── config.toml                       # Edge function config

src/
├── components/
│   └── ConnectPlatforms.tsx          # OAuth connection UI
└── pages/
    └── Dashboard.tsx                 # Enhanced dashboard with real data
```

## Next Steps

1. **Add secrets** to Supabase via Lovable Cloud dashboard
2. **Create Instagram app** and configure OAuth
3. **Create YouTube OAuth credentials** in Google Cloud
4. **Test OAuth flows** with your accounts
5. **Monitor rate limits** and add error tracking
6. **(Optional) Implement advanced trending scraper**
7. **(Optional) Upgrade to Instagram Graph API** for business insights

## Support

- **Lovable Docs**: https://docs.lovable.dev
- **Supabase Docs**: https://supabase.com/docs
- **Instagram API**: https://developers.facebook.com/docs/instagram-basic-display-api
- **YouTube API**: https://developers.google.com/youtube/v3

---

**Built with**: Lovable Cloud, Supabase Edge Functions, React, TypeScript  
**AI Provider**: Lovable AI Gateway (Google Gemini 2.5 Flash)  
**Architecture**: Production-ready with graceful fallbacks and comprehensive error handling
