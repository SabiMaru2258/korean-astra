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
    const value = body.value; // +1 or -1

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Vote value must be 1 or -1" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Users cannot vote on their own posts
    if (post.authorId === user.id) {
      return NextResponse.json(
        { error: "Cannot vote on your own post" },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote, remove it
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });

        // Update reputation
        if (value === 1) {
          await prisma.user.update({
            where: { id: post.authorId },
            data: { reputation: { decrement: 10 } },
          });
        } else {
          await prisma.user.update({
            where: { id: post.authorId },
            data: { reputation: { increment: 2 } },
          });
        }
      } else {
        // Different vote, update it
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });

        // Update reputation (remove old, add new)
        if (existingVote.value === 1) {
          // Was upvote, now downvote
          await prisma.user.update({
            where: { id: post.authorId },
            data: { reputation: { decrement: 12 } }, // -10 for removing upvote, -2 for adding downvote
          });
        } else {
          // Was downvote, now upvote
          await prisma.user.update({
            where: { id: post.authorId },
            data: { reputation: { increment: 12 } }, // +2 for removing downvote, +10 for adding upvote
          });
        }
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          postId: params.id,
          userId: user.id,
          value,
        },
      });

      // Update reputation
      if (value === 1) {
        await prisma.user.update({
          where: { id: post.authorId },
          data: { reputation: { increment: 10 } },
        });
      } else {
        await prisma.user.update({
          where: { id: post.authorId },
          data: { reputation: { decrement: 2 } },
        });
      }
    }

    // Get updated post with votes
    const updatedPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        votes: true,
        _count: {
          select: {
            votes: true,
            answers: true,
          },
        },
      },
    });

    const voteScore = updatedPost!.votes.reduce((sum, vote) => sum + vote.value, 0);
    const userVote = updatedPost!.votes.find((v) => v.userId === user.id);

    return NextResponse.json({
      voteScore,
      userVote: userVote ? userVote.value : null,
    });
  } catch (error: any) {
    console.error("Error voting on post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to vote" },
      { status: 500 }
    );
  }
}

