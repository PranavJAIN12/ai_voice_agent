"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFilePicker } from "use-file-picker";
import { Loader, Upload, FileText, CheckCircle, XCircle } from "lucide-react";

// Direct API call to OpenAI
const ATSCheck = async (resumeText) => {
  console.log("clicked")
  if (!resumeText) {
    throw new Error("Missing resume text");
  }

  const response = await fetch("/api/ats-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resumeText,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to check ATS score");
  }

  return {
    ats_score: Number(data.ats_score) || 0,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    overall_feedback: data.overall_feedback || "",
  };
};

const AtsScoreCheck = ({ children }) => {
  const [resumeName, setResumeName] = useState("");
  const [resumeData, setResumeData] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [result, setResult] = useState(null);

  const { openFilePicker, filesContent, loading: fileLoading } = useFilePicker({
    accept: [".pdf", ".docx", ".txt"],
    multiple: false,
    readAs: "Text",
  });

  useEffect(() => {
    if (filesContent.length > 0) {
      setResumeName(filesContent[0].name);
      setResumeData(filesContent[0].content);
    }
  }, [filesContent]);

  const onClickCheckATS = async () => {
    if (!resumeData || resumeData.trim().length === 0) {
      alert("Please upload a valid resume first");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const atsResult = await ATSCheck(resumeData);
      setResult(atsResult);
    } catch (error) {
      console.error("ATS Check Error:", error);
      setResult({ 
        error: error.message || "Failed to check ATS score. Please verify your API key and try again.",
        ats_score: 0 
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const resetDialog = () => {
    setResult(null);
    setResumeName("");
    setResumeData("");
  };

  return (
    <Dialog open={openDialog} onOpenChange={(open) => {
      setOpenDialog(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">ATS Score Checker</DialogTitle>
          <DialogDescription>
            Upload your resume and get instant ATS compatibility analysis powered by AI.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold">Upload Resume</label>
              <p className="text-gray-500 text-sm">
                Supported formats: PDF
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <Button
                  onClick={openFilePicker}
                  disabled={fileLoading}
                  variant="outline"
                  className="cursor-pointer"
                >
                  {fileLoading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Choose File
                    </>
                  )}
                </Button>
                
                {resumeName && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-900">
                      ✓ Selected: {resumeName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <DialogClose asChild>
                <Button variant="ghost" className="cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={!resumeData || loading}
                onClick={onClickCheckATS}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check ATS Score
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            {result.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-red-700 text-sm mt-1">{result.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Your ATS Score</p>
                    <div className={`text-6xl font-bold ${getScoreColor(result.ats_score)}`}>
                      {result.ats_score || 0}
                      <span className="text-2xl">/100</span>
                    </div>
                    <p className={`text-lg font-semibold mt-2 ${getScoreColor(result.ats_score)}`}>
                      {getScoreLabel(result.ats_score)}
                    </p>
                  </div>
                </div>

                {result.overall_feedback && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-2">Overall Feedback</h4>
                    <p className="text-sm text-gray-700">{result.overall_feedback}</p>
                  </div>
                )}

                {result.matched_keywords && result.matched_keywords.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Matched Keywords ({result.matched_keywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_keywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.missing_keywords && result.missing_keywords.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Missing Keywords ({result.missing_keywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full border border-yellow-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Improvement Suggestions</h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-blue-900 flex items-start">
                          <span className="font-bold mr-2 mt-0.5">{idx + 1}.</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={resetDialog}
                className="cursor-pointer"
              >
                Check Another Resume
              </Button>
              <DialogClose asChild>
                <Button className="cursor-pointer">Close</Button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AtsScoreCheck;