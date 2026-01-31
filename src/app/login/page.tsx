"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Microscope, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-lg font-semibold mb-6">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="input-field pl-10"
                  required
                  minLength={4}
                />
              </div>
            </div>

            {loginError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {loginError}
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
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">테스트 계정</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>관리자: admin@research.com / admin1234</p>
              <p>연구원: researcher@research.com / research1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
