import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_INPUT_SIZE = 10000; // characters
const TIMEOUT_MS = 30000;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OpenAI API key on the server" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, mode } = body;

    // Guardrails
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text input is required" },
        { status: 400 }
      );
    }

    if (text.length > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: `Text is too long. Maximum ${MAX_INPUT_SIZE} characters.` },
        { status: 400 }
      );
    }

    // Basic sanitization
    const sanitizedText = text.slice(0, MAX_INPUT_SIZE).trim();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
    );

    const systemPrompt = `You are a helpful assistant that interprets semiconductor documents for non-technical staff.
Your role is to provide clear, beginner-friendly explanations and actionable insights.

CRITICAL RULES:
1. Use simple, non-technical language. Avoid jargon unless you explain it.
2. If the user asks for technical diagnosis or troubleshooting, respond: "I can help clarify and suggest who to check with."
3. Never provide medical, safety, or critical technical diagnoses.
4. Focus on understanding, summarizing, and suggesting next steps.
5. Return valid JSON with the required structure.`;

    let userPrompt = "";
    let responseFormat: any = { type: "json_object" };

    if (mode === "summary") {
      userPrompt = `Analyze this semiconductor document and provide:

Document text:
${sanitizedText}

Provide:
1. summary: A clear 2-4 line summary in plain English
2. keyPoints: Array of 3-6 key points explained for beginners (each as a string)
3. followUpActions: Array of suggested follow-up actions if helpful (each as a string, can be empty array if none)

Return ONLY valid JSON with keys: summary, keyPoints, followUpActions.`;
    } else if (mode === "email") {
      userPrompt = `Convert this semiconductor document into a professional email:

Document text:
${sanitizedText}

Create a professional email that summarizes the key points in a clear, business-appropriate format.
Return ONLY valid JSON with key: convertedEmail (string containing the email text).`;
    } else if (mode === "update") {
      userPrompt = `Convert this semiconductor document into a manager-friendly update:

Document text:
${sanitizedText}

Create a concise, manager-friendly update that highlights the most important points in non-technical language.
Return ONLY valid JSON with key: convertedUpdate (string containing the update text).`;
    } else {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 }
      );
    }

    const completionPromise = openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: responseFormat,
      temperature: 0.5,
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

    // Check for diagnosis requests and handle safely
    const lowerText = sanitizedText.toLowerCase();
    if (lowerText.includes("diagnose") || lowerText.includes("what's wrong") || lowerText.includes("problem")) {
      if (mode === "summary") {
        result.summary = "I can help clarify and suggest who to check with. For technical diagnosis, please consult with your engineering team or supervisor.";
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Module 2 error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to interpret document" },
      { status: 500 }
    );
  }
}

