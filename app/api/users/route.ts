import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { hashPassword, verifyToken } from "@/lib/auth";

type StoredUser = {
  username: string;
  passwordHash: string;
  role?: "admin" | "user";
};

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_PATH, "utf8");
    const parsed: StoredUser[] = JSON.parse(raw || "[]");
    return parsed.map((u) => ({ ...u, role: u.role || "user" }));
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

export async function GET() {
  const sessionCookie = cookies().get("session")?.value;
  const session = verifyToken(sessionCookie);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await readUsers();
  return NextResponse.json({
    users: users.map((u) => ({ username: u.username, role: u.role || "user" })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const username = (body.username || "").trim().toLowerCase();
    const password = body.password || "";
    const role: "admin" | "user" = body.role === "admin" ? "admin" : "user";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username === "admin") {
      return NextResponse.json(
        { error: "Cannot create admin user" },
        { status: 400 }
      );
    }

    const users = await readUsers();

    if (users.some((u) => u.username === username)) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    users.push({ username, passwordHash, role });
    await writeUsers(users);

    return NextResponse.json({ username, role });
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
