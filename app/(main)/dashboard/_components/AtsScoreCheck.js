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

// Direct API call to Gemini
const ATSCheck = async (prompt, msg) => {
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_KEY;
const GEMINI_MODEL = "gemini-2.0-flash"; // You can change this to "gemini-2.0-flash" if needed
  if (!prompt || !msg) {
    console.error("Missing required parameter(s):", { prompt, msg });
    throw new Error("Missing required parameters");
  }

  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: prompt },
          { text: msg }
        ]
      }
    ]
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Failed to fetch ATS result");
    }

    const data = await response.json();
    console.log("Gemini API result:", data);

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse ATS JSON
    let atsResult;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       rawText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : rawText.trim();
      
      atsResult = JSON.parse(jsonText);
      
      // Validate structure
      if (typeof atsResult.ats_score !== 'number') {
        atsResult.ats_score = parseInt(atsResult.ats_score) || 0;
      }
      if (!Array.isArray(atsResult.matched_keywords)) {
        atsResult.matched_keywords = [];
      }
      if (!Array.isArray(atsResult.missing_keywords)) {
        atsResult.missing_keywords = [];
      }
      if (!Array.isArray(atsResult.suggestions)) {
        atsResult.suggestions = [];
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      atsResult = { 
        ats_score: 0, 
        matched_keywords: [], 
        missing_keywords: [], 
        suggestions: [rawText.substring(0, 500)],
        overall_feedback: "Unable to parse response properly"
      };
    }

    return atsResult;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
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

      const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.  
Analyze the following resume and provide a comprehensive ATS compatibility assessment.  

Evaluation Criteria:  
1. Format compatibility (simple formatting, readable fonts, proper sections)  
2. Keyword optimization (role- and industry-relevant terms, skills, technologies, or experiences)  
3. Structure and organization (clear sections, bullet points, dates)  
4. Content quality (achievements, quantifiable results, clarity)  
5. Contact information and professional summary  

Important Instructions:  
- Respond ONLY in valid JSON format (no markdown, no extra text, no explanations).  
- Follow the exact key names below.  
- Do not include comments, escape characters, or additional fields.  
- Ensure ats_score is an integer between 0 and 100.

Output JSON format:
{
  "ats_score": 85,
  "suggestions": [
    "Add measurable achievements to strengthen impact",
    "Use consistent date formatting across all roles",
    "Include more industry-specific keywords to align with job descriptions",
    "Consider adding a professional summary at the top"
  ],
  "overall_feedback": "The resume is strong in formatting and readability but would benefit from more quantifiable results and role-specific keywords."
}

Resume to analyze:
`;

      const atsResult = await ATSCheck(prompt, resumeData);
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