"use client";

import { useState, useCallback } from "react";
import {
  Microscope,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import AnalysisResult from "@/components/AnalysisResult";
import PaperList from "@/components/PaperList";
import PaperSummary from "@/components/PaperSummary";
import ResearchPlan from "@/components/ResearchPlan";
import {
  AnalysisResult as AnalysisResultType,
  Paper,
  PaperSummary as PaperSummaryType,
  ResearchPlan as ResearchPlanType,
  FundamentalKnowledge,
} from "@/types";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResultType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [paperSummary, setPaperSummary] = useState<PaperSummaryType | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [researchPlan, setResearchPlan] = useState<ResearchPlanType | null>(null);
  const [fundamentalKnowledge, setFundamentalKnowledge] = useState<FundamentalKnowledge | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const handleFileContent = useCallback((content: string, name: string) => {
    setFileContent(content);
    setFileName(name);
  }, []);

  const clearFile = useCallback(() => {
    setFileContent(null);
    setFileName(null);
  }, []);

  const handleAnalyze = async () => {
    if (!inputText && !fileContent) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setSelectedPaper(null);
    setPaperSummary(null);
    setResearchPlan(null);
    setFundamentalKnowledge(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputText,
          fileContent: fileContent,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePaperClick = async (paper: Paper) => {
    setSelectedPaper(paper);
    setPaperSummary(null);
    setResearchPlan(null);
    setFundamentalKnowledge(null);
    setIsSummarizing(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper }),
      });

      if (!response.ok) throw new Error("Summarization failed");

      const data = await response.json();
      setPaperSummary(data);
    } catch (error) {
      console.error("Summarization error:", error);
      alert("요약 중 오류가 발생했습니다.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handlePlanClick = async () => {
    if (!paperSummary && !analysis) return;

    setIsPlanning(true);
    setResearchPlan(null);
    setFundamentalKnowledge(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: paperSummary,
          analysis: analysis,
        }),
      });

      if (!response.ok) throw new Error("Planning failed");

      const data = await response.json();
      setResearchPlan(data.plan);
      setFundamentalKnowledge(data.fundamentalKnowledge);
    } catch (error) {
      console.error("Planning error:", error);
      alert("계획 수립 중 오류가 발생했습니다.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleReset = () => {
    setInputText("");
    setFileContent(null);
    setFileName(null);
    setAnalysis(null);
    setSelectedPaper(null);
    setPaperSummary(null);
    setResearchPlan(null);
    setFundamentalKnowledge(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Microscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Research Assistant</h1>
              <p className="text-xs text-gray-500">
                생명과학 | 화학 | 식품공학 전문 연구 어시스턴트
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Input Card */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">연구 내용 입력</h2>
              <div className="space-y-4">
                <FileUpload
                  onFileContent={handleFileContent}
                  currentFile={fileName}
                  onClear={clearFile}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    또는 직접 입력
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="연구 주제, 실험 결과, 논문 초록 등을 입력하세요..."
                    className="input-field min-h-[150px] resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!inputText && !fileContent)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 loading-spinner" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        분석 시작
                      </>
                    )}
                  </button>
                  {analysis && (
                    <button onClick={handleReset} className="btn-secondary">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Result */}
            <AnalysisResult analysis={analysis} isLoading={isAnalyzing} />

            {/* Paper List */}
            {analysis && (
              <PaperList
                papers={analysis.recommendations}
                onPaperClick={handlePaperClick}
                selectedPaperId={selectedPaper?.id || null}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Paper Summary */}
            {selectedPaper && (
              <PaperSummary
                paper={selectedPaper}
                summary={paperSummary}
                isLoading={isSummarizing}
                onPlanClick={handlePlanClick}
              />
            )}

            {/* Research Plan */}
            {(isPlanning || researchPlan) && (
              <ResearchPlan
                plan={researchPlan}
                knowledge={fundamentalKnowledge}
                isLoading={isPlanning}
              />
            )}

            {/* Empty State */}
            {!analysis && !isAnalyzing && (
              <div className="card text-center py-16">
                <Microscope className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  연구 내용을 입력해주세요
                </h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  파일을 업로드하거나 텍스트를 입력하면 AI가 분석하여 관련 논문을
                  추천하고 연구 조언을 제공합니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          AI Research Assistant - Powered by Claude AI
        </div>
      </footer>
    </div>
  );
}
