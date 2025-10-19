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
import { googleAI } from '@genkit-ai/googleai';
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
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are a legal expert. The user is asking a question in {{targetLanguage}}. 
  Your response must be written entirely in {{targetLanguage}}.

  You will receive a legal document and a user question. 
  Your task is to provide an answer based strictly on the content of the provided document.

  ### Response Requirements:
  1. Clarity and Simplicity
     - Write in a clear, direct, and easy-to-understand manner.
     - Avoid complex legal jargon unless it is necessary, and define it if used.

  2. Structure and Formatting
     - Organize your answer using bullet points or numbered lists when presenting multiple ideas or steps.
     - Use **bold** text to highlight:
       - Key legal terms (e.g., “contract,” “liability,” “jurisdiction”)
       - Important figures, deadlines, or conditions.
     - Preserve all markdown formatting that exists in the original document (headings, lists, tables, etc.).

  3. Contextual Awareness
     - Only refer to information that appears in the provided legal document.
     - If a previous answer exists, review and improve it by adding clarity, corrections, or additional relevant details. Do not simply repeat it.

  4. Language
     - The entire response must be written in {{targetLanguage}} with accurate grammar and natural phrasing.

  ---

  Legal Document:
  {{documentText}}

  Question:
  {{question}}

  Previous Answer (if any):
  {{previousAnswer}}

  ---

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
