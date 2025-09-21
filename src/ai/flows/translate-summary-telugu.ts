'use server';

/**
 * @fileOverview A flow to translate the summarized legal document into Telugu.
 *
 * - translateSummaryToTelugu - A function that handles the translation process.
 * - TranslateSummaryToTeluguInput - The input type for the translateSummaryToTelugu function.
 * - TranslateSummaryToTeluguOutput - The return type for the translateSummaryToTelugu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSummaryToTeluguInputSchema = z.object({
  text: z.string().describe('The text to translate to telugu.'),
});
export type TranslateSummaryToTeluguInput = z.infer<typeof TranslateSummaryToTeluguInputSchema>;

const TranslateSummaryToTeluguOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in telugu.'),
});
export type TranslateSummaryToTeluguOutput = z.infer<typeof TranslateSummaryToTeluguOutputSchema>;

export async function translateSummaryToTelugu(input: TranslateSummaryToTeluguInput): Promise<TranslateSummaryToTeluguOutput> {
  return translateSummaryToTeluguFlow(input);
}

export async function translateSummaryToTeluguStream(
  input: TranslateSummaryToTeluguInput
) {
  return prompt.stream(input);
}

const prompt = ai.definePrompt({
  name: 'translateSummaryToTeluguPrompt',
  input: {schema: TranslateSummaryToTeluguInputSchema},
  output: {schema: TranslateSummaryToTeluguOutputSchema},
  prompt: `Translate the following summary of a legal document into Telugu.

Your translation MUST:
- Preserve the original markdown formatting EXACTLY. This includes headings, bullet points (using *), and bold text (using **).
- Be clear, accurate, and use appropriate legal terminology in Telugu where necessary.

Original Summary:
{{{text}}}`,
});

const translateSummaryToTeluguFlow = ai.defineFlow(
  {
    name: 'translateSummaryToTeluguFlow',
    inputSchema: TranslateSummaryToTeluguInputSchema,
    outputSchema: TranslateSummaryToTeluguOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
