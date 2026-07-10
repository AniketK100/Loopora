/**
 * Resume Parser & Text Extractor
 *
 * Handles local text extraction and page counting for PDF files.
 *
 * @module lib/utils/resumeParser
 */

// IMPORTANT: Browser global polyfills for pdfjs-dist MUST be applied before
// pdfjs-dist is imported. This is done via the polyfill module side-effect.
import "./pdfPolyfills";

import { PDFParse } from "pdf-parse";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";

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
 * Extracts plain text and computes page count for PDF files.
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

  throw new Error(`Text extraction not supported locally for MIME: ${mimeType}`);
}
