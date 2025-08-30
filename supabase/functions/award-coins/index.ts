import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

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
    const { userId, amount, reason } = await req.json();

    console.log('Awarding coins:', { userId, amount, reason });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has a coins record
    const { data: existingCoins, error: checkError } = await supabase
      .from('coins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing coins: ${checkError.message}`);
    }

    if (existingCoins) {
      // Update existing coins
      const { error: updateError } = await supabase
        .from('coins')
        .update({ 
          balance: existingCoins.balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Failed to update coins: ${updateError.message}`);
      }
    } else {
      // Create new coins record
      const { error: insertError } = await supabase
        .from('coins')
        .insert({
          user_id: userId,
          balance: amount
        });

      if (insertError) {
        throw new Error(`Failed to create coins record: ${insertError.message}`);
      }
    }

    console.log(`Successfully awarded ${amount} coins to user ${userId} for: ${reason}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Awarded ${amount} coins for ${reason}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in award-coins function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});