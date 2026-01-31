import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Research Assistant - 생명과학 | 화학 | 식품공학",
  description: "AI 기반 연구 개발 어시스턴트 - 논문 추천, 분석, 연구 계획 수립",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
