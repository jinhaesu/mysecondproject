"use client";

import { Paper } from "@/types";
import { BookOpen, ExternalLink, Download } from "lucide-react";

interface PaperListProps {
  papers: Paper[];
  onPaperClick: (paper: Paper) => void;
  selectedPaperId: string | null;
}

export default function PaperList({
  papers,
  onPaperClick,
  selectedPaperId,
}: PaperListProps) {
  const downloadCSV = () => {
    const headers = ["Title", "Authors", "Journal", "Year", "DOI", "Relevance", "URL"];
    const rows = papers.map((paper) => [
      paper.title,
      paper.authors,
      paper.journal,
      paper.year.toString(),
      paper.doi || "",
      paper.relevance,
      paper.url || "",
    ]);

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))].join(
        "\n"
      );

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `recommended_papers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (papers.length === 0) {
    return null;
  }

  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          추천 논문 ({papers.length}편)
        </h3>
        <button
          onClick={downloadCSV}
          className="btn-secondary flex items-center gap-2 text-sm py-2 px-3"
        >
          <Download className="w-4 h-4" />
          CSV 다운로드
        </button>
      </div>
      <div className="space-y-3">
        {papers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => onPaperClick(paper)}
            className={`paper-card p-4 rounded-lg border transition-all ${
              selectedPaperId === paper.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{paper.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {paper.authors}
                </p>
                <p className="text-xs text-gray-400">
                  {paper.journal} ({paper.year})
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {paper.relevance}
                </p>
              </div>
              {paper.url && (
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">
        논문을 클릭하여 상세 요약을 확인하세요
      </p>
    </div>
  );
}
