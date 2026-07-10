/**
 * Browser Global Polyfills for pdfjs-dist
 *
 * pdfjs-dist references browser globals (DOMMatrix, Path2D, CanvasRenderingContext2D,
 * ImageBitmap, createImageData, etc.) which are not present in Node.js serverless
 * runtimes (Vercel). These minimal polyfills are applied as a side-effect BEFORE
 * pdfjs-dist is imported.
 *
 * This module MUST be imported BEFORE any module that imports pdfjs-dist.
 *
 * @module lib/utils/pdfPolyfills
 */

const G: Record<string, unknown> = globalThis;

if (typeof G.DOMMatrix === "undefined") {
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