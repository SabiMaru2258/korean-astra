"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Topbar from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Sparkles, Users, CheckCircle2, Ban, Trash2, RefreshCw, Eraser } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserItem = { 
  id: string;
  username: string; 
  role: string;
  isActive: boolean;
  reputation: number;
  createdAt: string;
};
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

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rationale, setRationale] = useState("");
  const [hints, setHints] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loadingPw, setLoadingPw] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [tickets, setTickets] = useState<ResetTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketPasswords, setTicketPasswords] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data || []);
    } catch {
      // ignore list fetch errors
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/password/requests", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setTickets(data.requests || []);
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTickets();
  }, []);

  const handleGeneratePassword = async () => {
    setLoadingPw(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hints }),
      });
      const data = await res.json();
      setPassword(data.password || "");
      setRationale(data.rationale || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate password");
    } finally {
      setLoadingPw(false);
    }
  };

  const handleCreateUser = async () => {
    setCreating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: role.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create user");
      }
      setMessage(`User "${data.username}" created. Share the password securely: ${password}`);
      setUsername("");
      setHints("");
      setRole("user");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    setError(null);
    setMessage(null);
    const pwd = ticketPasswords[id]?.trim();
    if (!pwd) {
      setError("Enter a new password before approving.");
      return;
    }
    try {
      const res = await fetch("/api/password/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to approve request");
      }
      setMessage(`Reset approved for ${data.username}. New password: ${data.password}`);
      setTicketPasswords((prev) => ({ ...prev, [id]: "" }));
      await fetchTickets();
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to approve request");
    }
  };

  const handleDeny = async (id: string) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/password/deny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to deny request");
      }
      setMessage("Request denied.");
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || "Failed to deny request");
    }
  };

  const handleClearResolved = async () => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/password/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to clear tickets");
      }
      setMessage(`Cleared ${data.removed} resolved/denied tickets.`);
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || "Failed to clear tickets");
    }
  };

  const handleDeleteUser = async (userToDelete: string) => {
    if (!confirm(`Are you sure you want to disable user "${userToDelete}"?`)) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      // Find user ID first
      const user = users.find(u => u.username === userToDelete);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Disable user instead of deleting (safer - preserves data)
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to disable user");
      }
      setMessage(`User "${userToDelete}" has been disabled`);
      await fetchUsers();
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || "Failed to disable user");
    }
  };

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <Topbar title="Admin User Onboarding" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Ops Overview (Admin)</CardTitle>
                <CardDescription>Spot anomalies fast and ensure data pipelines stay clean.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Upload CSVs to validate data quality and review AI summaries.
                </div>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">Open</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Message Interpreter</CardTitle>
                <CardDescription>Turn stakeholder notes into clear action items.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Summarize escalations or rewrite updates for leadership.
                </div>
                <Link href="/interpreter">
                  <Button size="sm" variant="outline">Open</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Image Explainer</CardTitle>
                <CardDescription>Review visual evidence before approving fixes.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Identify components and context for incident reports.
                </div>
                <Link href="/image-id">
                  <Button size="sm" variant="outline">Open</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Create User
                </CardTitle>
                <CardDescription>Onboard users for AI workspace access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jane.doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Password</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Generate or paste password"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePassword}
                      disabled={loadingPw}
                      title="AI-generate password"
                      className="w-full sm:w-auto"
                    >
                      {loadingPw ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {rationale && <p className="text-xs text-gray-500 dark:text-gray-300">Reason: {rationale}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Password hints (optional)</label>
                  <Input
                    value={hints}
                    onChange={(e) => setHints(e.target.value)}
                    placeholder="e.g., prefer symbols, avoid company name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Role</label>
                  <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleCreateUser}
                  disabled={!username || !password || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating user...
                    </>
                  ) : (
                    "Create user"
                  )}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  Admin login remains <code>admin / admin</code>. Only created users can access AI pages.
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Current Users
                </CardTitle>
                <CardDescription>Created accounts (usernames only).</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">No users onboarded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {users.map((u) => (
                      <li
                        key={u.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border px-3 py-2 text-sm text-gray-700 dark:text-gray-100 dark:border-gray-800 gap-2 sm:gap-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{u.username}</span>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
                            <span className={`px-1.5 py-0.5 rounded ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>
                              {u.role}
                            </span>
                            {!u.isActive && (
                              <span className="text-red-500">Inactive</span>
                            )}
                            <span>Rep: {u.reputation}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u.username)}
                            title="Delete user"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Password Reset Tickets
                </CardTitle>
                <CardDescription>Approve or deny user reset requests with optional hints.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleClearResolved}
                    title="Clear resolved/denied tickets"
                  >
                    <Eraser className="h-4 w-4" />
                    Clear resolved
                  </Button>
                </div>
                {loadingTickets ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">No tickets.</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg border p-3 text-sm dark:border-gray-800 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{t.username}</div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              t.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : t.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        {t.hint && (
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Hint: {t.hint}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500">
                          Requested: {new Date(t.createdAt).toLocaleString()}
                          {t.resolvedAt ? ` · Resolved: ${new Date(t.resolvedAt).toLocaleString()}` : ""}
                        </p>
                        {t.status === "resolved" && t.newPassword && (
                          <p className="text-xs text-green-700">
                            New password: <code>{t.newPassword}</code>
                          </p>
                        )}
                        {t.status === "resolved" && t.message && (
                          <p className="text-xs text-gray-600 dark:text-gray-300">Note: {t.message}</p>
                        )}
                        {t.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              placeholder="New password"
                              value={ticketPasswords[t.id] || ""}
                              onChange={(e) =>
                                setTicketPasswords((prev) => ({
                                  ...prev,
                                  [t.id]: e.target.value,
                                }))
                              }
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="gap-2 w-full sm:w-auto"
                              onClick={() => handleApprove(t.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Approve & reset</span>
                              <span className="sm:hidden">Approve</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-2 w-full sm:w-auto"
                              onClick={() => handleDeny(t.id)}
                            >
                              <Ban className="h-4 w-4" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
