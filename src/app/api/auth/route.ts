import { NextRequest, NextResponse } from "next/server";

// 실제 운영 환경에서는 데이터베이스와 해시된 비밀번호를 사용해야 합니다
const USERS = [
  { id: "1", email: "admin@research.com", password: "admin1234", name: "관리자" },
  { id: "2", email: "researcher@research.com", password: "research1234", name: "연구원" },
];

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

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
