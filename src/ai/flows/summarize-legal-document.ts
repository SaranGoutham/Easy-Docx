'use server';

/**
 * @fileOverview Summarizes a legal document using AI.
 *
 * - summarizeLegalDocument - A function that takes a document as input and returns a summary.
 * - SummarizeLegalDocumentInput - The input type for the summarizeLegalDocument function.
 * - SummarizeLegalDocumentOutput - The return type for the summarizeLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const SummarizeLegalDocumentInputSchema = z.object({
  documentText: z.string().describe('The text content of the legal document to summarize.'),
});
export type SummarizeLegalDocumentInput = z.infer<typeof SummarizeLegalDocumentInputSchema>;

const SummarizeLegalDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key points in the legal document.'),
});
export type SummarizeLegalDocumentOutput = z.infer<typeof SummarizeLegalDocumentOutputSchema>;

export async function summarizeLegalDocument(input: SummarizeLegalDocumentInput): Promise<SummarizeLegalDocumentOutput> {
  return summarizeLegalDocumentFlow(input);
}

export async function summarizeLegalDocumentStream(
  input: SummarizeLegalDocumentInput
) {
  return prompt.stream(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLegalDocumentPrompt',
  input: {schema: SummarizeLegalDocumentInputSchema},
  output: {schema: SummarizeLegalDocumentOutputSchema},
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are a legal expert skilled at simplifying complex documents. Summarize the following legal document for a non-expert.

Your summary MUST:
- Be clear, concise, and easy to understand.
- Use simple language and avoid legal jargon.
- Use bullet points or numbered lists for key clauses, obligations, and dates.
- Use headings and bold text to structure the information logically.

Here is the document:
{{{documentText}}}`,
});

const summarizeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeLegalDocumentFlow',
    inputSchema: SummarizeLegalDocumentInputSchema,
    outputSchema: SummarizeLegalDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
