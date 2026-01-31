"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  User,
  Lock,
  X,
  Save,
  Trash2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  BarChart3,
  Tag,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import { ExperimentData, ExperimentAIAnalysis } from "@/types";

type ChartType = "line" | "bar" | "scatter";

export default function DataPage() {
  const [experiments, setExperiments] = useState<ExperimentData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeletePasswordModalOpen, setIsDeletePasswordModalOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentData | null>(null);
  const [experimentToDelete, setExperimentToDelete] = useState<ExperimentData | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [expandedAI, setExpandedAI] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>("line");

  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    topic: "",
    purpose: "",
    managerName: "",
    password: "",
  });
  const [columns, setColumns] = useState<string[]>(["X", "Y"]);
  const [rows, setRows] = useState<Record<string, string>[]>([{ X: "", Y: "" }]);

  useEffect(() => {
    const saved = localStorage.getItem("experiments");
    if (saved) {
      setExperiments(JSON.parse(saved));
    }
  }, []);

  const saveExperiments = (data: ExperimentData[]) => {
    setExperiments(data);
    localStorage.setItem("experiments", JSON.stringify(data));
  };

  const resetForm = () => {
    setFormData({ projectName: "", topic: "", purpose: "", managerName: "", password: "" });
    setColumns(["X", "Y"]);
    setRows([{ X: "", Y: "" }]);
    setSelectedExperiment(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (!formData.projectName || !formData.managerName || !formData.password) {
      alert("프로젝트 이름, 책임자 이름, 비밀번호는 필수입니다.");
      return;
    }

    const now = new Date().toISOString();
    const newExperiment: ExperimentData = {
      id: selectedExperiment?.id || crypto.randomUUID(),
      projectName: formData.projectName,
      topic: formData.topic,
      purpose: formData.purpose,
      managerName: formData.managerName,
      password: formData.password,
      createdAt: selectedExperiment?.createdAt || now,
      updatedAt: now,
      columns,
      rows,
      aiAnalysis: selectedExperiment?.aiAnalysis,
    };

    if (selectedExperiment) {
      saveExperiments(
        experiments.map((e) => (e.id === selectedExperiment.id ? newExperiment : e))
      );
    } else {
      saveExperiments([...experiments, newExperiment]);
    }

    handleCloseModal();
  };

  const handleDeleteClick = (experiment: ExperimentData) => {
    setExperimentToDelete(experiment);
    setPasswordInput("");
    setPasswordError("");
    setIsDeletePasswordModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (experimentToDelete && passwordInput === experimentToDelete.password) {
      saveExperiments(experiments.filter((e) => e.id !== experimentToDelete.id));
      setIsDeletePasswordModalOpen(false);
      setExperimentToDelete(null);
      setPasswordInput("");
    } else {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleOpenExperiment = (experiment: ExperimentData) => {
    setSelectedExperiment(experiment);
    setPasswordInput("");
    setPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (selectedExperiment && passwordInput === selectedExperiment.password) {
      setIsPasswordModalOpen(false);
      setFormData({
        projectName: selectedExperiment.projectName,
        topic: selectedExperiment.topic || "",
        purpose: selectedExperiment.purpose,
        managerName: selectedExperiment.managerName,
        password: selectedExperiment.password,
      });
      setColumns(selectedExperiment.columns);
      setRows(selectedExperiment.rows);
      setIsModalOpen(true);
    } else {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    }
  };

  const addColumn = () => {
    const newCol = `컬럼${columns.length + 1}`;
    setColumns([...columns, newCol]);
    setRows(rows.map((row) => ({ ...row, [newCol]: "" })));
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 2) return;
    const colName = columns[index];
    setColumns(columns.filter((_, i) => i !== index));
    setRows(rows.map((row) => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    }));
  };

  const updateColumnName = (index: number, newName: string) => {
    const oldName = columns[index];
    const newColumns = [...columns];
    newColumns[index] = newName;
    setColumns(newColumns);
    setRows(rows.map((row) => {
      const newRow: Record<string, string> = {};
      Object.keys(row).forEach((key) => {
        if (key === oldName) {
          newRow[newName] = row[key];
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    }));
  };

  const addRow = () => {
    const newRow: Record<string, string> = {};
    columns.forEach((col) => (newRow[col] = ""));
    setRows([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, colName: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [colName]: value };
    setRows(newRows);
  };

  const handleAIAnalysis = async (experiment: ExperimentData) => {
    if (loadingAI) return;

    if (expandedAI === experiment.id && experiment.aiAnalysis) {
      setExpandedAI(null);
      return;
    }

    setExpandedAI(experiment.id);

    if (experiment.aiAnalysis) return;

    setLoadingAI(experiment.id);

    try {
      const response = await fetch("/api/experiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const updatedExperiment = { ...experiment, aiAnalysis: data };
      saveExperiments(
        experiments.map((e) => (e.id === experiment.id ? updatedExperiment : e))
      );
    } catch (error) {
      console.error("AI Analysis error:", error);
      alert("AI 분석 중 오류가 발생했습니다.");
      setExpandedAI(null);
    } finally {
      setLoadingAI(null);
    }
  };

  const toggleChart = (experimentId: string) => {
    setExpandedChart(expandedChart === experimentId ? null : experimentId);
  };

  const getChartData = (experiment: ExperimentData) => {
    return experiment.rows.map((row, index) => {
      const dataPoint: Record<string, number | string> = { index: index + 1 };
      experiment.columns.forEach((col) => {
        const value = parseFloat(row[col]);
        dataPoint[col] = isNaN(value) ? 0 : value;
      });
      return dataPoint;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">실험 데이터 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          실험 데이터를 기록하고 AI 분석을 받아보세요
        </p>
      </div>

      {/* Experiment List */}
      {experiments.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            저장된 실험 데이터가 없습니다
          </h3>
          <p className="text-sm text-gray-400">
            우측 하단의 버튼을 눌러 새 실험 데이터를 기록하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiments.map((experiment) => (
            <div key={experiment.id} className="card p-0 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleOpenExperiment(experiment)}
                >
                  <h3 className="font-semibold">{experiment.projectName}</h3>
                  {experiment.topic && (
                    <div className="flex items-center gap-1 mt-1">
                      <Tag className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {experiment.topic}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {experiment.managerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(experiment.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleChart(experiment.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      expandedChart === experiment.id
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>그래프</span>
                    {expandedChart === experiment.id ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleAIAnalysis(experiment)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      expandedAI === experiment.id
                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                        : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    }`}
                    disabled={loadingAI === experiment.id}
                  >
                    {loadingAI === experiment.id ? (
                      <Loader2 className="w-4 h-4 loading-spinner" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>AI</span>
                    {expandedAI === experiment.id ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(experiment)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart Panel */}
              {expandedChart === experiment.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium">차트 유형:</span>
                    <div className="flex gap-1">
                      {(["line", "bar", "scatter"] as ChartType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            chartType === type
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {type === "line" ? "선형" : type === "bar" ? "막대" : "산점도"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "line" ? (
                        <LineChart data={getChartData(experiment)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {experiment.columns.map((col, i) => (
                            <Line
                              key={col}
                              type="monotone"
                              dataKey={col}
                              stroke={COLORS[i % COLORS.length]}
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      ) : chartType === "bar" ? (
                        <BarChart data={getChartData(experiment)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {experiment.columns.map((col, i) => (
                            <Bar
                              key={col}
                              dataKey={col}
                              fill={COLORS[i % COLORS.length]}
                            />
                          ))}
                        </BarChart>
                      ) : (
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={experiment.columns[0]} name={experiment.columns[0]} />
                          <YAxis dataKey={experiment.columns[1]} name={experiment.columns[1]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                          <Scatter
                            name="데이터"
                            data={getChartData(experiment)}
                            fill="#3B82F6"
                          />
                        </ScatterChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Analysis Panel */}
              {expandedAI === experiment.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-4">
                  {experiment.aiAnalysis ? (
                    <AIAnalysisPanel analysis={experiment.aiAnalysis} />
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 loading-spinner text-purple-600" />
                      <span className="ml-2 text-purple-600">AI가 분석 중입니다...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">실험 데이터 기록하기</span>
      </button>

      {/* Password Modal for Opening */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold">비밀번호 확인</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              이 실험 데이터를 열려면 비밀번호가 필요합니다.
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="비밀번호 입력"
              className="input-field mb-3"
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mb-3">{passwordError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button onClick={handlePasswordSubmit} className="btn-primary flex-1">
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal for Deleting */}
      {isDeletePasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">삭제 확인</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium">{experimentToDelete?.projectName}</span>을(를) 삭제하려면 비밀번호를 입력하세요.
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="비밀번호 입력"
              className="input-field mb-3"
              onKeyDown={(e) => e.key === "Enter" && handleDeleteConfirm()}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mb-3">{passwordError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeletePasswordModalOpen(false);
                  setExperimentToDelete(null);
                  setPasswordInput("");
                }}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experiment Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">
                {selectedExperiment ? "실험 데이터 수정" : "새 실험 데이터 기록"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    프로젝트 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    placeholder="프로젝트 이름 입력"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    책임자 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) =>
                      setFormData({ ...formData, managerName: e.target.value })
                    }
                    placeholder="책임자 이름 입력"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  데이터 주제
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="예: 세포 성장률, pH 변화, 온도별 반응속도 등"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">실험 목적</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder="실험의 목적을 입력하세요"
                  className="input-field min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  비밀번호 * (데이터 열람/삭제 시 필요)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="비밀번호 입력"
                  className="input-field max-w-xs"
                />
              </div>

              {/* Data Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">데이터 테이블</label>
                  <div className="flex gap-2">
                    <button
                      onClick={addColumn}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 열 추가
                    </button>
                    <button
                      onClick={addRow}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 행 추가
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="w-10 p-2 text-center text-xs text-gray-500">#</th>
                        {columns.map((col, i) => (
                          <th key={i} className="p-2 min-w-[120px]">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={col}
                                onChange={(e) => updateColumnName(i, e.target.value)}
                                className="w-full px-2 py-1 text-sm font-medium bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                              />
                              {columns.length > 2 && (
                                <button
                                  onClick={() => removeColumn(i)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="w-10 p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-2 text-center text-xs text-gray-400">
                            {rowIndex + 1}
                          </td>
                          {columns.map((col, colIndex) => (
                            <td key={colIndex} className="p-1">
                              <input
                                type="text"
                                value={row[col] || ""}
                                onChange={(e) =>
                                  updateCell(rowIndex, col, e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            {rows.length > 1 && (
                              <button
                                onClick={() => removeRow(rowIndex)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleCloseModal} className="btn-secondary">
                취소하기
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AIAnalysisPanel({ analysis }: { analysis: ExperimentAIAnalysis }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
          요약
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.summary}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
          데이터 품질
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.dataQuality}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
          주요 인사이트
        </h4>
        <ul className="space-y-1">
          {analysis.insights.map((insight, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
          권장 사항
        </h4>
        <ul className="space-y-1">
          {analysis.recommendations.map((rec, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
