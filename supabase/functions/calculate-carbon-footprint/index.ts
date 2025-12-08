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

const VALID_ACTIVITY_TYPES = ['watering', 'fertilizer', 'sensor_maintenance', 'pruning', 'repotting'] as const;
type ActivityType = typeof VALID_ACTIVITY_TYPES[number];

interface ActivityInput {
  activityType: ActivityType;
  quantity: number;
  unit?: string;
  plantId?: string;
  notes?: string;
}

// Input validation
function validateActivityInput(activity: unknown): { valid: boolean; error?: string; data?: ActivityInput } {
  if (!activity || typeof activity !== 'object') {
    return { valid: false, error: 'Activity data is required' };
  }

  const act = activity as Record<string, unknown>;
  
  // Validate activityType
  if (!act.activityType || typeof act.activityType !== 'string') {
    return { valid: false, error: 'Activity type is required' };
  }
  if (!VALID_ACTIVITY_TYPES.includes(act.activityType as ActivityType)) {
    return { valid: false, error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}` };
  }

  // Validate quantity
  if (act.quantity === undefined || typeof act.quantity !== 'number') {
    return { valid: false, error: 'Quantity must be a number' };
  }
  if (act.quantity <= 0 || act.quantity > 10000) {
    return { valid: false, error: 'Quantity must be between 0 and 10000' };
  }

  // Validate optional fields
  if (act.unit !== undefined && (typeof act.unit !== 'string' || act.unit.length > 50)) {
    return { valid: false, error: 'Unit must be a string with max 50 characters' };
  }
  if (act.plantId !== undefined && (typeof act.plantId !== 'string' || act.plantId.length > 100)) {
    return { valid: false, error: 'Plant ID must be a valid string' };
  }
  if (act.notes !== undefined && (typeof act.notes !== 'string' || act.notes.length > 1000)) {
    return { valid: false, error: 'Notes must be a string with max 1000 characters' };
  }

  return {
    valid: true,
    data: {
      activityType: act.activityType as ActivityType,
      quantity: act.quantity as number,
      unit: act.unit as string | undefined,
      plantId: act.plantId as string | undefined,
      notes: act.notes as string | undefined,
    }
  };
}

function validateDateRange(startDate: unknown, endDate: unknown): { valid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Start date and end date are required' };
  }
  
  if (typeof startDate !== 'string' || typeof endDate !== 'string') {
    return { valid: false, error: 'Dates must be strings in ISO format' };
  }

  // Validate ISO date format
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format. Use ISO 8601 format' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true };
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

    const body = await req.json();
    const { activity, action } = body;

    // Validate action
    if (!action || !['log', 'summary'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action. Must be "log" or "summary"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'log') {
      // Validate activity input
      const validation = validateActivityInput(activity);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const activityData = validation.data!;
      const emissionFactor = EMISSION_FACTORS[activityData.activityType] || 0;
      const co2Emissions = emissionFactor * activityData.quantity;

      // Verify plant_id exists in user_plants (foreign key constraint)
      let validPlantId: string | null = null;
      if (activityData.plantId) {
        const { data: plant } = await supabase
          .from('user_plants')
          .select('id')
          .eq('id', activityData.plantId)
          .single();
        
        if (plant) {
          validPlantId = plant.id;
        } else {
          // Plant is from plant_scans, not user_plants - store without plant reference
          console.log('Plant ID not in user_plants, storing activity without plant reference');
        }
      }

      // Insert the activity
      const { data: activityLog, error: insertError } = await supabase
        .from('carbon_activities')
        .insert({
          user_id: user.id,
          plant_id: validPlantId,
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
      // Validate date range
      const { startDate, endDate } = activity || {};
      const dateValidation = validateDateRange(startDate, endDate);
      if (!dateValidation.valid) {
        return new Response(JSON.stringify({ error: dateValidation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
