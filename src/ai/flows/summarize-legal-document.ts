'use server';

/**
 * @fileOverview Summarizes a legal document using AI.
 *
 * - summarizeLegalDocument - A function that takes a document as input and returns a summary.
 * - SummarizeLegalDocumentInput - The input type for the summarizeLegalDocument function.
 * - SummarizeLegalDocumentOutput - The return type for the summarizeLegalDocument function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

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
  input: { schema: SummarizeLegalDocumentInputSchema },
  output: { schema: SummarizeLegalDocumentOutputSchema },
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are a legal expert skilled at simplifying complex legal documents. 
  Your task is to summarize the following legal document so that a non-expert can easily understand its content.

  ### Summary Requirements:
  1. Clarity and Simplicity
     - Write in clear, concise, and plain language.
     - Avoid or explain any legal jargon or complex terms.
  
  2. Structure and Readability
     - Organize the summary using headings and subheadings.
     - Use bullet points or numbered lists to outline:
       - Key clauses
       - Main obligations
       - Important dates or deadlines
  
  3. Content Focus
     - Clearly specify each party’s **main rights and obligations**.
     - Highlight important conditions, limitations, or penalties if mentioned.
     - Avoid interpretation beyond the text — summarize only what is stated in the document.

  4. Formatting
     - Use **bold** text to emphasize key terms, section titles, and important details.
     - Maintain logical flow so the summary is easy to follow.

  ---

  Here is the legal document to summarize:
  {{documentText}}`,
});

const summarizeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeLegalDocumentFlow',
    inputSchema: SummarizeLegalDocumentInputSchema,
    outputSchema: SummarizeLegalDocumentOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
