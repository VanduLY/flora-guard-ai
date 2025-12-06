import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  watering: 0.0003, // kg CO2 per liter (water treatment + pumping)
  fertilizer: 0.95, // kg CO2 per kg of fertilizer
  sensor_maintenance: 0.05, // kg CO2 per maintenance session (electricity)
  pruning: 0.01, // kg CO2 per session (minimal tools)
  repotting: 0.15, // kg CO2 per session (soil, pot production)
};

interface ActivityInput {
  activityType: 'watering' | 'fertilizer' | 'sensor_maintenance' | 'pruning' | 'repotting';
  quantity: number;
  unit?: string;
  plantId?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create auth client to verify user
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Create admin client for database operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token from Authorization header and verify it
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { activity, action } = await req.json();

    if (action === 'log') {
      // Calculate emissions for the activity
      const activityData: ActivityInput = activity;
      const emissionFactor = EMISSION_FACTORS[activityData.activityType] || 0;
      const co2Emissions = emissionFactor * activityData.quantity;

      // Insert the activity
      const { data: activityLog, error: insertError } = await supabase
        .from('carbon_activities')
        .insert({
          user_id: user.id,
          plant_id: activityData.plantId || null,
          activity_type: activityData.activityType,
          quantity: activityData.quantity,
          unit: activityData.unit || '',
          co2_emissions: co2Emissions,
          notes: activityData.notes || '',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting activity:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          activity: activityLog,
          co2Emissions,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'summary') {
      // Get summary for a date range
      const { startDate, endDate } = activity;

      const { data: activities, error: fetchError } = await supabase
        .from('carbon_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching activities:', fetchError);
        throw fetchError;
      }

      // Calculate totals by activity type
      const summary = {
        total: 0,
        watering: 0,
        fertilizer: 0,
        sensor_maintenance: 0,
        pruning: 0,
        repotting: 0,
      };

      activities?.forEach((act) => {
        const emissions = Number(act.co2_emissions) || 0;
        summary.total += emissions;
        if (act.activity_type === 'watering') summary.watering += emissions;
        if (act.activity_type === 'fertilizer') summary.fertilizer += emissions;
        if (act.activity_type === 'sensor_maintenance') summary.sensor_maintenance += emissions;
        if (act.activity_type === 'pruning') summary.pruning += emissions;
        if (act.activity_type === 'repotting') summary.repotting += emissions;
      });

      return new Response(
        JSON.stringify({
          success: true,
          summary,
          activities,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-carbon-footprint function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
