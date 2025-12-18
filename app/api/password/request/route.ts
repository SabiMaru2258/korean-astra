import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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
    const body = await req.json();
    const username = (body.username || "").trim().toLowerCase();
    const hint = (body.hint || "").trim();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const exists = users.some((u) => u.username.toLowerCase() === username);

    // Always return success to avoid user enumeration
    if (!exists) {
      return NextResponse.json({
        message: "If this account exists, a reset request has been sent to admin.",
      });
    }

    const requests = await readRequests();
    const newTicket: ResetTicket = {
      id: crypto.randomUUID(),
      username,
      hint,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    requests.push(newTicket);
    await writeRequests(requests);

    return NextResponse.json({
      message: "Request submitted to admin for review.",
    });
  } catch (error: any) {
    console.error("Password request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit request" },
      { status: 500 }
    );
  }
}
