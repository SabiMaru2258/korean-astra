"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Topbar from "@/components/Topbar";
import { Loader2 } from "lucide-react";

interface InterpretationResponse {
  summary: string;
  keyPoints: string[];
  followUpActions: string[];
  convertedEmail?: string;
  convertedUpdate?: string;
}

export default function InterpreterPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<InterpretationResponse | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [updateDraft, setUpdateDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState<"email" | "update" | null>(null);

  const openEmailClient = (body: string) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent("Draft email")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleInterpret = async (mode: "summary" | "email" | "update" = "summary") => {
    if (!text.trim()) {
      setError("Please enter some text to interpret");
      return;
    }

    if (text.length > 10000) {
      setError("Text is too long. Please keep it under 10,000 characters.");
      return;
    }

    setLoading(mode === "summary");
    setConverting(mode !== "summary" ? mode : null);
    setError(null);

    try {
      const response = await fetch("/api/module2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to interpret document");
      }
      
      if (mode === "summary") {
        setSummaryResult({
          summary: data.summary,
          keyPoints: data.keyPoints || [],
          followUpActions: data.followUpActions || [],
          convertedEmail: data.convertedEmail,
          convertedUpdate: data.convertedUpdate,
        });
        if (data.convertedEmail) setEmailDraft(data.convertedEmail);
        if (data.convertedUpdate) setUpdateDraft(data.convertedUpdate);
      } else if (mode === "email" && data.convertedEmail) {
        setEmailDraft(data.convertedEmail);
        openEmailClient(data.convertedEmail);
      } else if (mode === "update" && data.convertedUpdate) {
        setUpdateDraft(data.convertedUpdate);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
      setConverting(null);
    }
  };

  return (
    <>
      <Topbar title="Message Interpreter" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 mb-8">
              Paste technical documents or notes to get clear summaries and actionable insights
            </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Document Text</CardTitle>
            <CardDescription>
              Paste your document, notes, or any text you'd like to understand better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your document here..."
              className="min-h-[200px] mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleInterpret("summary")}
                disabled={loading || !text.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
              <Button
                onClick={() => handleInterpret("email")}
                disabled={converting === "email" || !text.trim()}
                variant="outline"
              >
                {converting === "email" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to Email"
                )}
              </Button>
              <Button
                onClick={() => handleInterpret("update")}
                disabled={converting === "update" || !text.trim()}
                variant="outline"
              >
                {converting === "update" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to Update"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {(summaryResult || emailDraft || updateDraft) && (
          <div className="space-y-6">
            {summaryResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{summaryResult.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Points Explained</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {summaryResult.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {summaryResult.followUpActions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggested Follow-up Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {summaryResult.followUpActions.map((action, idx) => (
                          <li key={idx} className="text-gray-700">{action}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {emailDraft && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Email Version</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded border dark:bg-gray-900">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-100">
                      {emailDraft}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {updateDraft && (
              <Card>
                <CardHeader>
                  <CardTitle>Manager-Friendly Update</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded border dark:bg-gray-900">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-100">
                      {updateDraft}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </>
  );
}

