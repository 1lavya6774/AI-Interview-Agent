import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

export const runtime = "nodejs";

// pdf-parse v2 drives pdfjs-dist, which needs an explicit worker source when
// running in Node. The package's "exports" map hides the worker file, so we
// derive it from the package main entry (CJS resolution bypasses the map) and
// fall back to the well-known node_modules path for bundled/turbopack builds.
function resolvePdfWorkerSrc() {
  const candidates = [];
  try {
    const require = createRequire(import.meta.url);
    const mainFile = require.resolve("pdf-parse");
    candidates.push(
      path.join(path.dirname(mainFile), "..", "esm", "pdf.worker.mjs")
    );
  } catch {
    // keep going with the fallback candidates
  }
  candidates.push(
    path.join(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "dist",
      "pdf-parse",
      "esm",
      "pdf.worker.mjs"
    )
  );
  for (const candidate of candidates) {
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return undefined;
}

try {
  const workerSrc = resolvePdfWorkerSrc();
  console.log("[extract-text] resolved pdf worker:", workerSrc);
  if (workerSrc) {
    PDFParse.setWorker(workerSrc);
    console.log(
      "[extract-text] workerSrc set to:",
      PDFParse.setWorker()
    );
  }
} catch (error) {
  console.error("[extract-text] worker config failed:", error.message);
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED = new Set(["txt", "md", "pdf", "docx"]);

export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not read the upload. Try again." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "That file is too large (max 10 MB)." },
      { status: 413 }
    );
  }

  const ext = (String(file.name || "").split(".").pop() || "").toLowerCase();
  if (!SUPPORTED.has(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please use .pdf, .docx, or .txt." },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";
    if (ext === "txt" || ext === "md") {
      text = buffer.toString("utf-8");
    } else if (ext === "pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = result?.text || "";
      } finally {
        await parser.destroy();
      }
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    }

    const clean = text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();

    if (!clean) {
      return NextResponse.json(
        {
          error:
            "No readable text found in that file. Scanned/image-only PDFs aren't supported yet.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: clean, source: file.name });
  } catch (error) {
    console.error("Extract-text error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from that file. Try another one." },
      { status: 500 }
    );
  }
}