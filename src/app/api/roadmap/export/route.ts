import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import PDFDocument from "pdfkit";

interface RoadmapPhase {
  phase: number;
  title: string;
  difficulty: number;
  description: string;
  tasks: string[];
  warnings: string[];
  deliverables: string[];
}

interface KeyMetric {
  name: string;
  description: string;
  target: string;
  measurement: string;
}

interface RoadmapData {
  topic: string;
  overview: string;
  overallDifficulty: number;
  phases: RoadmapPhase[];
  keyMetrics: KeyMetric[];
  planningTips: string[];
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "Very Easy";
  if (difficulty <= 4) return "Easy";
  if (difficulty <= 6) return "Medium";
  if (difficulty <= 8) return "Hard";
  return "Very Hard";
}

async function generatePDF(roadmap: RoadmapData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc.font("Helvetica-Bold").fontSize(24).text("Research Roadmap", { align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(16).text(roadmap.topic, { align: "center" });
    doc.moveDown(1);

    // Overview
    doc.font("Helvetica-Bold").fontSize(14).text("Overview", { underline: true });
    doc.font("Helvetica").fontSize(11).text(roadmap.overview);
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Overall Difficulty: ${roadmap.overallDifficulty}/10 (${getDifficultyLabel(roadmap.overallDifficulty)})`);
    doc.moveDown(1);

    // Phases
    doc.font("Helvetica-Bold").fontSize(14).text("Research Phases", { underline: true });
    doc.moveDown(0.5);

    roadmap.phases.forEach((phase) => {
      doc.font("Helvetica-Bold").fontSize(12).text(`Phase ${phase.phase}: ${phase.title} [Difficulty: ${phase.difficulty}/10]`);
      doc.font("Helvetica").fontSize(10).text(phase.description);
      doc.moveDown(0.3);

      doc.font("Helvetica-Bold").fontSize(10).text("Tasks:");
      doc.font("Helvetica");
      phase.tasks.forEach((task) => {
        doc.fontSize(10).text(`  - ${task}`);
      });
      doc.moveDown(0.3);

      if (phase.warnings.length > 0) {
        doc.font("Helvetica-Bold").fontSize(10).text("Warnings:");
        doc.font("Helvetica");
        phase.warnings.forEach((warning) => {
          doc.fontSize(10).text(`  ! ${warning}`);
        });
        doc.moveDown(0.3);
      }

      doc.font("Helvetica").fontSize(10).text("Deliverables: " + phase.deliverables.join(", "));
      doc.moveDown(0.8);
    });

    // Key Metrics
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(14).text("Key Performance Indicators (KPI)", { underline: true });
    doc.moveDown(0.5);

    roadmap.keyMetrics.forEach((metric) => {
      doc.font("Helvetica-Bold").fontSize(11).text(metric.name);
      doc.font("Helvetica").fontSize(10).text(metric.description);
      doc.fontSize(10).text(`Target: ${metric.target} | Measurement: ${metric.measurement}`);
      doc.moveDown(0.5);
    });

    // Planning Tips
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(14).text("Planning Guidelines", { underline: true });
    doc.moveDown(0.5);

    doc.font("Helvetica");
    roadmap.planningTips.forEach((tip, index) => {
      doc.fontSize(10).text(`${index + 1}. ${tip}`);
      doc.moveDown(0.3);
    });

    doc.end();
  });
}

async function generateDOCX(roadmap: RoadmapData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "연구 로드맵",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(
    new Paragraph({
      text: roadmap.topic,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(new Paragraph({ text: "" }));

  // Overview
  children.push(
    new Paragraph({
      text: "개요",
      heading: HeadingLevel.HEADING_2,
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: roadmap.overview })],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "종합 난이도: ", bold: true }),
        new TextRun({ text: `${roadmap.overallDifficulty}/10 (${getDifficultyLabel(roadmap.overallDifficulty)})` }),
      ],
    })
  );

  children.push(new Paragraph({ text: "" }));

  // Phases
  children.push(
    new Paragraph({
      text: "단계별 연구 계획",
      heading: HeadingLevel.HEADING_2,
    })
  );

  roadmap.phases.forEach((phase) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${phase.phase}단계: ${phase.title}`,
            bold: true,
            size: 26,
          }),
          new TextRun({ text: ` [난이도: ${phase.difficulty}/10]`, italics: true }),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: phase.description })],
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "주요 과제:", bold: true })],
      })
    );

    phase.tasks.forEach((task) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `  • ${task}` })],
        })
      );
    });

    if (phase.warnings.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "주의 사항:", bold: true, color: "FF6600" })],
        })
      );

      phase.warnings.forEach((warning) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `  ⚠ ${warning}`, color: "FF6600" })],
          })
        );
      });
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "산출물: ", bold: true }),
          new TextRun({ text: phase.deliverables.join(", ") }),
        ],
      })
    );

    children.push(new Paragraph({ text: "" }));
  });

  // Key Metrics
  children.push(
    new Paragraph({
      text: "핵심 성과 지표 (KPI)",
      heading: HeadingLevel.HEADING_2,
    })
  );

  const metricRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "지표명", bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "설명", bold: true })] })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "목표", bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "측정 방법", bold: true })] })],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    ...roadmap.keyMetrics.map(
      (metric) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: metric.name })] }),
            new TableCell({ children: [new Paragraph({ text: metric.description })] }),
            new TableCell({ children: [new Paragraph({ text: metric.target })] }),
            new TableCell({ children: [new Paragraph({ text: metric.measurement })] }),
          ],
        })
    ),
  ];

  const metricsTable = new Table({
    rows: metricRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
  });

  children.push(new Paragraph({ text: "" }));

  // Planning Tips
  children.push(
    new Paragraph({
      text: "계획 수립 시 유의사항",
      heading: HeadingLevel.HEADING_2,
    })
  );

  roadmap.planningTips.forEach((tip, index) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${index + 1}. ${tip}` })],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        children: [...children.slice(0, children.indexOf(children.find(c => c === children[children.length - roadmap.planningTips.length - 1])!)), metricsTable, ...children.slice(-roadmap.planningTips.length - 1)],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function POST(request: NextRequest) {
  try {
    const { roadmap, format } = await request.json();

    if (!roadmap || !format) {
      return NextResponse.json(
        { error: "로드맵 데이터와 형식이 필요합니다." },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === "pdf") {
      buffer = await generatePDF(roadmap);
      contentType = "application/pdf";
      filename = `roadmap_${roadmap.topic}.pdf`;
    } else if (format === "docx") {
      buffer = await generateDOCX(roadmap);
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filename = `roadmap_${roadmap.topic}.docx`;
    } else {
      return NextResponse.json({ error: "지원하지 않는 형식입니다." }, { status: 400 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "내보내기 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
