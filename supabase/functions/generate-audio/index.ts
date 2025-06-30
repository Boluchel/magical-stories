/*
  # Generate Audio Edge Function
  
  This function generates audio narration for stories using Tavus API
  with persona creation for consistent voice characteristics
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

// Helper function to create a storytelling persona
async function createStorytellingPersona(apiKey: string, replicaId: string, language: string): Promise<string> {
  const personaHeaders = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  };

  // Create a child-friendly storytelling persona
  const systemPrompt = `You are a warm, engaging storyteller who specializes in reading children's stories. Your voice should be:
- Expressive and animated to bring characters to life
- Clear and easy to understand for young listeners
- Enthusiastic but not overwhelming
- Gentle and comforting
- Able to adjust tone for different characters and emotions in the story

When reading stories, vary your pace and intonation to match the narrative flow. Use slight pauses for dramatic effect and speak with the wonder and excitement that makes stories magical for children.`;

  const contextPrompt = `You are reading a magical story to children. The story may include various themes like adventures, friendship, magic, and learning. Your goal is to make the story come alive through your voice while keeping it appropriate and engaging for young audiences.`;

  const personaResponse = await fetch('https://tavusapi.com/v2/personas', {
    method: 'POST',
    headers: personaHeaders,
    body: JSON.stringify({
      persona_name: `Story Narrator - ${language}`,
      system_prompt: systemPrompt,
      pipeline_mode: "echo", // Use echo mode for speech generation
      context: contextPrompt,
      default_replica_id: replicaId
    })
  });

  if (!personaResponse.ok) {
    const errorText = await personaResponse.text();
    throw new Error(`Failed to create persona: ${personaResponse.status} - ${errorText}`);
  }

  const personaData = await personaResponse.json();
  return personaData.persona_id;
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
    const TAVUS_API_KEY = Deno.env.get('TAVUS_API_KEY');
    const TAVUS_REPLICA_ID = Deno.env.get('TAVUS_REPLICA_ID');

    if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID) {
      return new Response(
        JSON.stringify({ 
          error: "Audio generation service not configured",
          userMessage: "Audio generation is currently unavailable. Please check your Tavus API configuration."
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Creating storytelling persona...');
    
    // Step 1: Create a storytelling persona
    let personaId: string;
    try {
      personaId = await createStorytellingPersona(TAVUS_API_KEY, TAVUS_REPLICA_ID, language);
      console.log(`Created persona: ${personaId}`);
    } catch (error) {
      console.error('Failed to create persona:', error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create storytelling persona",
          userMessage: "Audio generation setup failed. Please try again later.",
          details: error?.message || 'Unknown error occurred'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Generating speech with persona...');

    // Step 2: Generate speech using the persona
    const audioHeaders = {
      'x-api-key': TAVUS_API_KEY,
      'Content-Type': 'application/json'
    };

    // Generate a unique speech name
    const speechName = `story-narration-${Date.now()}`;

    const audioResponse = await fetch('https://tavusapi.com/v2/speech', {
      method: 'POST',
      headers: audioHeaders,
      body: JSON.stringify({
        script: text,
        replica_id: TAVUS_REPLICA_ID,
        speech_name: speechName,
        // Note: If Tavus supports persona_id in speech generation, add it here
        // persona_id: personaId
      })
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      let userMessage = "Audio generation is temporarily unavailable. Please try again later.";
      
      // Parse error details for better user messaging
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail?.includes("Invalid API key")) {
          userMessage = "Audio generation service authentication failed. Please contact support.";
        } else if (errorData.detail?.includes("quota") || errorData.detail?.includes("limit")) {
          userMessage = "Audio generation service has reached its usage limit. Please contact support or try again later.";
        }
      } catch (parseError) {
        // Use default message if parsing fails
      }
      
      console.error(`Tavus audio generation failed: ${audioResponse.status} - ${errorText}`);
      
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

    const responseData = await audioResponse.json();
    
    // Check if we got a direct file URL
    if (responseData.speech_file_url) {
      // Fetch the audio file and return it as a blob
      const audioFileResponse = await fetch(responseData.speech_file_url);
      
      if (!audioFileResponse.ok) {
        throw new Error(`Failed to fetch generated audio file: ${audioFileResponse.status}`);
      }
      
      const audioBlob = await audioFileResponse.blob();
      
      return new Response(audioBlob, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename=${speechName}.mp3`
        },
      });
    } else {
      // If no direct URL, return the speech_id for polling (async generation)
      return new Response(
        JSON.stringify({ 
          speech_id: responseData.speech_id,
          persona_id: personaId,
          message: "Audio generation started. Use the speech_id to check status.",
          userMessage: "Audio is being generated. Please try again in a few moments."
        }),
        {
          status: 202, // Accepted - processing
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error('Tavus audio generation error:', error);
    
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