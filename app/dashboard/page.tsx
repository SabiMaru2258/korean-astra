"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Topbar from "@/components/Topbar";
import Papa from "papaparse";
import { Loader2, Upload, FileText } from "lucide-react";

interface CSVData {
  headers: string[];
  rows: any[][];
  rowCount: number;
}

interface SummaryResponse {
  mainPoints: string[];
  importantItems: string[];
  top3Attention: string[];
  dataQualityNotes: string[];
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSummary(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data.slice(0, 10).map((row: any) =>
          headers.map((header) => row[header] || "")
        );
        setCsvData({
          headers,
          rows,
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleGenerateSummary = async () => {
    if (!file || !csvData) return;

    setLoading(true);
    setError(null);

    try {
      // Parse full CSV
      const fullData = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: reject,
        });
      });

      // Sample data if too large (first 100 rows + stats)
      const sampleSize = Math.min(100, fullData.length);
      const sample = fullData.slice(0, sampleSize);

      // Analyze data quality
      const headers = csvData.headers;
      const qualityNotes: string[] = [];
      
      headers.forEach((header) => {
        const emptyCount = fullData.filter((row) => !row[header] || row[header].trim() === "").length;
        if (emptyCount > 0) {
          qualityNotes.push(`Column "${header}" has ${emptyCount} empty cells`);
        }
      });

      if (fullData.length > sampleSize) {
        qualityNotes.push(`Large dataset: showing summary of first ${sampleSize} rows out of ${fullData.length} total`);
      }

      const response = await fetch("/api/module1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: sample,
          headers,
          rowCount: fullData.length,
          qualityNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const result = await response.json();
      setSummary(result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Operations Overview Dashboard" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Upload a CSV file to get an AI-powered summary of your operations data
            </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file from your computer to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload className="h-5 w-5" />
                <span className="text-sm font-medium">Choose File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <span className="text-sm text-gray-600">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {file.name}
                </span>
              )}
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {csvData && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  First 10 rows of your data ({csvData.rowCount} total rows)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {csvData.headers.map((header, idx) => (
                          <th key={idx} className="border border-gray-300 px-3 py-2 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="border border-gray-300 px-3 py-2">
                              {cell || <span className="text-gray-400">(empty)</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <Button
                onClick={handleGenerateSummary}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </div>
          </>
        )}

        {summary && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {summary.mainPoints.map((point, idx) => (
                    <li key={idx} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important or Unusual Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {summary.importantItems.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 3 Things to Pay Attention To</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {summary.top3Attention.map((item, idx) => (
                    <li key={idx} className="text-gray-700 font-medium">{item}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.dataQualityNotes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {summary.dataQualityNotes.map((note, idx) => (
                      <li key={idx} className="text-gray-700">{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No data quality issues detected</p>
                )}
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

