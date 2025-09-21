'use server';

/**
 * @fileOverview This file contains a Genkit flow for translating text into Hindi.
 *
 * - translateTextToHindi - A function that translates the input text to Hindi.
 * - TranslateTextToHindiInput - The input type for the translateTextToHindi function.
 * - TranslateTextToHindiOutput - The return type for the translateTextToHindi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextToHindiInputSchema = z.object({
  text: z.string().describe('The text to translate to Hindi.'),
});
export type TranslateTextToHindiInput = z.infer<typeof TranslateTextToHindiInputSchema>;

const TranslateTextToHindiOutputSchema = z.object({
    translatedText: z.string().describe('The translated text in Hindi.')
});
export type TranslateTextToHindiOutput = z.infer<typeof TranslateTextToHindiOutputSchema>;

export async function translateTextToHindi(input: TranslateTextToHindiInput): Promise<TranslateTextToHindiOutput> {
  return translateTextToHindiFlow(input);
}

const translateTextToHindiPrompt = ai.definePrompt({
  name: 'translateTextToHindiPrompt',
  input: {schema: TranslateTextToHindiInputSchema},
  output: {schema: TranslateTextToHindiOutputSchema},
  prompt: `Translate the following text into Hindi:\n\n{{{text}}}`,
});

const translateTextToHindiFlow = ai.defineFlow(
  {
    name: 'translateTextToHindiFlow',
    inputSchema: TranslateTextToHindiInputSchema,
    outputSchema: TranslateTextToHindiOutputSchema,
  },
  async input => {
    const {output} = await translateTextToHindiPrompt(input);
    return output!;
  }
);
