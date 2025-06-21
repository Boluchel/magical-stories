/*
  # Generate Story Edge Function
  
  This function handles the story generation pipeline:
  1. Generate story text using Gemini via Pica
  2. Generate audio narration using ElevenLabs via Pica
  3. Save the complete story to Supabase
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface StoryRequest {
  theme: string;
  character: string;
  language: string;
  customPrompt?: string;
}

interface PicaHeaders {
  'x-pica-secret': string;
  'x-pica-connection-key': string;
  'x-pica-action-id'?: string;
  'Content-Type': string;
  'Accept'?: string;
}

// Helper function to safely extract error message from response
function getErrorMessage(errorData: any): string {
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  if (typeof errorData === 'object' && errorData !== null) {
    // Try common error message properties
    if (errorData.error) {
      return typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
    }
    if (errorData.message) {
      return errorData.message;
    }
    if (errorData.details) {
      return errorData.details;
    }
    if (errorData.error_description) {
      return errorData.error_description;
    }
    
    // If none of the common properties exist, stringify the whole object
    return JSON.stringify(errorData);
  }
  
  return 'Unknown error';
}

// Retry mechanism with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a rate limit error (429) or server error (5xx)
      if (error instanceof Response) {
        // Don't retry on payment required (402) - this is a billing issue
        if (error.status === 402) {
          throw new Error("AI service billing issue: Please check your PicaOS account credits or subscription status.");
        }
        
        if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Attempt ${attempt + 1} failed with status ${error.status}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }
      
      // For non-retryable errors or max retries reached, throw immediately
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }
  
  throw lastError!;
}

// Enhanced fetch with retry logic
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);
    
    // If payment required, throw a specific error
    if (response.status === 402) {
      throw new Error("AI service billing issue: Please check your PicaOS account credits or subscription status.");
    }
    
    // If rate limited or server error, throw the response to trigger retry
    if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
      throw response;
    }
    
    return response;
  }, maxRetries);
}

// Generate a mock story for development/testing when API keys are missing
function generateMockStory(theme: string, character: string, language: string, customPrompt: string): string {
  const storyTemplates = {
    english: {
      dragons: `Once upon a time, there was a brave ${character} who discovered a friendly dragon in an enchanted forest. Together, they went on magical adventures and learned the importance of friendship. ${customPrompt ? `The adventure included: ${customPrompt}` : ''} The end.`,
      space: `In a galaxy far away, a curious ${character} built a rocket ship and traveled to distant planets. They met alien friends and discovered amazing new worlds filled with wonder. ${customPrompt ? `During their journey: ${customPrompt}` : ''} They returned home with incredible stories to tell.`,
      fairies: `In a magical garden, a kind ${character} met a group of tiny fairies who needed help saving their flower kingdom. With courage and kindness, they worked together to restore the garden's magic. ${customPrompt ? `Their quest involved: ${customPrompt}` : ''} Everyone lived happily ever after.`,
      pirates: `On the seven seas, a daring ${character} joined a crew of friendly pirates searching for treasure. They sailed through storms and solved riddles to find the greatest treasure of all - friendship. ${customPrompt ? `Their adventure included: ${customPrompt}` : ''} They shared their treasure with everyone.`,
      animals: `In a peaceful forest, a gentle ${character} became friends with all the woodland animals. They helped solve problems and learned that working together makes everything better. ${customPrompt ? `Their story featured: ${customPrompt}` : ''} The forest was filled with joy and laughter.`,
      underwater: `Deep beneath the ocean waves, an adventurous ${character} discovered a beautiful underwater kingdom. They swam with dolphins and helped protect the coral reef from danger. ${customPrompt ? `Their underwater adventure: ${customPrompt}` : ''} The sea creatures celebrated their new hero.`
    }
  };

  const template = storyTemplates.english[theme as keyof typeof storyTemplates.english] || 
    `A wonderful ${character} had an amazing ${theme} adventure filled with excitement and discovery. ${customPrompt || ''} It was a story they would never forget.`;

  return template;
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { theme, character, language, customPrompt = '' }: StoryRequest = await req.json();

    if (!theme || !character || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: theme, character, language" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Environment variables
    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
    const PICA_GEMINI_CONNECTION_KEY = Deno.env.get('PICA_GEMINI_CONNECTION_KEY');
    const PICA_ELEVENLABS_CONNECTION_KEY = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY');

    // Check if API keys are configured
    const hasApiKeys = PICA_SECRET_KEY && PICA_GEMINI_CONNECTION_KEY && PICA_ELEVENLABS_CONNECTION_KEY;

    let storyText: string;
    let title: string;
    let audioUrl = '';

    if (!hasApiKeys) {
      console.warn('API keys not configured, using mock story generation');
      
      // Generate mock story for development/testing
      storyText = generateMockStory(theme, character, language, customPrompt);
      title = `The ${character}'s ${theme} Adventure`;
      
      // Return early with mock data and helpful error message
      return new Response(
        JSON.stringify({
          success: true,
          story: {
            id: crypto.randomUUID(),
            title: title,
            theme: theme,
            character: character,
            language: language,
            customPrompt: customPrompt,
            storyText: storyText,
            imageUrl: null,
            audioUrl: null,
            createdAt: new Date().toISOString()
          },
          warning: "This is a demo story. To generate AI-powered stories, please configure the PicaOS API keys in your Supabase Edge Function settings."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Generate story text using Gemini with new API format
    console.log('Generating story text with Gemini...');
    
    const storyHeaders: PicaHeaders = {
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_GEMINI_CONNECTION_KEY,
      'Content-Type': 'application/json'
    };

    const systemPrompt = `You are a friendly AI that writes short, engaging, and age-appropriate stories for children. The story should be in ${language} and feature a ${character} in a ${theme} setting. ${customPrompt || ''}`;
    const userPrompt = `Please write a story for a child in ${language} about a ${character} in a ${theme} adventure. ${customPrompt || ''}`;

    const storyResponse = await fetchWithRetry('https://api.picaos.com/v1/passthrough/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: storyHeaders,
      body: JSON.stringify({
        contents: [
          { parts: [{ text: systemPrompt }] },
          { parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.8
        }
      })
    }, 3);

    if (!storyResponse.ok) {
      let errorMessage = `HTTP ${storyResponse.status}: ${storyResponse.statusText}`;
      
      try {
        const errorData = await storyResponse.json();
        const detailedError = getErrorMessage(errorData);
        errorMessage += ` - ${detailedError}`;
      } catch (parseError) {
        // If we can't parse the JSON, try to get text
        try {
          const errorText = await storyResponse.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (textError) {
          // If we can't get text either, just use the status
          errorMessage += ' - Unable to parse error details';
        }
      }
      
      // Handle specific error cases
      if (storyResponse.status === 402) {
        throw new Error("AI service billing issue: Please check your PicaOS account credits or subscription status.");
      }
      
      throw new Error(`Story generation failed: ${errorMessage}`);
    }

    const storyData = await storyResponse.json();
    storyText = storyData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    if (!storyText) {
      throw new Error('No story text generated from API response');
    }

    // Extract title from story text (first line or generate one)
    const storyLines = storyText.split('\n').filter(line => line.trim());
    title = storyLines[0];
    if (title.length > 100 || title.includes('.') || title.includes('Once upon')) {
      title = `The ${character}'s ${theme} Adventure`;
    }

    // Step 2: Generate audio narration with ElevenLabs
    console.log('Generating audio narration...');
    
    try {
      // Map language to language code
      const languageCodes: { [key: string]: string } = {
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt'
      };

      const languageCode = languageCodes[language.toLowerCase()] || 'en';
      
      // Use a default child-friendly voice ID (you may need to adjust this)
      // Common ElevenLabs child-friendly voice IDs:
      const childFriendlyVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - young male voice
      
      const audioHeaders: PicaHeaders = {
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
        'Content-Type': 'application/json'
      };

      const audioResponse = await fetchWithRetry(`https://api.picaos.com/v1/passthrough/v1/text-to-speech/${childFriendlyVoiceId}`, {
        method: 'POST',
        headers: audioHeaders,
        body: JSON.stringify({
          text: storyText,
          voice_id: childFriendlyVoiceId,
          model_id: 'eleven_monolingual_v1',
          language_code: languageCode,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      }, 2);

      if (audioResponse.ok) {
        // For now, we'll store a placeholder URL since we'd need to upload the audio blob
        // In a production app, you'd upload the audio to Supabase Storage
        audioUrl = 'audio_generated'; // Placeholder
        console.log('Audio generated successfully');
      } else {
        console.warn('Audio generation failed, continuing without audio');
      }
    } catch (error) {
      console.warn('Audio generation failed, continuing without audio:', error?.message || error);
      // Don't fail the entire request if audio generation fails
    }

    // Step 3: Save to Supabase
    console.log('Saving story to database...');
    
    // Get user ID from JWT token
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Insert story into database
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: title,
        theme: theme,
        character: character,
        language: language,
        custom_prompt: customPrompt,
        story_text: storyText,
        image_url: null, // No image generation
        audio_url: audioUrl,
        user_id: null // Will be set by RLS policy
      })
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Database insert failed: ${errorText}`);
    }

    const savedStory = await insertResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        story: {
          id: savedStory[0]?.id,
          title: title,
          theme: theme,
          character: character,
          language: language,
          customPrompt: customPrompt,
          storyText: storyText,
          imageUrl: null, // No image
          audioUrl: audioUrl,
          createdAt: savedStory[0]?.created_at
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Story generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Story generation failed", 
        details: error?.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});