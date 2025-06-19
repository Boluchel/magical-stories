/*
  # Generate Story Edge Function
  
  This function handles the complete story generation pipeline:
  1. Generate story text using OpenAI via Pica
  2. Generate illustration using DALL-E via Pica
  3. Generate audio narration using ElevenLabs via Pica
  4. Save the complete story to Supabase
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
    const PICA_OPENAI_CONNECTION_KEY = Deno.env.get('PICA_OPENAI_CONNECTION_KEY');
    const PICA_ELEVENLABS_CONNECTION_KEY = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY');

    if (!PICA_SECRET_KEY || !PICA_OPENAI_CONNECTION_KEY || !PICA_ELEVENLABS_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing API configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Generate story text
    console.log('Generating story text...');
    const storyPrompt = `Write a short, engaging, child-friendly story in ${language} about a ${character} in a ${theme} setting. ${customPrompt}. Make it magical and fun for children aged 5-12. Keep it under 500 words.`;
    
    const storyHeaders: PicaHeaders = {
      'Content-Type': 'application/json',
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_OPENAI_CONNECTION_KEY,
      'x-pica-action-id': 'conn_mod_def::GDzgIxPFYP0::2bW4lQ29TAuimPnr1tYXww'
    };

    const storyResponse = await fetch('https://api.picaos.com/v1/passthrough/completions', {
      method: 'POST',
      headers: storyHeaders,
      body: JSON.stringify({
        model: 'gpt-4o',
        prompt: storyPrompt,
        max_tokens: 512,
        temperature: 0.8
      })
    });

    if (!storyResponse.ok) {
      throw new Error(`Story generation failed: ${storyResponse.statusText}`);
    }

    const storyData = await storyResponse.json();
    const storyText = storyData.choices[0]?.text?.trim() || '';
    
    if (!storyText) {
      throw new Error('No story text generated');
    }

    // Extract title from story text (first line or generate one)
    const storyLines = storyText.split('\n').filter(line => line.trim());
    let title = storyLines[0];
    if (title.length > 100) {
      title = `The ${character}'s ${theme} Adventure`;
    }

    // Step 2: Generate illustration
    console.log('Generating illustration...');
    const imagePrompt = `A colorful, child-friendly cartoon illustration for a children's story about a ${character} in a ${theme} setting. ${customPrompt}. Bright colors, magical atmosphere, suitable for children's book.`;
    
    const imageHeaders: PicaHeaders = {
      'Content-Type': 'application/json',
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_OPENAI_CONNECTION_KEY,
      'x-pica-action-id': 'conn_mod_def::GDzgKm29yzA::qOaVIyE3RWmrUDhvW7VmDw'
    };

    const imageResponse = await fetch('https://api.picaos.com/v1/passthrough/images/generations', {
      method: 'POST',
      headers: imageHeaders,
      body: JSON.stringify({
        prompt: imagePrompt,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });

    let imageUrl = '';
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.data[0]?.url || '';
      console.log('Image generated successfully');
    } else {
      console.warn('Image generation failed, continuing without image');
    }

    // Step 3: Generate audio narration
    console.log('Generating audio narration...');
    
    // First, get available voices
    const voicesHeaders: PicaHeaders = {
      'Content-Type': 'application/json',
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
      'x-pica-action-id': 'conn_mod_def::GCccDGTXyS4::tPfw-4H5Rd-0aLiJH7LymA'
    };

    const voicesResponse = await fetch('https://api.picaos.com/v1/passthrough/v1/voices', {
      method: 'GET',
      headers: voicesHeaders
    });

    let audioUrl = '';
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

        const audioResponse = await fetch(`https://api.picaos.com/v1/passthrough/v1/text-to-speech/${voiceId}`, {
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
        });

        if (audioResponse.ok) {
          // For now, we'll store a placeholder URL since we'd need to upload the audio blob
          // In a production app, you'd upload the audio to Supabase Storage
          audioUrl = 'audio_generated'; // Placeholder
          console.log('Audio generated successfully');
        } else {
          console.warn('Audio generation failed, continuing without audio');
        }
      }
    } else {
      console.warn('Voice listing failed, continuing without audio');
    }

    // Step 4: Save to Supabase
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
        image_url: imageUrl,
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
          imageUrl: imageUrl,
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