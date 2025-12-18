import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = body.id as string;
    if (!id) {
      return NextResponse.json({ error: "Ticket id is required" }, { status: 400 });
    }

    const requests = await readRequests();
    const ticket = requests.find((r) => r.id === id);
    if (!ticket || ticket.status !== "pending") {
      return NextResponse.json({ error: "Ticket not found or already resolved" }, { status: 404 });
    }

    ticket.status = "denied";
    ticket.resolvedAt = new Date().toISOString();
    ticket.message = "Denied by admin";
    await writeRequests(requests);

    return NextResponse.json({ id: ticket.id, status: ticket.status });
  } catch (error: any) {
    console.error("Deny password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deny request" },
      { status: 500 }
    );
  }
}
