import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { error: "roleId is required" },
        { status: 400 }
      );
    }

    const briefings = await prisma.briefingLog.findMany({
      where: { roleId },
      orderBy: { generatedAt: "desc" },
      take: 10, // Last 10 briefings
    });

    const formatted = briefings.map((b) => ({
      id: b.id,
      generatedAt: b.generatedAt,
      top3: JSON.parse(b.top3),
      alerts: JSON.parse(b.alerts),
      blockers: JSON.parse(b.blockers),
      dueOverdue: JSON.parse(b.dueOverdue),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching briefing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch briefing history" },
      { status: 500 }
    );
  }
}

