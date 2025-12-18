import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_INPUT_SIZE = 200; // characters
const TIMEOUT_MS = 20000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { term, level } = body;

    // Guardrails
    if (!term || typeof term !== "string") {
      return NextResponse.json(
        { error: "Term is required" },
        { status: 400 }
      );
    }

    if (term.length > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: `Term is too long. Maximum ${MAX_INPUT_SIZE} characters.` },
        { status: 400 }
      );
    }

    // Basic sanitization
    const sanitizedTerm = term.slice(0, MAX_INPUT_SIZE).trim();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
    );

    const systemPrompt = `You are a helpful glossary assistant for semiconductor terminology.
Your role is to explain terms in beginner-friendly language.

CRITICAL RULES:
1. Use simple, non-technical language suitable for new or non-technical semiconductor staff.
2. Provide concrete, day-to-day examples from semiconductor fabrication (fab) contexts.
3. Explain why the term matters in practical terms.
4. Address common confusions or misconceptions.
5. Adjust complexity based on level (beginner = very simple, intermediate = slightly more detail).
6. Return valid JSON with keys: definition, example, whyItMatters, commonConfusion.`;

    const levelInstruction = level === "beginner" 
      ? "Use very simple language, avoid technical jargon, use analogies when helpful."
      : "You can include slightly more technical detail but still keep it accessible.";

    const userPrompt = `Explain this semiconductor term: "${sanitizedTerm}"

Level: ${level}
${levelInstruction}

Provide:
1. definition: A clear definition in plain English (2-3 sentences)
2. example: A concrete example in day-to-day fab context (2-3 sentences)
3. whyItMatters: Why this term matters in practical terms (2-3 sentences)
4. commonConfusion: Common confusion or misconceptions about this term (2-3 sentences)

Return ONLY valid JSON with these exact keys.`;

    const completionPromise = openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
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
      definition: result.definition || "Definition not available",
      example: result.example || "Example not available",
      whyItMatters: result.whyItMatters || "Information not available",
      commonConfusion: result.commonConfusion || "No common confusions noted",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Module 4 error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to look up term" },
      { status: 500 }
    );
  }
}

