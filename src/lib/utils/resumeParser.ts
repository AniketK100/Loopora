/**
 * Resume Parser & Text Extractor
 *
 * Handles local text extraction and page counting for PDF files.
 *
 * @module lib/utils/resumeParser
 */

// --- Browser global polyfills for pdfjs-dist (required in Node/serverless) ---
// pdfjs-dist references DOMMatrix, Path2D, CanvasRenderingContext2D, ImageBitmap, etc.
// These are browser globals not present in Node.js serverless runtimes (Vercel).
// We provide minimal polyfills here BEFORE pdfjs-dist is imported.

const G: Record<string, unknown> = globalThis;

if (typeof G.DOMMatrix === "undefined") {
  // Minimal DOMMatrix implementation sufficient for pdfjs-dist text extraction
  // pdfjs-dist uses DOMMatrix for 2D affine transforms (a,b,c,d,e,f properties)
  class DOMMatrix {
    a: number = 1; b: number = 0; c: number = 0; d: number = 1; e: number = 0; f: number = 0;
    m11: number = 1; m12: number = 0; m13: number = 0; m14: number = 0;
    m21: number = 0; m22: number = 1; m23: number = 0; m24: number = 0;
    m31: number = 0; m32: number = 0; m33: number = 1; m34: number = 0;
    m41: number = 0; m42: number = 0; m43: number = 0; m44: number = 1;
    is2D: boolean = true; isIdentity: boolean = true;
    constructor(_init?: string | number[]) { /* no-op for pdfjs use-cases */ }
    translate(): DOMMatrix { return this; }
    scale(): DOMMatrix { return this; }
    rotate(): DOMMatrix { return this; }
    multiply(): DOMMatrix { return this; }
    inverse(): DOMMatrix { return this; }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1, matrixTransform: () => ({ x: 0, y: 0, z: 0, w: 1 }), toJSON: () => ({ x: 0, y: 0, z: 0, w: 1 }) }; }
    toFloat32Array(): Float32Array { return new Float32Array([1,0,0,1,0,0]); }
    toFloat64Array(): Float64Array { return new Float64Array([1,0,0,1,0,0]); }
    toString(): string { return "matrix(1, 0, 0, 1, 0, 0)"; }
  }
  G.DOMMatrix = DOMMatrix;
  G.DOMMatrixReadOnly = DOMMatrix;
}

if (typeof G.Path2D === "undefined") {
  class Path2D { addPath() {} closePath() {} moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {} arc() {} arcTo() {} ellipse() {} rect() {} }
  G.Path2D = Path2D;
}

if (typeof G.CanvasRenderingContext2D === "undefined") {
  // Minimal CanvasRenderingContext2D stub - pdfjs-dist only checks existence
  class CanvasRenderingContext2D {
    canvas: HTMLCanvasElement | null = null;
    fillStyle: string | CanvasGradient | CanvasPattern = "#000";
    strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
    lineWidth: number = 1;
    lineCap: CanvasLineCap = "butt";
    lineJoin: CanvasLineJoin = "miter";
    miterLimit: number = 10;
    font: string = "10px sans-serif";
    textAlign: CanvasTextAlign = "start";
    textBaseline: CanvasTextBaseline = "alphabetic";
    direction: CanvasDirection = "inherit";
    fillRect() {} strokeRect() {} clearRect() {}
    beginPath() {} closePath() {} moveTo() {} lineTo() {}
    bezierCurveTo() {} quadraticCurveTo() {} arc() {} arcTo() {} ellipse() {} rect() {}
    fill() {} stroke() {}
    fillText() {} strokeText() {} measureText() { return { width: 0, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0, fontBoundingBoxAscent: 0, fontBoundingBoxDescent: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 }; }
    save() {} restore() {}
    scale() {} rotate() {} translate() {} transform() {} setTransform() {}
    drawImage() {}
    createLinearGradient() { return { addColorStop() {} }; }
    createRadialGradient() { return { addColorStop() {} }; }
    createPattern() { return null; }
  }
  G.CanvasRenderingContext2D = CanvasRenderingContext2D;
}

if (typeof G.ImageBitmap === "undefined") {
  class ImageBitmap { width = 0; height = 0; close() {} }
  G.ImageBitmap = ImageBitmap;
}

if (typeof G.createImageData === "undefined") {
  G.createImageData = function(sw: number, sh: number): ImageData { 
    return { width: sw, height: sh, data: new Uint8ClampedArray(sw * sh * 4), colorSpace: "srgb" }; 
  };
}

// --- End polyfills ---

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
