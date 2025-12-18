import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      // Try to get username from token to clean up DB sessions
      const session = verifyToken(token);
      if (session) {
        // Delete all sessions for this user
        const user = await prisma.user.findUnique({
          where: { username: session.username },
        });
        if (user) {
          await prisma.session.deleteMany({
            where: { userId: user.id },
          });
        }
      }
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("session");
    return res;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}

