import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation
function validateImageInput(imageUrl: string | undefined, imageBase64: string | undefined): { valid: boolean; error?: string } {
  if (!imageUrl && !imageBase64) {
    return { valid: false, error: "Image URL or base64 data required" };
  }
  
  if (imageUrl) {
    // Validate URL format
    if (typeof imageUrl !== 'string' || imageUrl.length > 2048) {
      return { valid: false, error: "Invalid image URL format or too long" };
    }
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return { valid: false, error: "Invalid URL format" };
    }
  }
  
  if (imageBase64) {
    // Validate base64 format and size (max ~5MB base64 string)
    if (typeof imageBase64 !== 'string' || imageBase64.length > 7000000) {
      return { valid: false, error: "Invalid base64 data or image too large (max 5MB)" };
    }
    // Basic base64 validation
    if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      return { valid: false, error: "Invalid base64 encoding" };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrl, imageBase64 } = body;

    // Validate inputs
    const validation = validateImageInput(imageUrl, imageBase64);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Prepare image content for AI analysis
    const imageType = imageBase64 ? "image_url" : "image_url";
    const imageData = imageBase64
      ? `data:image/jpeg;base64,${imageBase64}`
      : imageUrl;

    console.log("Analyzing plant image with AI...");

    // Call Lovable AI for vision analysis
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert plant pathologist AI. Analyze plant images for diseases and health issues.
              
Your response must be ONLY a valid JSON object with this exact structure:
{
  "healthStatus": "healthy" or "diseased" or "unknown",
  "plantType": "string - identified plant type",
  "diseaseDetected": "string - disease name if detected, or null if healthy",
  "confidenceScore": number between 0-100,
  "diagnosis": "string - detailed diagnosis",
  "symptoms": ["array of observed symptoms"],
  "recommendations": ["array of treatment/care recommendations"]
}

Important rules:
- Only respond with the JSON object, no additional text
- If the plant appears healthy, set healthStatus to "healthy" and diseaseDetected to null
- If you detect a disease, provide specific disease name and detailed recommendations
- Base confidence score on clarity of symptoms and image quality
- If image is unclear or not a plant, set healthStatus to "unknown"`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this plant image for diseases or health issues. Provide diagnosis and treatment recommendations.",
                },
                {
                  type: imageType,
                  image_url: {
                    url: imageData,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a few moments." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI credits depleted. Please add credits to continue." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const aiContent = aiResponse.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse AI response
    let analysisResult;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiContent;
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Invalid AI response format");
    }

    console.log("Analysis complete:", analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in kan-analyze-plant:", error);
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while analyzing the image" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
