const Groq = require("groq-sdk");

// Initialize Groq client with free open-source models
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-2-70b-chat";

/**
 * Generate enhanced asset description using Groq (Free Open Source)
 * Uses LLaMA 2 model - completely free
 */
async function generateAssetDescription(assetType, metadata) {
  if (!process.env.GROQ_API_KEY) {
    console.log("GROQ_API_KEY not set, skipping AI description generation");
    return null;
  }

  try {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a blockchain asset description expert. Generate a professional, concise description for a ${assetType} asset with the following basic info: ${JSON.stringify(metadata)}. 
          
The description should be 2-3 sentences, suitable for a blockchain registry, highlighting key characteristics and potential value drivers. Keep it factual and compliance-friendly.`,
        },
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    if (message.choices[0].message.content) {
      return message.choices[0].message.content;
    }
  } catch (error) {
    console.error("Error generating description with Groq:", error.message);
    return null;
  }
}

/**
 * Perform risk assessment on an asset using Groq
 * Evaluates potential compliance and market risks - Free Open Source
 */
async function assessAssetRisk(assetType, metadata) {
  if (!process.env.GROQ_API_KEY) {
    console.log("GROQ_API_KEY not set, skipping AI risk assessment");
    return {
      riskScore: 50,
      riskLevel: "MEDIUM",
      analysis: "Risk assessment unavailable",
    };
  }

  try {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a blockchain compliance risk analyst. Assess the risk level of a ${assetType} asset with the following metadata: ${JSON.stringify(metadata)}.

Respond in JSON format with:
{
  "riskScore": <0-100>,
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "analysis": "<brief explanation>",
  "recommendations": ["<recommendation1>", "<recommendation2>"]
}

Consider regulatory, liquidity, and market risks. Focus on real-world asset compliance concerns.`,
        },
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    if (message.choices[0].message.content) {
      try {
        // Extract JSON from response
        const jsonMatch = message.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse risk response:", parseError);
      }
    }
  } catch (error) {
    console.error("Error assessing risk with Groq:", error.message);
  }

  return {
    riskScore: 50,
    riskLevel: "MEDIUM",
    analysis: "Risk assessment could not be completed",
    recommendations: [],
  };
}

/**
 * Generate compliance checklist for asset verification using Groq
 * Free Open Source - no cost
 */
async function generateComplianceChecklist(assetType) {
  if (!process.env.GROQ_API_KEY) {
    return [
      "KYC verification completed",
      "AML checks passed",
      "Documentation verified",
    ];
  }

  try {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate a compliance checklist for verifying a ${assetType} asset on a blockchain registry. 
Return as a JSON array of strings, each item being a compliance check item. 
Focus on legal, regulatory, and blockchain-specific checks.
Return format: ["check1", "check2", "check3", ...]`,
        },
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 512,
    });

    if (message.choices[0].message.content) {
      try {
        const arrayMatch = message.choices[0].message.content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          return JSON.parse(arrayMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse compliance checklist:", parseError);
      }
    }
  } catch (error) {
    console.error("Error generating compliance checklist with Groq:", error.message);
  }

  return [
    "KYC verification completed",
    "AML checks passed",
    "Documentation verified",
    "Ownership verified",
    "Legal review completed",
  ];
}

module.exports = {
  generateAssetDescription,
  assessAssetRisk,
  generateComplianceChecklist,
};
