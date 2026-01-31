import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { USERS, verificationCodes } from "../route";

// 6자리 인증 코드 생성
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    // 사용자 확인 (이메일만 체크)
    const user = USERS.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "등록되지 않은 이메일입니다." },
        { status: 401 }
      );
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5분 후 만료

    // 저장
    verificationCodes.set(email, {
      code,
      email: user.email,
      userId: user.id,
      userName: user.name,
      expiresAt,
    });

    // 이메일 전송
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "AI Research Assistant <onboarding@resend.dev>",
          to: email,
          subject: "[AI Research Assistant] 로그인 인증 코드",
          html: `
            <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">AI Research Assistant</h2>
              <p style="font-size: 16px; color: #333;">안녕하세요, ${user.name}님!</p>
              <p style="font-size: 16px; color: #333;">로그인 인증 코드입니다:</p>
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #666;">이 코드는 5분 후에 만료됩니다.</p>
              <p style="font-size: 14px; color: #666;">본인이 요청하지 않은 경우, 이 이메일을 무시해주세요.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        console.log(`[DEV] Verification code for ${email}: ${code}`);
      }
    } else {
      // API 키가 없으면 콘솔에 출력
      console.log(`[DEV] Verification code for ${email}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: "인증 코드가 이메일로 전송되었습니다.",
      // 개발 환경에서만 코드 반환 (실제 운영에서는 제거)
      ...(process.env.NODE_ENV === "development" && { devCode: code }),
    });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "인증 코드 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
