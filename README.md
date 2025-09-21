# 📚 EasyDox

> **Modern Legal Document Analysis & Processing Platform**

EasyDox is a cutting-edge web application that revolutionizes how legal documents are analyzed, summarized, and translated. Built with Next.js and TypeScript, it combines the power of AI with an intuitive interface to make legal document processing accessible and efficient.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
<!--[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)-->

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

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) with App Router |
| **Language** | [TypeScript 5.0+](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **UI Components** | Custom + [Radix UI](https://www.radix-ui.com/) |
| **AI Processing** | Custom AI flows and utilities |
| **Package Manager** | [pnpm](https://pnpm.io/) |

## 📁 Project Structure

```
src/
├── ai/                    # 🤖 AI processing flows and utilities
│   ├── analysis/         # Document analysis logic
│   ├── summarization/    # Text summarization algorithms
│   └── translation/      # Multi-language processing
├── app/                  # 📱 Next.js app router
│   ├── api/             # API routes and endpoints
│   ├── dashboard/       # Protected dashboard pages
│   └── auth/           # Authentication pages
├── components/          # 🎨 Reusable UI components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── hooks/              # 🪝 Custom React hooks
├── lib/                # 🛠️ Utility functions and configurations
│   ├── supabase/       # Database utilities
│   ├── auth/          # Authentication helpers
│   └── utils/         # General utilities
└── types/             # 📋 TypeScript type definitions
```

## 🎯 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **pnpm** (recommended) or npm
- **Supabase** account for database and auth

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaranGoutham/EasyDox.git
   cd EasyDox
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) 🎉

## 💻 Usage Examples

### Basic Document Analysis
```typescript
import { analyzeDocument } from '@/ai/analysis';

const result = await analyzeDocument({
  file: documentFile,
  analysisType: 'comprehensive',
  language: 'en'
});

console.log(result.keyPoints);
console.log(result.summary);
```

### Document Translation
```typescript
import { translateDocument } from '@/ai/translation';

const translated = await translateDocument({
  text: documentContent,
  targetLanguage: 'hi', // Hindi
  preserveLegalTerms: true
});
```

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Full Support |
| Hindi | `hi` | ✅ Full Support |
| Telugu | `te` | ✅ Full Support |
| Spanish | `es` | 🚧 Coming Soon |
| French | `fr` | 🚧 Coming Soon |

## 📊 Features Roadmap

- [ ] **Batch Processing** - Process multiple documents simultaneously
- [ ] **API Integration** - RESTful API for external integrations
- [ ] **Advanced Analytics** - Document comparison and analysis
- [ ] **Mobile App** - Native mobile applications
- [ ] **Collaboration Tools** - Team document sharing and reviews
- [ ] **Export Options** - Multiple export formats (PDF, Word, etc.)

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Ensure responsive design compatibility
- Update documentation as needed

## 👥 Team

This project is proudly developed by a dedicated team of 6 members:

### 🚀 **Core Development Team**

| Team Member | GitHub Profile | Role |
|-------------|----------------|------| 
| **Siddhi Ganesh Vardhan** | [@Ganeshsgv](https://github.com/Ganeshsgv) | Team Lead & Full-Stack Developer |
| **James Kishore Manike** | [@ToolsHD](https://github.com/ToolsHD) | Full-Stack Developer |
| **Saran Goutham Sontiyala** | [@SaranGoutham](https://github.com/SaranGoutham) | Backend Developer |
| **Siddhardha Akhil Prasad Sirapu** | [@siddhardha-sirapu](https://github.com/siddhardha-sirapu) | QA Tester  |
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



