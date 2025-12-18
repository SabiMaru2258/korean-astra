import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { hashPassword, verifyToken } from "@/lib/auth";

type ResetTicket = {
  id: string;
  username: string;
  hint: string;
  status: "pending" | "resolved" | "denied";
  createdAt: string;
  resolvedAt?: string;
  newPassword?: string;
  message?: string;
};

type StoredUser = { username: string; passwordHash: string };

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const REQUESTS_PATH = path.join(process.cwd(), "data", "password_requests.json");

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

async function readRequests(): Promise<ResetTicket[]> {
  try {
    const raw = await fs.readFile(REQUESTS_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function writeRequests(requests: ResetTicket[]) {
  await fs.mkdir(path.dirname(REQUESTS_PATH), { recursive: true });
  await fs.writeFile(REQUESTS_PATH, JSON.stringify(requests, null, 2), "utf8");
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = body.id as string;
    const password = (body.password || "").toString();
    if (!id) {
      return NextResponse.json({ error: "Ticket id is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "New password is required" }, { status: 400 });
    }

    const requests = await readRequests();
    const ticket = requests.find((r) => r.id === id);
    if (!ticket || ticket.status !== "pending") {
      return NextResponse.json({ error: "Ticket not found or already resolved" }, { status: 404 });
    }

    const users = await readUsers();
    const user = users.find((u) => u.username === ticket.username);
    if (!user) {
      ticket.status = "denied";
      ticket.resolvedAt = new Date().toISOString();
      ticket.message = "User no longer exists";
      await writeRequests(requests);
      return NextResponse.json({ error: "User no longer exists" }, { status: 400 });
    }

    const hashed = hashPassword(password);
    user.passwordHash = hashed;
    ticket.status = "resolved";
    ticket.resolvedAt = new Date().toISOString();
    ticket.newPassword = password;
    ticket.message = "Password set manually by admin";

    await writeUsers(users);
    await writeRequests(requests);

    return NextResponse.json({
      id: ticket.id,
      username: ticket.username,
      password,
      status: ticket.status,
    });
  } catch (error: any) {
    console.error("Approve password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve request" },
      { status: 500 }
    );
  }
}
