import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { isActive, role } = body;

    const updateData: any = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (role && (role === "ADMIN" || role === "USER")) {
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        reputation: true,
        createdAt: true,
      },
    });

    // If disabling user, delete all their sessions
    if (updateData.isActive === false) {
      await prisma.session.deleteMany({
        where: { userId: params.id },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

