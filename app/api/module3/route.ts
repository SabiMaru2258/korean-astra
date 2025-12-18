import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const TIMEOUT_MS = 45000; // 45 seconds for vision

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType } = body;

    // Guardrails
    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Estimate size (base64 is ~33% larger)
    const estimatedSize = (image.length * 3) / 4;
    if (estimatedSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Maximum 20MB." },
        { status: 400 }
      );
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
    );

    const systemPrompt = `You are a helpful assistant that identifies semiconductor components from images for non-technical staff.

CRITICAL RULES:
1. Use simple, beginner-friendly language. Avoid technical jargon unless you explain it.
2. Do NOT claim certainty. Use phrases like "most likely", "appears to be", "could be".
3. NEVER classify defects, failures, or problems. If asked about defects, provide only general educational information about what you see, not diagnostic assessments.
4. Focus on explaining what the object is, what it's used for, and its role in the semiconductor process.
5. Return valid JSON with keys: object (string), purpose (string), role (string).
6. Keep explanations friendly and accessible to people new to semiconductors.`;

    const userPrompt = `Analyze this semiconductor image and provide:

1. object: What this object most likely is (use "most likely" or "appears to be" language)
2. purpose: What it's used for in simple terms
3. role: Its role in the overall semiconductor manufacturing process

Use beginner-friendly language. Do not diagnose defects or problems.`;

    const completionPromise = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/jpeg"};base64,${image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

    let result;
    try {
      const content = completion.choices[0].message.content;
      result = JSON.parse(content);
    } catch (parseError) {
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    // Ensure required fields
    const response = {
      object: result.object || "Unable to identify the object in the image",
      purpose: result.purpose || "Unable to determine purpose",
      role: result.role || "Unable to determine role in semiconductor process",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Module 3 error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to identify image" },
      { status: 500 }
    );
  }
}

