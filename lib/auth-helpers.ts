import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return null;
    }

    // Verify signed token (works in Edge Runtime)
    const session = verifyToken(token);
    if (!session) {
      return null;
    }

    // Get user details from database
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
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

