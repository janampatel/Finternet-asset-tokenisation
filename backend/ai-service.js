const Anthropic = require("@anthropic-ai/sdk").default;

// Initialize Claude client from environment variable
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate enhanced asset description using Claude AI
 * Useful for auto-generating metadata descriptions from basic asset info
 */
async function generateAssetDescription(assetType, metadata) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "ANTHROPIC_API_KEY not set, skipping AI description generation"
    );
    return null;
  }

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a blockchain asset description expert. Generate a professional, concise description for a ${assetType} asset with the following basic info: ${JSON.stringify(metadata)}. 
          
          The description should be 2-3 sentences, suitable for a blockchain registry, highlighting key characteristics and potential value drivers. Keep it factual and compliance-friendly.`,
        },
      ],
    });

    if (message.content[0].type === "text") {
      return message.content[0].text;
    }
  } catch (error) {
    console.error("Error generating description with AI:", error.message);
    return null;
  }
}

/**
 * Perform risk assessment on an asset using Claude
 * Evaluates potential compliance and market risks
 */
async function assessAssetRisk(assetType, metadata) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set, skipping AI risk assessment");
    return {
      riskScore: 50,
      riskLevel: "MEDIUM",
      analysis: "Risk assessment unavailable",
    };
  }

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
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
    });

    if (message.content[0].type === "text") {
      try {
        // Extract JSON from response
        const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse AI risk response:", parseError);
      }
    }
  } catch (error) {
    console.error("Error assessing risk with AI:", error.message);
  }

  return {
    riskScore: 50,
    riskLevel: "MEDIUM",
    analysis: "Risk assessment could not be completed",
    recommendations: [],
  };
}

/**
 * Generate compliance checklist for asset verification
 */
async function generateComplianceChecklist(assetType) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return [
      "KYC verification completed",
      "AML checks passed",
      "Documentation verified",
    ];
  }

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Generate a compliance checklist for verifying a ${assetType} asset on a blockchain registry. 
          Return as a JSON array of strings, each item being a compliance check item. 
          Focus on legal, regulatory, and blockchain-specific checks.
          Return format: ["check1", "check2", "check3", ...]`,
        },
      ],
    });

    if (message.content[0].type === "text") {
      try {
        const arrayMatch = message.content[0].text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          return JSON.parse(arrayMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse compliance checklist:", parseError);
      }
    }
  } catch (error) {
    console.error("Error generating compliance checklist:", error.message);
  }

  return [
    "KYC verification completed",
    "AML checks passed",
    "Documentation verified",
  ];
}

module.exports = {
  generateAssetDescription,
  assessAssetRisk,
  generateComplianceChecklist,
};
