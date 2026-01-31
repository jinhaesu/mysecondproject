import { NextRequest, NextResponse } from "next/server";
import { verificationCodes } from "../route";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "이메일과 인증 코드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 저장된 인증 코드 확인
    const storedData = verificationCodes.get(email);

    console.log("[DEBUG] verify-code - email:", email);
    console.log("[DEBUG] verify-code - input code:", code);
    console.log("[DEBUG] verify-code - stored data:", storedData);
    console.log("[DEBUG] verify-code - all codes:", Array.from(verificationCodes.entries()));

    if (!storedData) {
      return NextResponse.json(
        { error: "인증 코드가 만료되었거나 존재하지 않습니다. 다시 로그인해주세요." },
        { status: 400 }
      );
    }

    // 만료 확인
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { error: "인증 코드가 만료되었습니다. 다시 로그인해주세요." },
        { status: 400 }
      );
    }

    // 코드 확인
    if (storedData.code !== code) {
      return NextResponse.json(
        { error: "인증 코드가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 인증 성공 - 코드 삭제
    verificationCodes.delete(email);

    // 사용자 정보 반환
    return NextResponse.json({
      success: true,
      user: {
        id: storedData.userId,
        email: storedData.email,
        name: storedData.userName,
      },
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "인증 코드 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
