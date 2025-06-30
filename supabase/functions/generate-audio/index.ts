/*
  # Generate Audio Edge Function
  
  This function generates audio narration for stories using Tavus API
  with replica creation for consistent voice characteristics
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

// Helper function to create a storytelling replica
async function createStorytellingReplica(apiKey: string, language: string): Promise<string> {
  const replicaHeaders = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  };

  // Create a child-friendly storytelling replica
  const replicaName = `Story Narrator - ${language} - ${Date.now()}`;

  const replicaResponse = await fetch('https://tavusapi.com/v2/replicas', {
    method: 'POST',
    headers: replicaHeaders,
    body: JSON.stringify({
      replica_name: replicaName,
      // Note: You'll need to provide training data for the replica
      // This could be sample audio files or video files
      // For now, we'll create a basic replica configuration
      callback_url: null, // Optional webhook for completion notification
      // training_data: [] // Add training data if available
    })
  });

  if (!replicaResponse.ok) {
    const errorText = await replicaResponse.text();
    throw new Error(`Failed to create replica: ${replicaResponse.status} - ${errorText}`);
  }

  const replicaData = await replicaResponse.json();
  return replicaData.replica_id;
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
    const TAVUS_REPLICA_ID = Deno.env.get('TAVUS_REPLICA_ID'); // Fallback replica ID

    if (!TAVUS_API_KEY) {
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

    let replicaId = TAVUS_REPLICA_ID;

    // Step 1: Create a storytelling replica (if no default replica is configured)
    if (!replicaId) {
      console.log('Creating storytelling replica...');
      
      try {
        replicaId = await createStorytellingReplica(TAVUS_API_KEY, language);
        console.log(`Created replica: ${replicaId}`);
      } catch (error) {
        console.error('Failed to create replica:', error);
        return new Response(
          JSON.stringify({ 
            error: "Failed to create storytelling replica",
            userMessage: "Audio generation setup failed. Please try again later.",
            details: error?.message || 'Unknown error occurred'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.log(`Using configured replica: ${replicaId}`);
    }

    console.log('Generating speech with replica...');

    // Step 2: Generate speech using the replica
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
        replica_id: replicaId,
        speech_name: speechName
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
        } else if (errorData.detail?.includes("replica")) {
          userMessage = "The voice replica is not available. Please try again later.";
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
          replica_id: replicaId,
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