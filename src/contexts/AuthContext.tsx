"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { User } from "@/types";

// 세션 타임아웃 설정 (밀리초)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분 비활성 시 자동 로그아웃
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1분마다 체크

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginError: string | null;
  verifyAndLogin: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const initialized = useRef(false);

  // 로그아웃 처리
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    window.location.href = "/login";
  }, []);

  // 초기 로드 시 사용자 정보 및 세션 확인
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedUser = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");

    if (savedUser && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT) {
        // 세션 만료
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
      } else {
        setUser(JSON.parse(savedUser));
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    }
    setIsLoading(false);
  }, []);

  // 주기적 세션 체크
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed > SESSION_TIMEOUT) {
          alert("보안을 위해 자동 로그아웃 되었습니다. 다시 로그인해주세요.");
          logout();
        }
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, logout]);

  // 사용자 활동 감지
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  // 인증 코드 확인 후 로그인
  const verifyAndLogin = async (email: string, code: string): Promise<boolean> => {
    setLoginError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "인증에 실패했습니다.");
        return false;
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("lastActivity", Date.now().toString());
      return true;
    } catch (error) {
      console.error("Verify login error:", error);
      setLoginError("인증 중 오류가 발생했습니다.");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginError, verifyAndLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
