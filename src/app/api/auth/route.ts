import { NextRequest, NextResponse } from "next/server";

// 실제 운영 환경에서는 데이터베이스와 해시된 비밀번호를 사용해야 합니다
export const USERS = [
  { id: "1", email: "admin@research.com", password: "admin1234", name: "관리자" },
  { id: "2", email: "researcher@research.com", password: "research1234", name: "연구원" },
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

// 이메일/비밀번호 확인만 수행 (실제 로그인 X)
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 1단계: 이메일/비밀번호 확인 성공 - 인증 코드 전송 필요
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
