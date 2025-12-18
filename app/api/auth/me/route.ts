import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify signed token (works in Edge Runtime)
    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get user details from database for additional info
    const user = await prisma.user.findUnique({
      where: { username: session.username },
      select: {
        id: true,
        username: true,
        role: true,
        reputation: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      username: user.username,
      role: user.role.toLowerCase(),
      id: user.id,
      reputation: user.reputation,
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

