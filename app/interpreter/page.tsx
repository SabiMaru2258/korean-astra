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
  const [result, setResult] = useState<InterpretationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);

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

      if (!response.ok) {
        throw new Error("Failed to interpret document");
      }

      const data = await response.json();
      
      if (mode === "summary") {
        setResult(data);
      } else if (mode === "email" && data.convertedEmail) {
        setResult({ ...result!, convertedEmail: data.convertedEmail });
      } else if (mode === "update" && data.convertedUpdate) {
        setResult({ ...result!, convertedUpdate: data.convertedUpdate });
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
        <div className="container mx-auto px-6 py-8">
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
              {result && (
                <>
                  <Button
                    onClick={() => handleInterpret("email")}
                    disabled={converting === "email"}
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
                    disabled={converting === "update"}
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
                </>
              )}
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Points Explained</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {result.followUpActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Follow-up Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {result.followUpActions.map((action, idx) => (
                      <li key={idx} className="text-gray-700">{action}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.convertedEmail && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Email Version</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {result.convertedEmail}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {result.convertedUpdate && (
              <Card>
                <CardHeader>
                  <CardTitle>Manager-Friendly Update</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {result.convertedUpdate}
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

