"use client";

import { ResearchPlan as ResearchPlanType, FundamentalKnowledge } from "@/types";
import {
  Target,
  Clock,
  CheckCircle,
  Package,
  BookOpen,
  GraduationCap,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface ResearchPlanProps {
  plan: ResearchPlanType | null;
  knowledge: FundamentalKnowledge | null;
  isLoading: boolean;
}

export default function ResearchPlan({
  plan,
  knowledge,
  isLoading,
}: ResearchPlanProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  if (isLoading) {
    return (
      <div className="card fade-in">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 loading-spinner text-blue-600" />
          <span className="ml-3 text-gray-500">연구 계획 생성 중...</span>
        </div>
      </div>
    );
  }

  if (!plan || !knowledge) {
    return null;
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Research Plan */}
      <div className="card">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          연구 계획
        </h3>

        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-500 mb-2">연구 목표</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            {plan.objective}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-500 mb-3">연구 단계</h4>
          <div className="space-y-3">
            {plan.phases.map((phase, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedPhase(expandedPhase === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-sm">{phase.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {phase.duration}
                    </span>
                    {expandedPhase === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedPhase === index && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          세부 과제
                        </h5>
                        <ul className="space-y-1">
                          {phase.tasks.map((task, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                            >
                              <span className="text-blue-500">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          산출물
                        </h5>
                        <ul className="space-y-1">
                          {phase.deliverables.map((deliverable, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                            >
                              <span className="text-green-500">•</span>
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-2">필요 자원</h4>
            <ul className="space-y-1">
              {plan.resources.map((resource, index) => (
                <li
                  key={index}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                >
                  <span className="text-purple-500">•</span>
                  {resource}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-2">기대 성과</h4>
            <ul className="space-y-1">
              {plan.expectedOutcomes.map((outcome, index) => (
                <li
                  key={index}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                >
                  <span className="text-green-500">•</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Fundamental Knowledge */}
      <div className="card">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-purple-600" />
          필수 기초 지식
        </h3>

        <div className="mb-4">
          <h4 className="font-medium text-sm">{knowledge.topic}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {knowledge.description}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-500 mb-3">핵심 개념</h4>
          <div className="space-y-3">
            {knowledge.concepts.map((concept, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-sm">{concept.term}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {concept.definition}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      중요성: {concept.importance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-500 mb-2">추천 학습 자료</h4>
          <ul className="space-y-1">
            {knowledge.recommendedResources.map((resource, index) => (
              <li
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
              >
                <span className="text-blue-500">•</span>
                {resource}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
