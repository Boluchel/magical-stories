/*
  # Generate Story Edge Function
  
  This function handles the story generation pipeline:
  1. Generate story text using DeepSeek via Pica
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
  'Content-Type': string;
  'x-pica-secret': string;
  'x-pica-connection-key': string;
  'x-pica-action-id': string;
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
    
    // If rate limited or server error, throw the response to trigger retry
    if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
      throw response;
    }
    
    return response;
  }, maxRetries);
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
    const PICA_DEEP_SEEK_CONNECTION_KEY = Deno.env.get('PICA_DEEP_SEEK_CONNECTION_KEY');
    const PICA_ELEVENLABS_CONNECTION_KEY = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY');

    if (!PICA_SECRET_KEY || !PICA_DEEP_SEEK_CONNECTION_KEY || !PICA_ELEVENLABS_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing API configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Generate story text using DeepSeek with retry mechanism
    console.log('Generating story text with DeepSeek...');
    
    const storyHeaders: PicaHeaders = {
      'Content-Type': 'application/json',
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_DEEP_SEEK_CONNECTION_KEY,
      'x-pica-action-id': 'conn_mod_def::GEYc3afgC_A::5nh1q4r1TXmnKpPfurNEIA'
    };

    const userPrompt = `Write a short, child-friendly story in ${language} about a ${character} in a ${theme} setting. ${customPrompt}. Make it magical and fun for children aged 4-10. Keep it under 500 words.`;

    const storyResponse = await fetchWithRetry('https://api.picaos.com/v1/passthrough/chat/completions', {
      method: 'POST',
      headers: storyHeaders,
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You are a friendly, creative assistant that writes short, child-friendly stories for a multilingual storytelling app. Always keep the language and content appropriate for children ages 4-10.' 
          },
          { 
            role: 'user', 
            content: userPrompt 
          }
        ],
        model: 'deepseek-chat',
        max_tokens: 512,
        temperature: 0.8
      })
    }, 3);

    if (!storyResponse.ok) {
      throw new Error(`Story generation failed: ${storyResponse.statusText}`);
    }

    const storyData = await storyResponse.json();
    const storyText = storyData.choices[0]?.message?.content?.trim() || '';
    
    if (!storyText) {
      throw new Error('No story text generated');
    }

    // Extract title from story text (first line or generate one)
    const storyLines = storyText.split('\n').filter(line => line.trim());
    let title = storyLines[0];
    if (title.length > 100 || title.includes('.') || title.includes('Once upon')) {
      title = `The ${character}'s ${theme} Adventure`;
    }

    // Step 2: Generate audio narration with retry mechanism
    console.log('Generating audio narration...');
    
    let audioUrl = '';
    try {
      // First, get available voices
      const voicesHeaders: PicaHeaders = {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCccDGTXyS4::tPfw-4H5Rd-0aLiJH7LymA'
      };

      const voicesResponse = await fetchWithRetry('https://api.picaos.com/v1/passthrough/v1/voices', {
        method: 'GET',
        headers: voicesHeaders
      }, 2);

      if (voicesResponse.ok) {
        const voicesData = await voicesResponse.json();
        
        // Find a suitable child-friendly voice
        const childVoice = voicesData.voices?.find((voice: any) => 
          voice.labels?.age === 'young' || 
          voice.labels?.use_case?.includes('narration') ||
          voice.name?.toLowerCase().includes('child')
        );
        
        const voiceId = childVoice?.voice_id || voicesData.voices?.[0]?.voice_id;
        
        if (voiceId) {
          // Generate audio
          const audioHeaders: PicaHeaders = {
            'Content-Type': 'application/json',
            'x-pica-secret': PICA_SECRET_KEY,
            'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
            'x-pica-action-id': 'conn_mod_def::GCccCs7_t7Q::QpqEyuj2S4W481S8S1asbA'
          };

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

          const audioResponse = await fetchWithRetry(`https://api.picaos.com/v1/passthrough/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: audioHeaders,
            body: JSON.stringify({
              text: storyText,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.7,
                style: 0.3,
                use_speaker_boost: true
              },
              language_code: languageCode,
              output_format: 'mp3_44100_128'
            })
          }, 2);

          if (audioResponse.ok) {
            // For now, we'll store a placeholder URL since we'd need to upload the audio blob
            // In a production app, you'd upload the audio to Supabase Storage
            audioUrl = 'audio_generated'; // Placeholder
            console.log('Audio generated successfully');
          }
        }
      }
    } catch (error) {
      console.warn('Audio generation failed, continuing without audio:', error.message);
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
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});