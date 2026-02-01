import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 생명과학, 화학, 식품공학 분야의 연구 전략 전문가입니다.
사용자가 제공한 연구 주제에 대해 체계적인 연구 로드맵을 생성해야 합니다.

다음 JSON 형식으로 응답하세요:
{
  "topic": "연구 주제",
  "overview": "연구 개요 및 목표 (2-3문장)",
  "totalDuration": "총 예상 소요 기간 (예: 12-18개월)",
  "phases": [
    {
      "phase": 1,
      "title": "단계 제목",
      "duration": "소요 기간 (예: 2-3개월)",
      "description": "단계 설명",
      "tasks": ["주요 과제1", "주요 과제2", "주요 과제3"],
      "warnings": ["주의사항1", "주의사항2"],
      "deliverables": ["산출물1", "산출물2"]
    }
  ],
  "keyMetrics": [
    {
      "name": "지표명",
      "description": "지표 설명",
      "target": "목표값",
      "measurement": "측정 방법"
    }
  ],
  "planningTips": ["유의사항1", "유의사항2", "유의사항3", "유의사항4"]
}

가이드라인:
1. 단계는 4-6개 정도로 구성
2. 각 단계별 주요 과제는 3-5개
3. 각 단계별 주의사항은 1-2개
4. 핵심 지표는 4-6개
5. 계획 수립 유의사항은 4-6개
6. 실제 연구 현장에서 실행 가능한 구체적인 내용으로 작성
7. 식품/생명과학/화학 분야의 규제, 인허가, 안전성 등을 고려
8. 한국어로 작성`;

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "연구 주제가 필요합니다." },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: `다음 연구 주제에 대한 상세한 연구 로드맵을 생성해주세요:\n\n"${topic}"`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 받지 못했습니다.");
    }

    const roadmap = JSON.parse(jsonMatch[0]);

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Roadmap generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";

    return NextResponse.json(
      { error: `로드맵 생성 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
