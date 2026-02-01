"use client";

import { useState } from "react";
import {
  Send,
  Loader2,
  Download,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Gauge,
} from "lucide-react";

interface RoadmapPhase {
  phase: number;
  title: string;
  difficulty: number;
  description: string;
  tasks: string[];
  warnings: string[];
  deliverables: string[];
}

interface KeyMetric {
  name: string;
  description: string;
  target: string;
  measurement: string;
}

interface RoadmapData {
  topic: string;
  overview: string;
  overallDifficulty: number;
  phases: RoadmapPhase[];
  keyMetrics: KeyMetric[];
  planningTips: string[];
}

function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return "bg-green-500";
  if (difficulty <= 6) return "bg-yellow-500";
  return "bg-red-500";
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "매우 쉬움";
  if (difficulty <= 4) return "쉬움";
  if (difficulty <= 6) return "보통";
  if (difficulty <= 8) return "어려움";
  return "매우 어려움";
}

export default function RoadmapPage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setRoadmap(null);

    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!response.ok) throw new Error("Failed to generate roadmap");

      const data = await response.json();
      setRoadmap(data);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      alert("로드맵 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!roadmap || isExporting) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/roadmap/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmap, format }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `연구로드맵_${roadmap.topic}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("내보내기 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          연구 로드맵 수립
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          연구 주제를 입력하면 AI가 단계별 연구 계획과 핵심 지표를 제안합니다.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          연구 주제
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 식물성 단백질 기반 육류 대체 식품 개발"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                로드맵 생성
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">연구 로드맵을 생성하고 있습니다...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">잠시만 기다려주세요</p>
        </div>
      )}

      {/* Roadmap Result */}
      {roadmap && !isGenerating && (
        <div className="space-y-8">
          {/* Export Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF 다운로드
            </button>
            <button
              onClick={() => handleExport("docx")}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              DOCX 다운로드
            </button>
          </div>

          {/* Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">{roadmap.topic}</h2>
            <p className="text-blue-100 mb-4">{roadmap.overview}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span>종합 난이도:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-6 rounded-sm ${
                        i < roadmap.overallDifficulty
                          ? getDifficultyColor(roadmap.overallDifficulty)
                          : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold">{roadmap.overallDifficulty}/10</span>
                <span className="text-blue-200">({getDifficultyLabel(roadmap.overallDifficulty)})</span>
              </div>
            </div>
          </div>

          {/* Phases Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              단계별 연구 계획
            </h3>

            <div className="space-y-6">
              {roadmap.phases.map((phase, index) => (
                <div key={phase.phase} className="relative">
                  {/* Connector Line */}
                  {index < roadmap.phases.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                  )}

                  <div className="flex gap-4">
                    {/* Phase Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg z-10">
                      {phase.phase}
                    </div>

                    {/* Phase Content */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                          {phase.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-4 rounded-sm ${
                                  i < phase.difficulty
                                    ? getDifficultyColor(phase.difficulty)
                                    : "bg-gray-200 dark:bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {phase.difficulty}/10
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {phase.description}
                      </p>

                      {/* Tasks */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          주요 과제
                        </h5>
                        <ul className="space-y-1">
                          {phase.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Warnings */}
                      {phase.warnings.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            주의 사항
                          </h5>
                          <ul className="space-y-1">
                            {phase.warnings.map((warning, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Deliverables */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                          <FileText className="w-4 h-4 text-blue-500" />
                          산출물
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {phase.deliverables.map((deliverable, i) => (
                            <span key={i} className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300">
                              {deliverable}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              핵심 성과 지표 (KPI)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.keyMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {metric.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {metric.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-500">목표:</span>
                      <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">{metric.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-500">측정:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{metric.measurement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planning Tips */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              계획 수립 시 유의사항
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.planningTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
