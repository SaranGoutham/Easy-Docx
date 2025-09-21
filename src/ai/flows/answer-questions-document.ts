'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering questions about a legal document.
 *
 * It includes the flow definition, input and output schemas, and a wrapper function
 * to facilitate easy use within the Next.js application.
 *
 * @exports answerQuestionsAboutDocument - A function to answer questions about a document.
 * @exports AnswerQuestionsAboutDocumentInput - The input type for the answerQuestionsAboutDocument function.
 * @exports AnswerQuestionsAboutDocumentOutput - The return type for the answerQuestionsAboutDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document.'),
  question: z.string().describe('The question to be answered about the document.'),
  previousAnswer: z.string().optional().describe('The previous answer in the conversation, if any.'),
  targetLanguage: z.enum(['English', 'Hindi', 'Telugu']).default('English').describe('The language in which the answer should be generated.'),
});
export type AnswerQuestionsAboutDocumentInput = z.infer<
  typeof AnswerQuestionsAboutDocumentInputSchema
>;

const AnswerQuestionsAboutDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the document content.'),
});
export type AnswerQuestionsAboutDocumentOutput = z.infer<
  typeof AnswerQuestionsAboutDocumentOutputSchema
>;

export async function answerQuestionsAboutDocument(
  input: AnswerQuestionsAboutDocumentInput
): Promise<AnswerQuestionsAboutDocumentOutput> {
  return answerQuestionsAboutDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutDocumentPrompt',
  input: {
    schema: AnswerQuestionsAboutDocumentInputSchema,
  },
  output: {
    schema: AnswerQuestionsAboutDocumentOutputSchema,
  },
  prompt: `You are a legal expert. The user is asking a question in {{targetLanguage}}. Your answer MUST be entirely in {{targetLanguage}}.

Based on the provided legal document, answer the user's question.

Your answer MUST BE:
- Clear, direct, and easy to understand for a non-expert.
- Use bullet points or numbered lists for detailed explanations.
- Use bold text to highlight key terms or figures.
- Preserve any markdown formatting from the document.

Legal Document:
{{documentText}}

Question: {{question}}

Previous Answer (if any): {{previousAnswer}}

Answer in {{targetLanguage}}:`,
});

const answerQuestionsAboutDocumentFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutDocumentFlow',
    inputSchema: AnswerQuestionsAboutDocumentInputSchema,
    outputSchema: AnswerQuestionsAboutDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
