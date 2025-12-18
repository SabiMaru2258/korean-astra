import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/auth";

type StoredUser = { username: string; passwordHash: string; role?: "admin" | "user" };

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const REQUESTS_PATH = path.join(process.cwd(), "data", "password_requests.json");

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

async function clearUserTickets(username: string) {
  try {
    const raw = await fs.readFile(REQUESTS_PATH, "utf8");
    const list = JSON.parse(raw || "[]");
    const filtered = list.filter((r: any) => r.username !== username);
    await fs.writeFile(REQUESTS_PATH, JSON.stringify(filtered, null, 2), "utf8");
  } catch {
    // ignore
  }
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
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }
    if (username === "admin") {
      return NextResponse.json({ error: "Cannot delete admin" }, { status: 400 });
    }

    const users = await readUsers();
    const remaining = users.filter((u) => u.username.toLowerCase() !== username);
    if (remaining.length === users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await writeUsers(remaining);
    await clearUserTickets(username);

    return NextResponse.json({ username });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
