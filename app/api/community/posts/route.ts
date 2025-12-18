import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (search) {
      // SQLite doesn't support case-insensitive mode, use LIKE with UPPER
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orderBy: any = {};
    if (sort === "newest") {
      orderBy.createdAt = "desc";
    } else if (sort === "top") {
      // Sort by vote count (need to calculate)
      orderBy.createdAt = "desc"; // Will sort by votes in application
    } else if (sort === "most-commented") {
      orderBy.answers = { _count: "desc" };
    }

    const posts = await prisma.post.findMany({
      where,
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
        _count: {
          select: {
            votes: true,
            answers: true,
          },
        },
      },
      orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "most-commented" ? { answers: { _count: "desc" } } : { createdAt: "desc" },
    });

    // Calculate vote scores and sort by top if needed
    const postsWithScores = posts.map((post) => {
      const voteScore = post.votes.reduce((sum, vote) => sum + vote.value, 0);
      return {
        ...post,
        voteScore,
        answerCount: post._count.answers,
      };
    });

    let sortedPosts = postsWithScores;
    // Always sort: pinned posts first, then by selected criteria
    sortedPosts = postsWithScores.sort((a, b) => {
      // Pinned posts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by selected criteria
      if (sort === "top") {
        return b.voteScore - a.voteScore;
      } else if (sort === "most-commented") {
        return b.answerCount - a.answerCount;
      } else {
        // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return NextResponse.json(sortedPosts);
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || "GENERAL",
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
          },
        },
        votes: true,
        _count: {
          select: {
            votes: true,
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...post,
      voteScore: 0,
      answerCount: 0,
    });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

