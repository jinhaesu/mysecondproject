"use client";

import { Upload, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  currentFile: string | null;
  onClear: () => void;
}

export default function FileUpload({
  onFileContent,
  currentFile,
  onClear,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content, file.name);
      };
      reader.readAsText(file);
    },
    [onFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (currentFile) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <FileText className="w-5 h-5 text-blue-600" />
        <span className="flex-1 text-sm font-medium">{currentFile}</span>
        <button
          onClick={onClear}
          className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
        ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }
      `}
    >
      <input
        type="file"
        onChange={handleInputChange}
        className="hidden"
        id="file-upload"
        accept=".txt,.pdf,.doc,.docx,.md"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-gray-400 mt-1">
          지원 형식: TXT, PDF, DOC, DOCX, MD
        </p>
      </label>
    </div>
  );
}
