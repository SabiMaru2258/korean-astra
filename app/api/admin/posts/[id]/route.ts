import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}

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
    const { isPinned, isLocked } = body;

    const updateData: any = {};
    if (typeof isPinned === "boolean") {
      updateData.isPinned = isPinned;
    }
    if (typeof isLocked === "boolean") {
      updateData.isLocked = isLocked;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
          },
        },
        votes: true,
        answers: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                reputation: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            answers: true,
          },
        },
      },
    });

    const voteScore = updatedPost.votes.reduce((sum, vote) => sum + vote.value, 0);

    return NextResponse.json({
      ...updatedPost,
      voteScore,
      answerCount: updatedPost._count.answers,
    });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

