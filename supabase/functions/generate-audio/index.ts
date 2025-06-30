/*
  # Generate Audio Edge Function
  
  This function generates audio narration for stories using ElevenLabs via PicaOS
  with graceful error handling and fallback behavior
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AudioRequest {
  text: string;
  language: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { text, language }: AudioRequest = await req.json();

    if (!text || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, language" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Environment variables
    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
    const PICA_ELEVENLABS_CONNECTION_KEY = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY');

    if (!PICA_SECRET_KEY || !PICA_ELEVENLABS_CONNECTION_KEY) {
      console.error('Missing required environment variables for audio generation');
      return new Response(
        JSON.stringify({ 
          error: "Audio generation service not configured",
          userMessage: "Audio generation is currently unavailable. The service is not properly configured.",
          details: "Missing required API keys"
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use a child-friendly voice ID
    const childFriendlyVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - young male voice
    
    const audioHeaders = {
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
      'Content-Type': 'application/json'
    };

    console.log('Attempting to generate audio with PicaOS service...');

    const audioResponse = await fetch(`https://api.picaos.com/v1/passthrough/v1/text-to-speech/${childFriendlyVoiceId}`, {
      method: 'POST',
      headers: audioHeaders,
      body: JSON.stringify({
        text: text,
        voice_id: childFriendlyVoiceId,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      let userMessage = "Audio generation is temporarily unavailable. Please try again later.";
      let errorDetails = `HTTP ${audioResponse.status}: ${audioResponse.statusText}`;
      
      // Handle specific error cases
      if (audioResponse.status === 401) {
        userMessage = "Audio generation service authentication failed. Please contact support to resolve this issue.";
        errorDetails = "Invalid or expired API credentials";
        console.error('Authentication failed with PicaOS service - check API keys');
      } else if (audioResponse.status === 403) {
        userMessage = "Audio generation service access denied. Your account may have reached its usage limit.";
        errorDetails = "Access forbidden - check account status and usage limits";
        console.error('Access forbidden from PicaOS service - check account status');
      } else if (audioResponse.status === 429) {
        userMessage = "Audio generation service is busy. Please wait a moment and try again.";
        errorDetails = "Rate limit exceeded";
        console.error('Rate limit exceeded for PicaOS service');
      } else if (audioResponse.status >= 500) {
        userMessage = "Audio generation service is experiencing technical difficulties. Please try again later.";
        errorDetails = "External service error";
        console.error('PicaOS service internal error:', errorText);
      }
      
      // Try to parse additional error details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail?.message) {
          console.error('PicaOS error details:', errorData.detail.message);
          if (errorData.detail.message.includes("Free Tier usage disabled")) {
            userMessage = "Audio generation service has reached its usage limit. Please contact support or upgrade your account.";
            errorDetails = "Free tier usage limit reached";
          }
        }
      } catch (parseError) {
        // Use default messages if parsing fails
        console.error('Could not parse error response:', parseError);
      }
      
      console.error(`Audio generation failed: ${audioResponse.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: "Audio generation failed",
          userMessage: userMessage,
          details: errorDetails
        }),
        {
          status: 503, // Always return 503 for service unavailable to frontend
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Audio generation successful');

    // Return the audio blob directly
    const audioBlob = await audioResponse.blob();
    
    return new Response(audioBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=story-narration.mp3"
      },
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Audio generation failed", 
        userMessage: "Audio generation is temporarily unavailable due to a technical error. Please try again later.",
        details: error?.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});