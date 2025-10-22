/**
 * Singleton Tesseract worker for server-side OCR.
 *
 * Initializes once per process and reuses the worker across calls.
 * Supports configuring paths via env:
 * - TESSERACT_CORE_PATH  (e.g., /var/task/tesseract-core/tesseract-core.wasm)
 * - TESSERACT_LANG_PATH  (directory containing traineddata files)
 * - TESSERACT_WORKER_PATH (URL or path to tesseract.worker.[js|mjs])
 */

import { createWorker } from 'tesseract.js';
import type { Worker as TesseractWorker } from 'tesseract.js';

let workerPromise: Promise<TesseractWorker> | null = null;
let currentLang = 'eng';

function buildWorkerOptions() {
  const opts: Record<string, unknown> = {};
  if (process.env.TESSERACT_CORE_PATH) {
    opts.corePath = process.env.TESSERACT_CORE_PATH;
  }
  if (process.env.TESSERACT_LANG_PATH) {
    opts.langPath = process.env.TESSERACT_LANG_PATH;
  }
  if (process.env.TESSERACT_WORKER_PATH) {
    opts.workerPath = process.env.TESSERACT_WORKER_PATH as string;
  }
  return opts;
}

async function initWorker(lang = 'eng'): Promise<TesseractWorker> {
  const worker = await createWorker(lang, undefined, buildWorkerOptions() as any);
  currentLang = lang;
  return worker as TesseractWorker;
}

export async function getTesseractWorker(lang = 'eng'): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = initWorker(lang);
  }
  const worker = (await workerPromise) as TesseractWorker;
  if (lang !== currentLang) {
    await worker.reinitialize(lang);
    currentLang = lang;
  }
  return worker;
}

export async function ocrImage(buffer: Buffer, lang = 'eng'): Promise<string> {
  const worker = await getTesseractWorker(lang);
  const { data: { text } } = await worker.recognize(buffer);
  return text;
}

// Optional: allow manual cleanup during process shutdown.
export async function terminateTesseractWorker() {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      await worker.terminate();
    } finally {
      workerPromise = null;
    }
  }
}
