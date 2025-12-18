import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topUsers = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { reputation: "desc" },
      take: 10,
      select: {
        id: true,
        username: true,
        reputation: true,
      },
    });

    return NextResponse.json(topUsers);
  } catch (error: any) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}

