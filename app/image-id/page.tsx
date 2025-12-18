"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Topbar from "@/components/Topbar";
import { Loader2, Upload, X } from "lucide-react";

interface ImageResponse {
  object: string;
  purpose: string;
  role: string;
}

export default function ImageIdPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleIdentify = async () => {
    if (!file || !preview) return;

    setLoading(true);
    setError(null);

    try {
      // Convert to base64
      const base64 = preview.split(",")[1];

      const response = await fetch("/api/module3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to identify image");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Image Explainer" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 mb-8">
              Upload an image to identify semiconductor components and understand their purpose
            </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image file from your computer (JPG, PNG, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
                <Button
                  onClick={handleRemoveFile}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {preview && (
          <div className="mb-6">
            <Button
              onClick={handleIdentify}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Identifying...
                </>
              ) : (
                "Identify & Explain"
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What This Is</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{result.object}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What It's Used For</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{result.purpose}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role in Semiconductor Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{result.role}</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 italic">
                  This explanation is general and not a technical assessment.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
          </div>
        </div>
      </div>
    </>
  );
}

