"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Topbar from "@/components/Topbar";
import { Loader2, Upload, Trash2 } from "lucide-react";

interface ImageResponse {
  object: string;
  purpose: string;
  role: string;
}

export default function ImageIdPage() {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError(null);
    setResult(null);
    const valid: { file: File; preview: string }[] = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload image files only");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be less than 10MB");
        return;
      }
      const preview = URL.createObjectURL(file);
      valid.push({ file, preview });
    });

    setImages((prev) => [...prev, ...valid]);
    if (selectedIndex === null && valid.length > 0) {
      setSelectedIndex(0);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedIndex === null) return;
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(selectedIndex, 1);
      removed.forEach((img) => URL.revokeObjectURL(img.preview));
      return next;
    });
    setSelectedIndex((idx) => {
      if (idx === null) return null;
      const nextLength = images.length - 1;
      if (nextLength <= 0) return null;
      return Math.min(idx, nextLength - 1);
    });
    setResult(null);
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setSelectedIndex(null);
    setResult(null);
  };

  const handleIdentify = async () => {
    const target =
      selectedIndex !== null ? images[selectedIndex] : images.length > 0 ? images[0] : null;
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const [, data] = res.split(",");
          resolve(data);
        };
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(target.file);
      });

      const response = await fetch("/api/module3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: target.file.type,
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
            {images.length === 0 ? (
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
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={`relative rounded-lg overflow-hidden border transition focus:outline-none ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/50"
                            : "border-gray-300 hover:border-primary/60"
                        }`}
                      >
                        <img
                          src={img.preview}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary">
                    <Upload className="h-4 w-4" />
                    Add more images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveSelected}
                      disabled={selectedIndex === null}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete selected
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={images.length === 0}
                      className="gap-2"
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {images.length > 0 && (
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

