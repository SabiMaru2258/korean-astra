import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { hashPassword, signToken } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim().toLowerCase();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Admin bypass
    if (username === "admin" && password === "admin") {
      const token = signToken({ username: "admin", role: "admin" });
      const res = NextResponse.json({ role: "admin", username: "admin" });
      res.cookies.set({
        name: "session",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      return res;
    }

    const users = await readUsers();
    const passwordHash = hashPassword(password);

    const user = users.find(
      (u) => u.username.toLowerCase() === username && u.passwordHash === passwordHash
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({ username, role: user.role || "user" });
    const res = NextResponse.json({ role: user.role || "user", username });
    res.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
