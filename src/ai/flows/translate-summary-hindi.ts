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
import { googleAI } from '@genkit-ai/googleai';
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
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are a professional legal translator. 
  Translate the following summary of a legal document into Hindi.

  ### Translation Requirements:
  1. Accuracy and Clarity
     - Translate all content **faithfully and clearly** into natural, fluent Hindi.
     - Use **appropriate legal terminology** in Hindi where relevant.
     - Do not add or omit any information.

  2. Formatting Preservation
     - Preserve the **original markdown formatting exactly**:
       - Headings (using #)
       - Bullet points (using *)
       - Bold text (using **)
     - Do not change punctuation, numbering, or structure.

  3. Tone and Readability
     - Maintain a **formal and professional tone** suitable for legal summaries.
     - Ensure the translation remains easy to read and understandable.

  ---

  Original Summary:
  {{summary}}`,
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
