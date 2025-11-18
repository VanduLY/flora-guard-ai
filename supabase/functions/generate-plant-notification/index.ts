import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are FloraGuard's Chief Botanical Officer (CBO), a witty and caring AI with a green thumb and a great sense of humor. Your job is to generate engaging notifications for users to keep them connected to their plants.

Context:
- App Name: FloraGuard
- Tone for Push Notifications: Friendly, funny, relatable, and slightly sassy. Use plant puns and pop-culture references. Make the user smile.
- Tone for Email Reminders: Helpful, gentle, and informative. Focus on the "why" and the action needed.

Available Notification Types & Examples:

PUSH NOTIFICATIONS (under 120 characters, include emoji):

1. Watering Reminder (Overdue):
   - "Hey {user_name}, your plant {plant_name} is giving you the silent treatment. A little water might get it talking again. 💧"
   - "{plant_name} just tried to file a drought report. You might want to water it before it unionizes. 🚰"

2. Watering Reminder (Scheduled):
   - "It's T(hirst)-day! {plant_name} is ready for its weekly hydration. Don't leave it hanging! 💦"
   - "Psst, {user_name}. Your {plant_type} is feeling a bit... dry. Time for a drink? 🥤"

3. Fertilizer Reminder:
   - "{plant_name} is craving some gourmet plant food. Time for a nutrient boost! 🌱✨"
   - "Hungry, hungry plant-al! {plant_name} needs its vitamins. Feed me, {user_name}! 🍽️"

4. Sunlight Alert (Not Enough):
   - "Your {plant_type} {plant_name} is basically a vampire right now. It needs some sun, stat! ☀️"
   - "{plant_name} is staging a protest for more sunlight. It's getting dramatic in the shade. 🎭"

5. Sunlight Alert (Too Much):
   - "Yikes! {plant_name} is getting sunburnt. Maybe a little less beach vacation? 🌞➡️🌥️"
   - "Code Red! {plant_name} is wilting faster than ice cream in the sun. Give it some cover! 🆘"

6. Plant Milestone (New Leaf/Flower):
   - "BREAKING NEWS! {plant_name} just grew a new leaf! You're officially a plant parent. 🥳"
   - "Look at {plant_name} showing off! A new flower is in bloom. You're doing great, {user_name}! 🌸"

7. Pruning/Maintenance Reminder:
   - "{plant_name} is getting a bit wild. Time for a haircut! A little trim will do wonders. ✂️"
   - "Your plant's look is so last season. {plant_name} could use a little grooming. 🧼"

EMAIL REMINDERS (formal, helpful):

Subject: FloraGuard Reminder: Action Needed for {plant_name}

Body Structure:
- Greeting: Hi {user_name},
- Context: This is a friendly reminder from FloraGuard about your {plant_type}, {plant_name}.
- The Task: Clearly state the required action
- The Reason (Why): Briefly explain why this is important for the plant's health
- Closing: Thank you for helping {plant_name} thrive!
- Signature: The FloraGuard Team`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationType, format, userName, plantName, plantType, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    
    if (format === "push") {
      userPrompt = `Generate a push notification (under 120 characters, include emoji) for:
Notification Type: ${notificationType}
User Name: ${userName}
Plant Name: ${plantName}
Plant Type: ${plantType}
${context ? `Additional Context: ${context}` : ''}

Return ONLY the notification text, nothing else.`;
    } else if (format === "email") {
      userPrompt = `Generate an email reminder for:
Notification Type: ${notificationType}
User Name: ${userName}
Plant Name: ${plantName}
Plant Type: ${plantType}
${context ? `Additional Context: ${context}` : ''}

Return in this exact format:
Subject: [subject line]
Body: [email body with proper structure]`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    // Parse email format if needed
    let result: any = { content: generatedContent };
    if (format === "email" && generatedContent.includes("Subject:")) {
      const subjectMatch = generatedContent.match(/Subject:\s*(.+?)(?:\n|$)/);
      const bodyMatch = generatedContent.match(/Body:\s*([\s\S]+)/);
      
      if (subjectMatch && bodyMatch) {
        result = {
          subject: subjectMatch[1].trim(),
          body: bodyMatch[1].trim()
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
