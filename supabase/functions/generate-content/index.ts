import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, input } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Define system prompts for each type
    const systemPrompts = {
      idea: "You are a creative content strategist. Generate 5 unique, engaging content ideas based on the user's niche. Format each idea as a bullet point with an emoji. Make them specific, actionable, and trendy.",
      caption: "You are a social media expert. Create an engaging caption and video script based on the user's concept. Include: an attention-grabbing hook, 3 key points with bullet points, relevant hashtags, and a call-to-action. Use emojis strategically. Make it conversational and engaging.",
      thumbnail: "You are a visual design expert specializing in clickable thumbnails. Create a detailed thumbnail prompt that includes: visual elements, color scheme, text placement, facial expressions, layout suggestions, and style notes. Make it specific and actionable for designers."
    };

    const systemPrompt = systemPrompts[type as keyof typeof systemPrompts] || systemPrompts.idea;

    // Call Lovable AI Gateway (ChatGPT-like model)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast, balanced AI model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate content" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
