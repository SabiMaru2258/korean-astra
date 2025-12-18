import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/auth";

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

const REQUESTS_PATH = path.join(process.cwd(), "data", "password_requests.json");

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

export async function POST() {
  const sessionCookie = cookies().get("session")?.value;
  const session = verifyToken(sessionCookie);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await readRequests();
  const pendingOnly = requests.filter((r) => r.status === "pending");
  await writeRequests(pendingOnly);

  return NextResponse.json({
    removed: requests.length - pendingOnly.length,
    remaining: pendingOnly.length,
  });
}
