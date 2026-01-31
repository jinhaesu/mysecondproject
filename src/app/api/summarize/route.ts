import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 학술 논문 요약 전문가입니다.
제공된 논문 정보를 바탕으로 상세한 요약을 제공하세요.

응답은 반드시 다음 JSON 형식으로 제공하세요:
{
  "paperId": "논문 ID",
  "summary": "논문의 전체적인 요약 (3-5문장)",
  "keyFindings": ["주요 발견 1", "주요 발견 2", "주요 발견 3"],
  "methodology": "사용된 연구 방법론 설명",
  "implications": "이 연구의 시사점 및 실질적 의미"
}`;

export async function POST(request: NextRequest) {
  try {
    const { paper } = await request.json();

    if (!paper) {
      return NextResponse.json(
        { error: "논문 정보가 필요합니다." },
        { status: 400 }
      );
    }

    const prompt = `다음 논문을 요약해주세요:

제목: ${paper.title}
저자: ${paper.authors}
저널: ${paper.journal}
연도: ${paper.year}
DOI: ${paper.doi || "N/A"}
관련성: ${paper.relevance}
초록: ${paper.abstract || "제공되지 않음"}

이 논문의 ID는 "${paper.id}"입니다.`;

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 받지 못했습니다.");
    }

    const summary = JSON.parse(jsonMatch[0]);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: "요약 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
