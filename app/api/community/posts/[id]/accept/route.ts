import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answerId } = body;

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { acceptedAnswer: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only post author can accept answers
    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: "Only post author can accept answers" },
        { status: 403 }
      );
    }

    if (answerId) {
      // Check if answer exists and belongs to this post
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
      });

      if (!answer || answer.postId !== params.id || answer.isDeleted) {
        return NextResponse.json(
          { error: "Invalid answer" },
          { status: 400 }
        );
      }

      // If there was a previously accepted answer, remove reputation bonus
      if (post.acceptedAnswerId) {
        const prevAnswer = await prisma.answer.findUnique({
          where: { id: post.acceptedAnswerId },
        });
        if (prevAnswer) {
          await prisma.user.update({
            where: { id: prevAnswer.authorId },
            data: { reputation: { decrement: 15 } },
          });
        }
      }

      // Accept new answer
      await prisma.post.update({
        where: { id: params.id },
        data: { acceptedAnswerId: answerId },
      });

      // Give reputation bonus to answer author
      await prisma.user.update({
        where: { id: answer.authorId },
        data: { reputation: { increment: 15 } },
      });
    } else {
      // Unaccept answer
      if (post.acceptedAnswerId) {
        const prevAnswer = await prisma.answer.findUnique({
          where: { id: post.acceptedAnswerId },
        });
        if (prevAnswer) {
          await prisma.user.update({
            where: { id: prevAnswer.authorId },
            data: { reputation: { decrement: 15 } },
          });
        }
      }

      await prisma.post.update({
        where: { id: params.id },
        data: { acceptedAnswerId: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error accepting answer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept answer" },
      { status: 500 }
    );
  }
}

