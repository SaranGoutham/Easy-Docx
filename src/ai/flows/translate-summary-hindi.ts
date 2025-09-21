'use server';

/**
 * @fileOverview This file contains a Genkit flow for translating a summary of a legal document into Hindi.
 * It includes the function `translateSummaryToHindi` which takes a summary string as input and returns the translated summary.
 *
 * - translateSummaryToHindi - A function that translates the input summary to Hindi.
 * - TranslateSummaryToHindiInput - The input type for the translateSummaryToHindi function.
 * - TranslateSummaryToHindiOutput - The return type for the translateSummaryToHindi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSummaryToHindiInputSchema = z.object({
  summary: z.string().describe('The summary to translate to Hindi.'),
});
export type TranslateSummaryToHindiInput = z.infer<typeof TranslateSummaryToHindiInputSchema>;

const TranslateSummaryToHindiOutputSchema = z.object({
    translatedText: z.string().describe('The translated summary in Hindi.')
});
export type TranslateSummaryToHindiOutput = z.infer<typeof TranslateSummaryToHindiOutputSchema>;

export async function translateSummaryToHindi(input: TranslateSummaryToHindiInput): Promise<TranslateSummaryToHindiOutput> {
  return translateSummaryToHindiFlow(input);
}

export async function translateSummaryToHindiStream(
  input: TranslateSummaryToHindiInput
) {
  return translateSummaryToHindiPrompt.stream(input);
}

const translateSummaryToHindiPrompt = ai.definePrompt({
  name: 'translateSummaryToHindiPrompt',
  input: {schema: TranslateSummaryToHindiInputSchema},
  output: {schema: TranslateSummaryToHindiOutputSchema},
  prompt: `Translate the following summary of a legal document into Hindi.

Your translation MUST:
- Preserve the original markdown formatting EXACTLY. This includes headings, bullet points (using *), and bold text (using **).
- Be clear, accurate, and use appropriate legal terminology in Hindi where necessary.

Original Summary:
{{{summary}}}`,
});

const translateSummaryToHindiFlow = ai.defineFlow(
  {
    name: 'translateSummaryToHindiFlow',
    inputSchema: TranslateSummaryToHindiInputSchema,
    outputSchema: TranslateSummaryToHindiOutputSchema,
  },
  async input => {
    const {output} = await translateSummaryToHindiPrompt(input);
    return output!;
  }
);
