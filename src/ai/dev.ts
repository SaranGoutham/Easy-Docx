'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/answer-questions-document.ts';
import '@/ai/flows/translate-summary-telugu.ts';
import '@/ai/flows/summarize-legal-document.ts';
import '@/ai/flows/translate-summary-hindi.ts';
import '@/ai/flows/extract-text-from-file.ts';
import '@/ai/flows/translate-text-hindi.ts';
import '@/ai/flows/translate-text-telugu.ts';
import '@/ai/flows/detect-language.ts';
