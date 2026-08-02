import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `당신은 생명과학, 화학, 식품공학 분야의 실험 데이터 분석 전문가입니다.
제공된 실험 데이터를 분석하고 다음을 제공해야 합니다:

1. 데이터 요약
2. 데이터 품질 평가
3. 주요 인사이트 (패턴, 경향, 이상치 등)
4. 권장 사항 및 개선점

응답은 반드시 다음 JSON 형식으로 제공하세요:
{
  "summary": "실험 데이터에 대한 전반적인 요약",
  "dataQuality": "데이터 품질에 대한 평가",
  "insights": ["인사이트1", "인사이트2", "인사이트3"],
  "recommendations": ["권장사항1", "권장사항2", "권장사항3"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { experiment } = await request.json();

    if (!experiment) {
      return NextResponse.json(
        { error: "실험 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    const dataDescription = `
프로젝트: ${experiment.projectName}
목적: ${experiment.purpose || "명시되지 않음"}
책임자: ${experiment.managerName}

데이터 컬럼: ${experiment.columns.join(", ")}

데이터 행:
${experiment.rows
  .map(
    (row: Record<string, string>, i: number) =>
      `${i + 1}. ${experiment.columns.map((col: string) => `${col}: ${row[col] || "N/A"}`).join(", ")}`
  )
  .join("\n")}
`;

    const { text } = await generateText({
      model: anthropic("claude-fable-5"),
      system: SYSTEM_PROMPT,
      prompt: `다음 실험 데이터를 분석해주세요:\n\n${dataDescription}`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 받지 못했습니다.");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Experiment analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";

    if (errorMessage.includes("API key") || errorMessage.includes("authentication") || errorMessage.includes("401")) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았거나 유효하지 않습니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `분석 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
