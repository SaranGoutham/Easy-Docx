# Project Requirements: EasyDox AI

## 1. Executive Summary

EasyDox AI is a web application designed to help users quickly understand and interact with legal documents. It leverages Generative AI to provide key features such as text extraction from files, document summarization, translation, and an interactive question-and-answer interface.

## 2. Core Features

The application is composed of two main views: an upload/input view and an analysis view.

### 2.1. Document Input

- **File Upload:** Users can upload documents in various formats, including:
  - PDF (`.pdf`)
  - Microsoft Word (`.doc`, `.docx`)
  - Images (`.jpg`, `.png`)
- **Text Pasting:** Users can paste raw text directly into a textarea for analysis.
- **Drag & Drop:** A drag-and-drop zone is available for intuitive file uploads.
- **Input Validation:** The application validates file types to ensure only supported formats are processed.

### 2.2. Document Analysis

Once a document is processed, the user is taken to the analysis view, which includes:

- **AI-Generated Summary:** A card displays a concise summary of the document's content.
- **Translation:** The summary can be translated into multiple languages with a single click.
  - Current languages: Hindi, Telugu.
- **Interactive Q&A Chat:** A chat interface allows users to ask specific questions about the document's content.
  - The chat maintains conversational context, allowing for follow-up questions.
  - The interface shows user and AI messages clearly.
  - Loading states indicate when the AI is generating a response.

## 3. Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI
- **Generative AI:** Google AI via Genkit

## 4. AI Functionality (Genkit Flows)

The application's AI capabilities are powered by several Genkit flows:

- **`extractTextFromFile`:**

  - **Input:** A file (image or document) provided as a data URI.
  - **Process:** Uses a multimodal AI model to extract all text content from the file.
  - **Output:** The extracted plain text.

- **`summarizeLegalDocument`:**

  - **Input:** The extracted text of a document.
  - **Process:** An AI model generates a concise summary, framed as if from a legal expert.
  - **Output:** The summarized text.

- **`translateSummaryTo[Language]`:** (e.g., `translateSummaryToHindi`)

  - **Input:** The summary text.
  - **Process:** An AI model translates the text into the target language.
  - **Output:** The translated text.

- **`answerQuestionsAboutDocument`:**
  - **Input:** The document text, the user's question, and the previous AI answer (for context).
  - **Process:** An AI model, acting as a legal expert, answers the question based on the provided document.
  - **Output:** The AI-generated answer.

## 5. User Interface & Experience (UI/UX)

- **Layout:** A clean, modern, and responsive single-page application.
- **State Management:** The UI provides clear loading indicators and feedback for asynchronous operations (e.g., file processing, AI generation).
- **Error Handling:** Toasts are used to notify users of errors, such as invalid file types or failed AI operations.
- **Component Library:** The app uses a consistent set of UI components from ShadCN for elements like cards, buttons, tabs, and inputs.
