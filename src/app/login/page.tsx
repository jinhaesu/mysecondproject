"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Microscope, Mail, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type LoginStep = "email" | "verification";

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const { verifyAndLogin } = useAuth();
  const router = useRouter();

  // 1단계: 이메일 확인 및 인증 코드 전송
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      // 개발 환경에서 코드 표시
      if (data.devCode) {
        setDevCode(data.devCode);
      }

      // 2단계로 이동
      setStep("verification");
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(`로그인 중 오류: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 인증 코드 확인
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await verifyAndLogin(email, verificationCode);
      if (success) {
        router.push("/");
      } else {
        setError("인증 코드가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 코드 재전송
  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "코드 재전송에 실패했습니다.");
        return;
      }

      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setError(null);
      alert("인증 코드가 재전송되었습니다.");
    } catch (err) {
      console.error("Resend error:", err);
      setError("코드 재전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 처음으로 돌아가기
  const handleBack = () => {
    setStep("email");
    setVerificationCode("");
    setError(null);
    setDevCode(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4">
            <Microscope className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">AI Research Assistant</h1>
          <p className="text-sm text-gray-500 mt-2">
            생명과학 | 화학 | 식품공학 전문 연구 어시스턴트
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          {step === "email" ? (
            <>
              <h2 className="text-lg font-semibold mb-6">로그인</h2>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    등록된 이메일로 인증 코드가 전송됩니다.
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 loading-spinner" />
                      전송 중...
                    </>
                  ) : (
                    "인증 코드 받기"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">이메일 인증</h2>
              </div>

              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{email}</strong>로 6자리 인증 코드를 전송했습니다.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  이메일을 확인하고 인증 코드를 입력해주세요.
                </p>
              </div>

              {devCode && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                    [개발 모드] 인증 코드: <span className="font-mono text-lg">{devCode}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">인증 코드</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6자리 인증 코드"
                      className="input-field pl-10 text-center text-2xl tracking-widest font-mono"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 loading-spinner" />
                      인증 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  인증 코드 재전송
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
