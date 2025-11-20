import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyEmailContent {
  subject: string;
  greeting: string;
  mainContent: string;
  tips: string[];
  cta: string;
}

// Generate daily email content based on the day
function generateDailyContent(): DailyEmailContent {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const themes = [
    {
      subject: "🌱 Sunday Plant Care Reminder",
      greeting: "Happy Sunday, Plant Parent!",
      mainContent: "Take some time today to check in with your green friends. Sunday is perfect for a thorough plant inspection!",
      tips: [
        "Check soil moisture levels for all your plants",
        "Remove any dead or yellowing leaves",
        "Rotate pots to ensure even light distribution",
        "Clean dusty leaves with a damp cloth"
      ],
      cta: "Log into FloraGuard and update your care tasks!"
    },
    {
      subject: "💪 Monday Motivation for Your Plants",
      greeting: "Start the week strong!",
      mainContent: "Just like you, your plants need a fresh start this week. Let's make sure they're set up for success!",
      tips: [
        "Review your watering schedule for the week",
        "Check if any plants need fertilizing",
        "Ensure proper drainage in all pots",
        "Look for signs of pests or disease"
      ],
      cta: "Open FloraGuard and plan your week!"
    },
    {
      subject: "🌿 Tuesday Plant Health Check",
      greeting: "Time for a health check!",
      mainContent: "Mid-week is the perfect time to assess your plants' well-being and adjust care as needed.",
      tips: [
        "Monitor growth patterns and new shoots",
        "Check humidity levels near your plants",
        "Adjust light exposure if needed",
        "Inspect roots through drainage holes"
      ],
      cta: "Track health status in FloraGuard!"
    },
    {
      subject: "✨ Wednesday Care Tips",
      greeting: "Happy Wednesday!",
      mainContent: "Let's keep that momentum going! Here are some mid-week plant care insights.",
      tips: [
        "Trim any leggy growth to promote bushiness",
        "Mist tropical plants for extra humidity",
        "Check for proper air circulation",
        "Review your carbon footprint tracker"
      ],
      cta: "Update your care log in FloraGuard!"
    },
    {
      subject: "🎯 Thursday Growth Goals",
      greeting: "Almost there, plant parent!",
      mainContent: "Your plants are counting on you. Let's finish the week strong with some focused attention.",
      tips: [
        "Document any new growth with photos",
        "Assess if repotting is needed",
        "Clean up any fallen debris",
        "Plan weekend plant shopping (if needed)"
      ],
      cta: "Check your achievements in FloraGuard!"
    },
    {
      subject: "🌸 Friday Plant Prep",
      greeting: "Happy Friday!",
      mainContent: "Weekend is almost here! Prepare your plants for the days ahead.",
      tips: [
        "Water plants that need weekend hydration",
        "Move plants away from cold windows",
        "Set up any automated watering systems",
        "Review next week's care schedule"
      ],
      cta: "Plan ahead with FloraGuard!"
    },
    {
      subject: "🌞 Saturday Plant Time",
      greeting: "It's Plant Saturday!",
      mainContent: "Spend some quality time with your green companions this weekend. They deserve your attention!",
      tips: [
        "Deep water plants that need it",
        "Try propagating a favorite plant",
        "Research care tips for new plants",
        "Share your plant progress on social media"
      ],
      cta: "Share your plants in FloraGuard!"
    }
  ];

  return themes[dayOfWeek];
}

// Generate HTML email template
function generateEmailHTML(content: DailyEmailContent, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🌱 FloraGuard</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Daily Plant Care Update</p>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">${content.greeting}</h2>
                    <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.6;">
                      Hi ${userName}, ${content.mainContent}
                    </p>
                  </td>
                </tr>
                
                <!-- Tips Section -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px;">
                      <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 18px;">📋 Today's Care Tips:</h3>
                      <ul style="margin: 0; padding: 0; list-style: none;">
                        ${content.tips.map(tip => `
                          <li style="color: #374151; margin-bottom: 10px; padding-left: 24px; position: relative; line-height: 1.6;">
                            <span style="position: absolute; left: 0; color: #22c55e;">✓</span>
                            ${tip}
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 20px 30px 40px 30px; text-align: center;">
                    <a href="https://flora-guard.vercel.app" 
                       style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);">
                      ${content.cta}
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                      Keep growing! 🌿
                    </p>
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      You're receiving this because you have an account with FloraGuard.<br/>
                      <a href="https://flora-guard.vercel.app/profile" style="color: #22c55e; text-decoration: none;">Manage email preferences</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily email send...");
    
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with email preferences enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("user_email_preferences")
      .select("user_id, email_enabled, daily_digest_enabled")
      .eq("email_enabled", true)
      .eq("daily_digest_enabled", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    console.log(`Found ${preferences?.length || 0} users with email enabled`);

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with email preferences enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate daily content
    const emailContent = generateDailyContent();
    const results = [];

    // Send email to each user
    for (const pref of preferences) {
      try {
        // Get user email from auth
        const { data: authData } = await supabase.auth.admin.getUserById(pref.user_id);
        const userEmail = authData?.user?.email;
        
        if (!userEmail) continue;

        // Get user profile for personalization
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("user_id", pref.user_id)
          .single();

        const userName = profile?.full_name || profile?.username || "Plant Parent";
        const html = generateEmailHTML(emailContent, userName);

        // Send email via Resend
        const { data, error } = await resend.emails.send({
         from: "FloraGuard <notifications@on.resend.dev>",
          to: [userEmail],
          subject: emailContent.subject,
          html: html,
        });
from: "FloraGuard <notifications@on.resend.dev>"
        if (error) {
          console.error(`Failed to send to ${userEmail}:`, error);
          results.push({ email: userEmail, status: "failed", error: error.message });
          
          // Log failed email
          await supabase.from("email_logs").insert({
            user_id: pref.user_id,
            email_type: "daily_digest",
            subject: emailContent.subject,
            status: "failed",
            metadata: { error: error.message }
          });
        } else {
          console.log(`Successfully sent to ${userEmail}`);
          results.push({ email: userEmail, status: "sent", id: data?.id });
          
          // Log successful email
          await supabase.from("email_logs").insert({
            user_id: pref.user_id,
            email_type: "daily_digest",
            subject: emailContent.subject,
            status: "sent",
            metadata: { resend_id: data?.id }
          });
        }
      } catch (error: any) {
        console.error(`Error processing user ${pref.user_id}:`, error);
        results.push({ 
          user_id: pref.user_id, 
          status: "error", 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Daily emails processed",
        total: preferences.length,
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
