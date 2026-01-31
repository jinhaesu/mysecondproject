import { NextRequest, NextResponse } from "next/server";

// 허용된 이메일 목록 (비밀번호 없이 이메일 인증만으로 로그인)
export const USERS = [
  { id: "1", email: "engineer@joinandjoin.com", name: "Engineer" },
  { id: "2", email: "lion9080@joinandjoin.com", name: "Lion" },
  { id: "3", email: "lion9080@gmail.com", name: "Lion (Gmail)" },
];

// 인증 코드 저장소 (실제 환경에서는 Redis 등 사용)
interface VerificationCode {
  code: string;
  email: string;
  userId: string;
  userName: string;
  expiresAt: number;
}

// 메모리 저장소 (서버 재시작 시 초기화됨)
declare global {
  // eslint-disable-next-line no-var
  var verificationCodes: Map<string, VerificationCode>;
}

if (!global.verificationCodes) {
  global.verificationCodes = new Map();
}

export const verificationCodes = global.verificationCodes;

// 이메일 확인 (허용된 이메일인지 체크)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    const user = USERS.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "등록되지 않은 이메일입니다." },
        { status: 401 }
      );
    }

    // 이메일 확인 성공 - 인증 코드 전송 필요
    return NextResponse.json({
      success: true,
      requireVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
