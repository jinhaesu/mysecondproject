"use client";

import { Paper, PaperSummary as PaperSummaryType } from "@/types";
import { FileText, Lightbulb, FlaskConical, Target, Loader2 } from "lucide-react";

interface PaperSummaryProps {
  paper: Paper;
  summary: PaperSummaryType | null;
  isLoading: boolean;
  onPlanClick: () => void;
}

export default function PaperSummary({
  paper,
  summary,
  isLoading,
  onPlanClick,
}: PaperSummaryProps) {
  return (
    <div className="card fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            논문 요약
          </h3>
          <p className="text-sm text-gray-500 mt-1">{paper.title}</p>
        </div>
        {summary && (
          <button
            onClick={onPlanClick}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Target className="w-4 h-4" />
            Plan 생성
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 loading-spinner text-blue-600" />
          <span className="ml-3 text-gray-500">요약 생성 중...</span>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              요약
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {summary.summary}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              주요 발견
            </h4>
            <ul className="space-y-2">
              {summary.keyFindings.map((finding, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-500" />
              연구 방법론
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {summary.methodology}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              시사점
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {summary.implications}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
