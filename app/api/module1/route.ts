import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_INPUT_SIZE = 50000; // characters
const TIMEOUT_MS = 30000; // 30 seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, headers, rowCount, qualityNotes } = body;

    // Guardrails
    const inputSize = JSON.stringify(data).length;
    if (inputSize > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: "Input data too large. Please use a smaller CSV file." },
        { status: 400 }
      );
    }

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
    );

    // Prepare prompt
    const systemPrompt = `You are a helpful assistant that analyzes semiconductor operations data from CSV files. 
Your role is to provide clear, beginner-friendly summaries. 
CRITICAL RULES:
1. Only analyze data that is actually present in the CSV. Do NOT invent or hallucinate fields, values, or patterns that are not in the data.
2. If you're uncertain about something, say so explicitly.
3. Use simple, non-technical language suitable for new or non-technical semiconductor staff.
4. Return your response as valid JSON with these exact keys: mainPoints (array of strings), importantItems (array of strings), top3Attention (array of exactly 3 strings), dataQualityNotes (array of strings).
5. Be specific and reference actual data values when possible.`;

    const userPrompt = `Analyze this semiconductor operations CSV data:

Column headers: ${headers.join(", ")}

Total rows: ${rowCount}

Sample data (first ${Math.min(100, data.length)} rows):
${JSON.stringify(data.slice(0, 100), null, 2)}

${qualityNotes.length > 0 ? `Data quality issues detected:\n${qualityNotes.join("\n")}` : ""}

Provide:
1. Main points (3-5 bullet points summarizing the overall data)
2. Important or unusual items (things that stand out, anomalies, notable patterns)
3. Top 3 things to pay attention to (numbered, most critical items)
4. Data quality notes (incorporate the provided notes and add any additional observations)

Return ONLY valid JSON, no markdown, no code blocks.`;

    const completionPromise = openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

    let result;
    try {
      const content = completion.choices[0].message.content;
      result = JSON.parse(content);
    } catch (parseError) {
      // Fallback: try to extract JSON if wrapped in markdown
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    // Ensure required fields exist
    const response = {
      mainPoints: result.mainPoints || ["Unable to extract main points"],
      importantItems: result.importantItems || ["No unusual items detected"],
      top3Attention: result.top3Attention?.slice(0, 3) || ["Review data", "Check for issues", "Follow up as needed"],
      dataQualityNotes: result.dataQualityNotes || qualityNotes || [],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Module 1 error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process CSV data" },
      { status: 500 }
    );
  }
}

