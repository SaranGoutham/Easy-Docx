'use server';

/**
 * @fileOverview Extracts text from a file using AI.
 *
 * - extractTextFromFile - A function that takes a file as a data URI and returns the extracted text.
 * - ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * - ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import mammoth from 'mammoth';
import JSZip from 'jszip';

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

async function extractTextFromDocx(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value?.trim() ?? '';
}

async function extractTextFromPptx(buffer: Buffer) {
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

    if (mimeType === DOCX_MIME) {
      const text = await extractTextFromDocx(buffer);
      if (text) {
        return { extractedText: text };
      }
    }

    if (mimeType === PPTX_MIME) {
      const text = await extractTextFromPptx(buffer);
      if (text) {
        return { extractedText: text };
      }
    }

    const { text } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-latest'),
      prompt: [
        {
          text: 'You are an expert at extracting text from documents. Please extract all the text from the following file.',
        },
        { media: { url: input.fileDataUri } },
      ],
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      },
    });

    if (!text) {
      throw new Error('Failed to extract text from file.');
    }

    return {
      extractedText: text,
    };
  }
);
