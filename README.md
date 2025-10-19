# EasyDox

Modern, AI-powered legal document analysis, summarization, translation, and Q&A — built with Next.js, TypeScript, Genkit (Google AI), Tailwind, and Supabase.

- Next.js 15 (App Router)
- TypeScript 5.x
- Tailwind CSS + ShadCN UI
- Supabase Auth + Postgres
- Genkit + Google AI (Gemini)

## 🌟 Features

### 📄 **AI-Powered Document Analysis**
- Upload legal documents in various formats (DOCX, PDF, TXT)
- Extract key insights, clauses, and potential concerns
- Intelligent document parsing and structure recognition

### 📝 **Smart Summarization**
- Generate concise summaries of complex legal documents
- Highlight critical information and important sections
- Customizable summary length and detail level

### 🌐 **Multi-Language Support**
- Translate documents and summaries to multiple languages
- **Specialized support for:** Hindi, Telugu, and English
- Preserve legal terminology accuracy across translations

### 💬 **Interactive Q&A System**
- Ask specific questions about your documents
- Get instant, context-aware answers
- Natural language processing for better understanding

### 📱 **Responsive & Modern UI**
- Fully responsive design for all devices
- Clean, intuitive interface built with Radix UI
- Dark/light mode support
- Accessibility-first approach

### 🔐 **Secure & Private**
- Protected authentication system
- Secure document storage and processing
- Privacy-focused data handling

## Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- UI: Tailwind CSS, ShadCN, Radix UI
- Data/Auth: Supabase
- AI: Genkit + @genkit-ai/googleai (Gemini models)
- Parsing: mammoth (DOCX), JSZip (PPTX), pdf-parse (PDF), tesseract.js (OCR)

## Project Structure

```
src/
  ai/
    genkit.ts                 # Genkit client (Google AI plugin)
    dev.ts                    # Registers flows for genkit CLI dev
    flows/
      extract-text-from-file.ts
      summarize-legal-document.ts
      answer-questions-document.ts
      translate-text-hindi.ts
      translate-text-telugu.ts
      translate-summary-hindi.ts
      translate-summary-telugu.ts
      detect-language.ts
  app/
    api/
      summary/stream/route.ts     # SSE summary stream
      translation/stream/route.ts # SSE translation stream
      history/route.ts            # Persist summaries to Supabase
    workspace/
      layout.tsx
      page.tsx
      history/page.tsx
    layout.tsx
    page.tsx                      # Auth screen
  components/
    legal-ease/                   # Upload, analysis, Q&A, profile
    ui/                           # ShadCN components
    layout/                       # App header
  hooks/                          # use-auth, use-briefing-history, etc.
  lib/                            # supabase clients, utils
  types/                          # TS decls for libs
docs/
  blueprint.md                    # Product blueprint
DB.md                             # Supabase schema + policies
```

## Getting Started

Prerequisites
- Node.js 18+
- pnpm (recommended)
- Supabase project (URL + anon key)

Install
```
pnpm install
```

Environment
- Create a `.env` in the project root and set:
```
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Note: Never commit real secrets. Rotate keys if exposed.

Database (Supabase)
- Open `DB.md` and run the SQL to create `document_briefings` and enable RLS policies.

Run Dev Server
```
pnpm dev
```
App runs at http://localhost:9002

Optional: Genkit Dev (for flows)
```
pnpm genkit:dev
```

## How It Works

- Text Extraction: `extractTextFromFile` supports DOCX, PPTX, PDF (server-side parse), and images (OCR via Tesseract).
- Summarization (SSE): `/api/summary/stream` streams a progressively improving summary using Gemini.
- Translation (SSE): `/api/translation/stream` streams Hindi/Telugu translations of the summary.
- Q&A: `answerQuestionsAboutDocument` answers questions in the user’s language with basic conversational context.
- Auth + History: Supabase Auth gates `/workspace`; summaries can be saved to `document_briefings` and listed under `/workspace/history`.

## Usage Examples

Summarize a document
```ts
import { summarizeLegalDocument } from '@/ai/flows/summarize-legal-document';

const { summary } = await summarizeLegalDocument({
  documentText: "...full text...",
});
```

Translate text
```ts
import { translateTextToHindi } from '@/ai/flows/translate-text-hindi';
import { translateTextToTelugu } from '@/ai/flows/translate-text-telugu';

const hi = await translateTextToHindi({ text: summary });
const te = await translateTextToTelugu({ text: summary });
```

Q&A over a document
```ts
import { answerQuestionsAboutDocument } from '@/ai/flows/answer-questions-document';

const { answer } = await answerQuestionsAboutDocument({
  documentText: "...full text...",
  question: "What are the key obligations?",
  targetLanguage: 'English',
});
```

## Supported Languages

- English (UI + Q&A)
- Hindi (translation + Q&A)
- Telugu (translation + Q&A)

## Development Notes

- Next dev server runs on port 9002 (see `package.json`).
- Server bundling excludes heavy native modules in `next.config.ts` (`canvas`, `pdf-parse`).
- ShadCN config lives in `components.json`; Tailwind in `tailwind.config.ts` and `src/app/globals.css`.

## Troubleshooting

- Missing Supabase table: create it with the SQL in `DB.md`.
- Streaming endpoints return 400: ensure payloads include `documentText` (summary) or `summary` + `language` (translation).
- Auth loop on workspace: verify `NEXT_PUBLIC_SUPABASE_*` and a valid session.

## Acknowledgments

- Next.js, Tailwind, ShadCN UI, Radix UI
- Supabase for Auth and Postgres
- Google AI + Genkit

## 👥 Team

This project is proudly developed by a dedicated team of 6 members:

### 🚀 **Core Development Team**

| Team Member | GitHub Profile | Role |
|-------------|----------------|------| 
| **Saran Goutham Sontiyala** | [@SaranGoutham](https://github.com/SaranGoutham) | Team Lead & Full-Stack Developer |
| **Durga Prasad Ungarala** | [@DurgaPrasadU616](https://github.com/DurgaPrasadU616) | AI/ML Engineer |
| **Gowtham Raju Thokala** | [@Gowtham5753](https://github.com/Gowtham5753) | Frontend Developer |



### 🤝 **Team Contributions**
- **Collaborative Development**: Each member brings unique expertise to create a comprehensive solution
- **Code Reviews**: Peer review process ensures high code quality and knowledge sharing
- **Agile Methodology**: Regular sprints and standups for efficient project management
- **Shared Vision**: United goal of making legal document processing accessible to everyone

## 🙏 Acknowledgments

- Thanks to the Next.js team for the amazing framework
- Supabase for providing excellent backend services
- The open-source community for continuous inspiration

## 📞 Support

Having issues? We're here to help!

- 📧 **Email:** sarangoutham2@gmail.com
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/SaranGoutham/EasyDox/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/SaranGoutham/EasyDox/discussions)

---

<div align="center">

**Built with ❤️ using Next.js and TypeScript**

[⬆ Back to Top](#-easydox)

</div>





