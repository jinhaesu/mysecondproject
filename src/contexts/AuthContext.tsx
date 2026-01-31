"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 로그아웃 처리
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
  }, []);

  // 활동 시간 업데이트
  const updateActivity = useCallback(() => {
    if (user) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
  }, [user]);

  // 세션 만료 체크
  const checkSessionExpiry = useCallback(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT) {
        logout();
        alert("보안을 위해 자동 로그아웃 되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
        return true;
      }
    }
    return false;
  }, [logout]);

  // 초기 로드 시 사용자 정보 및 세션 확인
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      // 세션 만료 확인
      if (!checkSessionExpiry()) {
        setUser(JSON.parse(savedUser));
        updateActivity();
      }
    }
    setIsLoading(false);
  }, [checkSessionExpiry, updateActivity]);

  // 주기적 세션 체크
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSessionExpiry();
    }, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, checkSessionExpiry]);

  // 사용자 활동 감지 (마우스, 키보드, 터치, 스크롤)
  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, updateActivity]);

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
    <AuthContext.Provider value={{ user, isLoading, loginError, verifyAndLogin, logout, updateActivity }}>
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
