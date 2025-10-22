'use server';

/**
 * @fileOverview Extracts text from a file using AI.
 *
 * - extractTextFromFile - A function that takes a file as a data URI and returns the extracted text.
 * - ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * - ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ocrImage } from '@/ai/lib/tesseract-worker';
// Delay loading heavy PDF tooling until needed on the server.

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file (image, PDF, or Word document) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the provided file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const PDF_MIME = 'application/pdf';

async function extractTextFromDocx(buffer: Buffer) {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.extractRawText({ buffer });
  return result.value?.trim() ?? '';
}

async function extractTextFromPptx(buffer: Buffer) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const slideTexts: string[] = [];

  for (const fileName of slideFiles) {
    const file = zip.file(fileName);
    if (!file) continue;
    const xml = await file.async('string');
    const text = xml
      .replace(/<a:t>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) {
      slideTexts.push(text);
    }
  }

  return slideTexts.join('\n\n');
}

async function extractTextFromImage(buffer: Buffer): Promise<string> {
  return ocrImage(buffer);
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const mod: any = await import('pdf-parse');
  const pdfParse: (buf: Buffer | Uint8Array) => Promise<{ text: string }>
    = (mod?.default ?? mod) as any;
  const { text } = await pdfParse(buffer);
  return text;
}


function decodeDataUri(dataUri: string) {
  const match = dataUri.match(/^data:(.*?);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid file data URI.');
  }
  const [, mimeType, base64] = match;
  return {
    mimeType,
    base64,
    buffer: Buffer.from(base64, 'base64'),
  };
}

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async input => {
    const { mimeType, buffer } = decodeDataUri(input.fileDataUri);
    let extractedText = '';

    if (mimeType === DOCX_MIME) {
      extractedText = await extractTextFromDocx(buffer);
    } else if (mimeType === PPTX_MIME) {
      extractedText = await extractTextFromPptx(buffer);
    } else if (mimeType === PDF_MIME) {
      extractedText = await extractTextFromPdf(buffer);
    } else if (mimeType.startsWith('image/')) {
      extractedText = await extractTextFromImage(buffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (extractedText) {
      return { extractedText };
    }

    throw new Error('Failed to extract text from the file.');
  }
);
