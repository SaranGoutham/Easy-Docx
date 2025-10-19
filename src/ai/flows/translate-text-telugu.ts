'use server';

/**
 * @fileOverview A flow to translate text into Telugu.
 *
 * - translateTextToTelugu - A function that handles the translation process.
 * - TranslateTextToTeluguInput - The input type for the translateTextToTelugu function.
 * - TranslateTextToTeluguOutput - The return type for the translateTextToTelugu function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const TranslateTextToTeluguInputSchema = z.object({
  text: z.string().describe('The text to translate to telugu.'),
});
export type TranslateTextToTeluguInput = z.infer<typeof TranslateTextToTeluguInputSchema>;

const TranslateTextToTeluguOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in telugu.'),
});
export type TranslateTextToTeluguOutput = z.infer<typeof TranslateTextToTeluguOutputSchema>;

export async function translateTextToTelugu(input: TranslateTextToTeluguInput): Promise<TranslateTextToTeluguOutput> {
  return translateTextToTeluguFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextToTeluguPrompt',
  input: {schema: TranslateTextToTeluguInputSchema},
  output: {schema: TranslateTextToTeluguOutputSchema},
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `Translate the following text to Telugu: {{{text}}}`,
});

const translateTextToTeluguFlow = ai.defineFlow(
  {
    name: 'translateTextToTeluguFlow',
    inputSchema: TranslateTextToTeluguInputSchema,
    outputSchema: TranslateTextToTeluguOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
