"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogIn, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetHint, setResetHint] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }
      const from = searchParams.get("from");
      const target =
        data.role === "admin" ? "/admin" : from && from !== "/login" ? from : "/dashboard";
      router.replace(target);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, hint: resetHint }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit request");
      }
      setResetMessage(data.message || "Request submitted.");
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 login-aurora">
        <div className="absolute inset-0 pointer-events-none login-aurora-overlay" />
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center relative">
          <div className="space-y-4 text-white drop-shadow-sm animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              AstraSemi Secure Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Sign in to your AI workspace
            </h1>
            <p className="text-base md:text-lg text-white/80">
              Admins onboard teammates and generate secure passwords. Users can jump straight into dashboards, interpreters, and image explainers.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/90">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <ShieldCheck className="h-4 w-4" /> Admin: <code className="text-xs">admin / admin</code>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <ArrowRight className="h-4 w-4" /> Users: use admin-issued credentials
              </span>
            </div>
          </div>

          <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 shadow-2xl border border-white/30 animate-rise-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <LogIn className="h-5 w-5 text-primary" /> Sign in
              </CardTitle>
              <CardDescription>
                Enter your credentials to unlock the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <button
                    type="button"
                    className="underline hover:text-primary"
                    onClick={() => setShowReset((v) => !v)}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
              {showReset && (
                <div className="mt-6 space-y-3 rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Request password reset
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Tell admin who you are and add a hint (optional). A ticket will appear in the admin dashboard for approval.
                  </p>
                  <form className="space-y-3" onSubmit={handleResetRequest}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Username</label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="yourname"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Password hint (optional)</label>
                      <Input
                        value={resetHint}
                        onChange={(e) => setResetHint(e.target.value)}
                        placeholder="e.g., prefer symbols, avoid company name"
                      />
                    </div>
                    {resetMessage && <p className="text-xs text-green-600">{resetMessage}</p>}
                    {error && !loading && <p className="text-xs text-red-600">{error}</p>}
                    <Button type="submit" variant="outline" className="w-full" disabled={resetLoading}>
                      {resetLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending request...
                        </>
                      ) : (
                        "Send reset request"
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
