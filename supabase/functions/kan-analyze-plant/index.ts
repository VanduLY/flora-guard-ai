import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation - optimized
function validateImageInput(imageUrl: string | undefined, imageBase64: string | undefined): { valid: boolean; error?: string } {
  if (!imageUrl && !imageBase64) {
    return { valid: false, error: "Image URL or base64 data required" };
  }
  
  if (imageUrl) {
    if (typeof imageUrl !== 'string' || imageUrl.length > 2048) {
      return { valid: false, error: "Invalid image URL" };
    }
    try {
      new URL(imageUrl);
    } catch {
      return { valid: false, error: "Invalid URL format" };
    }
  }
  
  if (imageBase64) {
    if (typeof imageBase64 !== 'string' || imageBase64.length > 7000000) {
      return { valid: false, error: "Image too large (max 5MB)" };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body = await req.json();
    const { imageUrl, imageBase64 } = body;

    const validation = validateImageInput(imageUrl, imageBase64);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const imageData = imageBase64
      ? `data:image/jpeg;base64,${imageBase64}`
      : imageUrl;

    console.log("Starting plant analysis...");

    // Use gemini-2.5-flash for optimal speed + accuracy balance
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
              content: `You are a rapid plant disease detection AI specialist. Analyze images quickly and accurately.

RESPOND ONLY with this JSON structure:
{
  "healthStatus": "healthy" | "diseased" | "stressed" | "unknown",
  "plantType": "identified species or 'Unknown plant'",
  "diseaseDetected": "specific disease name or null",
  "severity": "none" | "mild" | "moderate" | "severe",
  "confidenceScore": 0-100,
  "diagnosis": "2-3 sentence diagnosis",
  "symptoms": ["symptom1", "symptom2"],
  "recommendations": ["action1", "action2", "action3"],
  "urgency": "none" | "low" | "medium" | "high",
  "preventionTips": ["tip1", "tip2"]
}

DETECTION RULES:
- Look for: leaf spots, discoloration, wilting, mold, pests, nutrient deficiency signs
- Common diseases: powdery mildew, leaf spot, rust, blight, root rot, aphids, spider mites
- Set "stressed" for non-disease issues like overwatering, underwatering, light stress
- High confidence (80+) only with clear, visible symptoms
- Include actionable, specific recommendations
- Be concise but thorough`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this plant image. Identify species, detect any diseases, assess health, and provide treatment recommendations."
                },
                {
                  type: "image_url",
                  image_url: { url: imageData }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("Empty AI response");
    }

    // Parse JSON response
    let analysisResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiContent;
      analysisResult = JSON.parse(jsonStr);
      
      // Ensure required fields with defaults
      analysisResult = {
        healthStatus: analysisResult.healthStatus || "unknown",
        plantType: analysisResult.plantType || "Unknown plant",
        diseaseDetected: analysisResult.diseaseDetected || null,
        severity: analysisResult.severity || "none",
        confidenceScore: Math.min(100, Math.max(0, analysisResult.confidenceScore || 50)),
        diagnosis: analysisResult.diagnosis || "Unable to determine diagnosis",
        symptoms: Array.isArray(analysisResult.symptoms) ? analysisResult.symptoms : [],
        recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : ["Monitor plant health regularly"],
        urgency: analysisResult.urgency || "none",
        preventionTips: Array.isArray(analysisResult.preventionTips) ? analysisResult.preventionTips : []
      };
    } catch (parseError) {
      console.error("Parse error:", aiContent);
      throw new Error("Invalid response format");
    }

    const processingTime = Date.now() - startTime;
    console.log(`Analysis complete in ${processingTime}ms:`, analysisResult.healthStatus);

    return new Response(
      JSON.stringify({ ...analysisResult, processingTimeMs: processingTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze image. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
