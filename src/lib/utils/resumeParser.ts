/**
 * Resume Parser & Text Extractor
 *
 * Handles local text extraction and page counting for PDF and DOCX files.
 * Rejects DOCX files containing macro files (vbaProject.bin).
 *
 * @module lib/utils/resumeParser
 */

import { PDFParse } from "pdf-parse";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";
import mammoth from "mammoth";

const pdfWorkerPath = path.resolve(
  process.cwd(),
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
);
pdfjs.GlobalWorkerOptions.workerSrc =
  "file:///" + pdfWorkerPath.replace(/\\/g, "/");

export interface ParserResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts plain text and computes page count for PDF/DOCX files.
 *
 * @param buffer Raw binary file contents
 * @param mimeType Server-verified MIME type of the file
 */
export async function extractTextAndPageCount(
  buffer: Buffer,
  mimeType: string
): Promise<ParserResult> {
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const info = await parser.getInfo();
    const pageCount = info?.total ?? 1;
    parser.destroy();
    return { text: textResult.text || "", pageCount };
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // Security check: reject macros
    const binaryString = buffer.toString("utf-8");
    if (binaryString.includes("vbaProject.bin")) {
      throw new Error("DOCX upload rejected: Macro elements detected.");
    }

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || "";

    // Heuristics for page count: ~400 words per page
    const words = text.trim().split(/\s+/).length;
    const pageCount = Math.max(1, Math.ceil(words / 400));

    return { text, pageCount };
  }

  throw new Error(`Text extraction not supported locally for MIME: ${mimeType}`);
}
