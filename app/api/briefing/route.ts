import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { Priority, Status } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TIMEOUT_MS = 30000;

function generateFallbackBriefing(tasks: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Top 3 actions: highest priority TODO/IN_PROGRESS with nearest dueDate
  const activeTasks = tasks.filter(
    (t) => t.status === Status.TODO || t.status === Status.IN_PROGRESS
  );
  const sortedByPriority = activeTasks.sort((a, b) => {
    const priorityOrder = {
      [Priority.CRITICAL]: 4,
      [Priority.HIGH]: 3,
      [Priority.MEDIUM]: 2,
      [Priority.LOW]: 1,
    };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
  const top3 = sortedByPriority.slice(0, 3).map((t) => t.title);

  // Alerts: CRITICAL tasks not DONE + overdue items
  const criticalNotDone = tasks
    .filter((t) => t.priority === Priority.CRITICAL && t.status !== Status.DONE)
    .map((t) => t.title);
  const overdue = tasks
    .filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < today &&
        t.status !== Status.DONE
    )
    .map((t) => t.title);
  const alerts = [...new Set([...criticalNotDone, ...overdue])];

  // Blockers: BLOCKED tasks
  const blockers = tasks
    .filter((t) => t.status === Status.BLOCKED)
    .map((t) => t.title);

  // Due/overdue: dueDate <= today
  const dueOverdue = tasks
    .filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) <= today &&
        t.status !== Status.DONE
    )
    .map((t) => `${t.title} (due: ${new Date(t.dueDate!).toLocaleDateString()})`);

  return {
    top3: top3.length > 0 ? top3 : ["No urgent actions identified"],
    alerts: alerts.length > 0 ? alerts : ["No critical alerts"],
    blockers: blockers.length > 0 ? blockers : ["No blocking dependencies"],
    dueOverdue: dueOverdue.length > 0 ? dueOverdue : ["No overdue items"],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: "roleId is required" },
        { status: 400 }
      );
    }

    // Fetch role and tasks
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: { roleId },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    });

    if (tasks.length === 0) {
      return NextResponse.json({
        top3: ["No tasks assigned"],
        alerts: ["No alerts"],
        blockers: ["No blockers"],
        dueOverdue: ["No due items"],
      });
    }

    // Try AI first, fallback to rule-based
    let briefing;
    let rawInputSummary: string | null = null;

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
      );

      const systemPrompt = `You are a helpful assistant that generates daily briefings for semiconductor staff.
Your role is to provide clear, beginner-friendly, action-oriented summaries.

CRITICAL RULES:
1. Use simple, corporate-friendly language suitable for non-technical staff.
2. Only reference tasks that are actually provided. Do NOT invent or hallucinate tasks.
3. Return valid JSON only with these exact keys: top3 (array of 3 strings), alerts (array of strings), blockers (array of strings), dueOverdue (array of strings).
4. Be concise and actionable.`;

      const tasksSummary = tasks.map((t) => ({
        title: t.title,
        description: t.description || "",
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date",
      }));

      rawInputSummary = JSON.stringify(tasksSummary, null, 2);

      const userPrompt = `Generate a daily briefing for a ${role.name} based on these tasks:

${rawInputSummary}

Provide:
1. top3: Top 3 actions to focus on today (array of exactly 3 task titles or action items)
2. alerts: Critical alerts that need immediate attention (array of strings)
3. blockers: Blocking dependencies or issues (array of strings)
4. dueOverdue: Items that are due or overdue (array of strings with due dates)

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
        // Retry once
        const retryCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt + " Return valid JSON only, no markdown." },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });
        const retryContent = retryCompletion.choices[0].message.content;
        const jsonMatch = retryContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response");
        }
      }

      // Validate structure
      briefing = {
        top3: Array.isArray(result.top3) ? result.top3.slice(0, 3) : [],
        alerts: Array.isArray(result.alerts) ? result.alerts : [],
        blockers: Array.isArray(result.blockers) ? result.blockers : [],
        dueOverdue: Array.isArray(result.dueOverdue) ? result.dueOverdue : [],
      };

      // Ensure top3 has exactly 3 items
      while (briefing.top3.length < 3) {
        briefing.top3.push("No additional actions");
      }
    } catch (aiError) {
      console.warn("AI briefing failed, using fallback:", aiError);
      briefing = generateFallbackBriefing(tasks);
    }

    // Save to database
    const briefingLog = await prisma.briefingLog.create({
      data: {
        roleId,
        top3: JSON.stringify(briefing.top3),
        alerts: JSON.stringify(briefing.alerts),
        blockers: JSON.stringify(briefing.blockers),
        dueOverdue: JSON.stringify(briefing.dueOverdue),
        rawInputSummary,
      },
    });

    return NextResponse.json({
      ...briefing,
      id: briefingLog.id,
      generatedAt: briefingLog.generatedAt,
    });
  } catch (error: any) {
    console.error("Error generating briefing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate briefing" },
      { status: 500 }
    );
  }
}

