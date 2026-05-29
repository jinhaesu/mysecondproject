import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 연구 계획 수립 전문가입니다.
제공된 논문 요약과 분석 결과를 바탕으로 상세한 연구 계획과 필요한 기초 지식을 제공하세요.

응답은 반드시 다음 JSON 형식으로 제공하세요:
{
  "plan": {
    "objective": "연구의 주요 목표",
    "phases": [
      {
        "name": "단계명",
        "duration": "예상 소요 기간",
        "tasks": ["세부 과제 1", "세부 과제 2"],
        "deliverables": ["산출물 1", "산출물 2"]
      }
    ],
    "resources": ["필요 자원 1", "필요 자원 2"],
    "expectedOutcomes": ["기대 성과 1", "기대 성과 2"]
  },
  "fundamentalKnowledge": {
    "topic": "기초 지식 주제",
    "description": "전반적인 설명",
    "concepts": [
      {
        "term": "용어",
        "definition": "정의",
        "importance": "중요성"
      }
    ],
    "recommendedResources": ["추천 학습 자료 1", "추천 학습 자료 2"]
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const { summary, analysis } = await request.json();

    if (!summary && !analysis) {
      return NextResponse.json(
        { error: "요약 또는 분석 결과가 필요합니다." },
        { status: 400 }
      );
    }

    const prompt = `다음 정보를 바탕으로 연구 계획과 기초 지식을 제공해주세요:

${analysis ? `## 분석 결과
- 주된 분야: ${analysis.mainField}
- 세부 분야: ${analysis.subFields?.join(", ")}
- 핵심 용어: ${analysis.keyTerms?.join(", ")}
- 내용 요약: ${analysis.summary}
` : ""}

${summary ? `## 논문 요약
- 논문 요약: ${summary.summary}
- 주요 발견: ${summary.keyFindings?.join(", ")}
- 연구 방법론: ${summary.methodology}
- 시사점: ${summary.implications}
` : ""}

위 정보를 바탕으로:
1. 체계적인 연구 계획을 수립해주세요
2. 이 연구를 수행하기 위해 알아야 할 기초 지식을 정리해주세요`;

    const { text } = await generateText({
      model: anthropic("claude-opus-4-8"),
      system: SYSTEM_PROMPT,
      prompt: prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 받지 못했습니다.");
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Plan error:", error);
    return NextResponse.json(
      { error: "계획 수립 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
