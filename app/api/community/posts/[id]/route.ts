import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
          orderBy: { createdAt: "asc" },
        },
        acceptedAnswer: {
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const voteScore = post.votes.reduce((sum, vote) => sum + vote.value, 0);
    const userVote = post.votes.find((v) => v.userId === user.id);

    // Sort answers: accepted answer first, then by creation date
    const sortedAnswers = post.answers.sort((a, b) => {
      if (post.acceptedAnswerId === a.id) return -1;
      if (post.acceptedAnswerId === b.id) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json({
      ...post,
      answers: sortedAnswers,
      voteScore,
      answerCount: post._count.answers,
      userVote: userVote ? userVote.value : null,
    });
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

