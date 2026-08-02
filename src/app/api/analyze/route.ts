import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 생명과학, 화학, 식품공학 분야의 연구개발 전문가입니다.
사용자가 제공한 내용을 분석하고 다음을 제공해야 합니다:

1. 내용 요약 및 분석
2. 주된 연구 분야 식별 (생명과학, 화학, 식품공학 중)
3. 관련 세부 분야들
4. 핵심 용어들
5. 관련 논문 추천 (실제 존재하는 논문 형식으로, 각 논문에 대해 제목, 저자, 저널, 연도, DOI, 관련성 설명 포함)
6. 연구에 대한 조언
7. 추가 제언

응답은 반드시 다음 JSON 형식으로 제공하세요:
{
  "summary": "내용 요약",
  "mainField": "주된 분야",
  "subFields": ["세부 분야1", "세부 분야2"],
  "keyTerms": ["용어1", "용어2"],
  "recommendations": [
    {
      "id": "고유ID",
      "title": "논문 제목",
      "authors": "저자들",
      "journal": "저널명",
      "year": 2024,
      "doi": "10.xxxx/xxxxx",
      "relevance": "관련성 설명",
      "url": "논문 URL"
    }
  ],
  "advice": ["조언1", "조언2"],
  "suggestions": ["제언1", "제언2"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { content, fileContent } = await request.json();

    const userContent = fileContent
      ? `파일 내용:\n${fileContent}\n\n추가 설명:\n${content || "없음"}`
      : content;

    if (!userContent) {
      return NextResponse.json(
        { error: "분석할 내용이 필요합니다." },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: anthropic("claude-fable-5"),
      system: SYSTEM_PROMPT,
      prompt: userContent,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 받지 못했습니다.");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";

    if (errorMessage.includes("API key") || errorMessage.includes("authentication") || errorMessage.includes("401")) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았거나 유효하지 않습니다. .env.local 파일에 ANTHROPIC_API_KEY를 설정해주세요." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `분석 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
