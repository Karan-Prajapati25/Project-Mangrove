import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, incident_type, location } = await req.json();

    console.log('Validating report:', { title, incident_type });

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        isValid: true, 
        reason: 'AI validation unavailable - manual review required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `
You are an environmental expert tasked with validating reports about mangrove ecosystems and environmental incidents. 

Analyze the following report and determine:
1. Is this a legitimate environmental report? (not spam, joke, or unrelated content)
2. Does it relate to mangrove ecosystems or environmental conservation?
3. Is the description coherent and plausible?
4. What is the severity level of this incident?

Consider these factors:
- Relevance to environmental/conservation topics
- Plausibility of the described incident
- Quality and coherence of the description
- Whether it appears to be spam or nonsensical content
- Impact level and urgency of the environmental threat

For severity, use these levels:
- "Low": Minor incidents with minimal immediate impact
- "Medium": Moderate incidents requiring attention but not urgent
- "High": Serious incidents with significant environmental impact
- "Critical": Urgent threats requiring immediate action

Report Details:
- Title: ${title}
- Description: ${description}
- Incident Type: ${incident_type}
- Location: ${location}

Respond with a JSON object containing:
- "isValid": boolean (true if legitimate, false if not)
- "severity": string (one of: "Low", "Medium", "High", "Critical")
- "reason": string (brief explanation of your decision)
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert environmental incident validator. Respond only with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        isValid: true, 
        reason: 'AI validation error - manual review required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response:', aiResponse);

    try {
      const validation = JSON.parse(aiResponse);
      
      return new Response(JSON.stringify({
        isValid: validation.isValid,
        severity: validation.severity || 'Medium',
        reason: validation.reason || 'AI validation completed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ 
        isValid: true, 
        reason: 'AI validation parse error - manual review required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in validate-report function:', error);
    return new Response(JSON.stringify({ 
      isValid: true, 
      reason: 'Validation error - manual review required' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});