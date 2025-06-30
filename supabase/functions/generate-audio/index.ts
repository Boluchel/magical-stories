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
      return new Response(
        JSON.stringify({ 
          error: "Audio generation service not configured",
          userMessage: "Audio generation is currently unavailable. Please check your API configuration."
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
      
      // Parse error details for better user messaging
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail?.message?.includes("Free Tier usage disabled")) {
          userMessage = "Audio generation service has reached its usage limit. Please contact support or try again later.";
        } else if (errorData.detail?.message?.includes("Unauthorized")) {
          userMessage = "Audio generation service authentication failed. Please contact support.";
        }
      } catch (parseError) {
        // Use default message if parsing fails
      }
      
      console.error(`Audio generation failed: ${audioResponse.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: "Audio generation failed",
          userMessage: userMessage,
          details: `HTTP ${audioResponse.status}: ${audioResponse.statusText}`
        }),
        {
          status: audioResponse.status === 401 ? 503 : audioResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
        userMessage: "Audio generation is temporarily unavailable. Please try again later.",
        details: error?.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});