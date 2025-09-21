"use client";

import { useState } from "react";
import { UploadView } from "@/components/legal-ease/upload-view";
import { AnalysisView } from "@/components/legal-ease/analysis-view";

export type Document = {
  name: string;
  text: string;
};

export default function MainPage() {
  const [document, setDocument] = useState<Document | null>(null);

  const handleProcess = (doc: Document) => {
    setDocument(doc);
  };

  const handleBack = () => {
    setDocument(null);
  };

  return document ? (
    <section className="space-y-8">
      <AnalysisView document={document} onBack={handleBack} />
    </section>
  ) : (
    <section className="space-y-8">
      <UploadView onProcess={handleProcess} />
    </section>
  );
}
