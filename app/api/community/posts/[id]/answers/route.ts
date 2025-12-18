import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: "Post is locked" },
        { status: 403 }
      );
    }

    const answer = await prisma.answer.create({
      data: {
        postId: params.id,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
          },
        },
      },
    });

    return NextResponse.json(answer);
  } catch (error: any) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create answer" },
      { status: 500 }
    );
  }
}

