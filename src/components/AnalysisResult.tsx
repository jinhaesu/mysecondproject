"use client";

import { AnalysisResult as AnalysisResultType } from "@/types";
import {
  FileSearch,
  Tag,
  Lightbulb,
  MessageCircle,
  Loader2,
} from "lucide-react";

interface AnalysisResultProps {
  analysis: AnalysisResultType | null;
  isLoading: boolean;
}

export default function AnalysisResult({
  analysis,
  isLoading,
}: AnalysisResultProps) {
  if (isLoading) {
    return (
      <div className="card fade-in">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 loading-spinner text-blue-600" />
          <span className="ml-3 text-gray-500">AI가 분석 중입니다...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="card fade-in">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <FileSearch className="w-5 h-5 text-blue-600" />
        분석 결과
      </h3>

      <div className="space-y-6">
        {/* Main Field */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {analysis.mainField}
            </span>
            {analysis.subFields.map((field, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h4 className="font-medium text-sm mb-2">요약</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {/* Key Terms */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            핵심 용어
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyTerms.map((term, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            조언
          </h4>
          <ul className="space-y-2">
            {analysis.advice.map((item, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
              >
                <span className="text-yellow-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-500" />
            제언
          </h4>
          <ul className="space-y-2">
            {analysis.suggestions.map((item, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
              >
                <span className="text-green-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
