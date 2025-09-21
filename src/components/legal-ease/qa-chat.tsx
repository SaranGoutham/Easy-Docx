'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { answerQuestionsAboutDocument } from '@/ai/flows/answer-questions-document';
import { detectLanguage } from '@/ai/flows/detect-language';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Loader2, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface QAChatProps {
  documentText: string;
}

type Message = {
  id: string; 
  role: 'user' | 'ai';
  content: string;
};

const MarkdownRenderer = ({ content }: { content: string | null }) => {
  if (!content) return null;
  return (
    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
      {content}
    </ReactMarkdown>
  );
};


export function QAChat({ documentText }: QAChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleVoiceTyping = (lang: 'en' | 'hi' | 'te') => {
    setShowLangDialog(false);
    if (!isSpeechRecognitionSupported) {
      toast({
        variant: 'destructive',
        title: 'Voice Recognition Not Supported',
        description: 'Your browser does not support voice typing.',
      });
      return;
    }

    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      toast({
        variant: 'destructive',
        title: 'Voice Recognition Not Available',
        description: 'Your browser blocked the speech recognition API.',
      });
      return;
    }

    recognitionRef.current = new SpeechRecognitionConstructor();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    const langCode = { en: 'en-US', hi: 'hi-IN', te: 'te-IN' }[lang];
    recognitionRef.current.lang = langCode;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      toast({
        variant: 'destructive',
        title: 'Voice Error',
        description: `An error occurred: ${event.error}. Please ensure microphone access is granted.`,
      });
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current.start();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = input;
    setInput('');
    setIsLoading(true);

    try {
      // 1. Detect language
      const { language } = await detectLanguage({ text: currentQuestion });

      if (language === 'Unknown') {
          throw new Error('Could not determine the language of the question.');
      }
      
      const previousAnswer = messages.filter(m => m.role === 'ai').pop()?.content;

      // 2. Call Q&A with detected language
      const result = await answerQuestionsAboutDocument({
        documentText,
        question: currentQuestion,
        previousAnswer,
        targetLanguage: language,
      });
      
      const aiMessage: Message = { id: `${Date.now()}-ai`, role: 'ai', content: result.answer };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error getting answer:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get an answer. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
       setMessages(prev => prev.slice(0, -1)); // Remove user message on failure
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Interactive Q&amp;A</CardTitle>
          <CardDescription>Ask questions about your document in English, Hindi, or Telugu.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground pt-10">
                  <p>No questions yet.</p>
                  <p>Ask something like "What are the key obligations?"</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-xs md:max-w-md rounded-lg px-4 py-3 text-sm',
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {message.role === 'user' ? message.content : <MarkdownRenderer content={message.content} />}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask a follow-up question..."}
              disabled={isLoading || isListening}
              aria-label="Ask a question"
            />
             {isSpeechRecognitionSupported && (
              <Button
                type="button"
                size="icon"
                variant={isListening ? 'destructive' : 'outline'}
                onClick={() => {
                  if (isListening) {
                    recognitionRef.current?.stop();
                  } else {
                    setShowLangDialog(true);
                  }
                }}
                disabled={isLoading}
                aria-label={isListening ? 'Stop listening' : 'Start voice typing'}
              >
                <Mic className={cn('h-4 w-4', isListening && 'animate-pulse')} />
              </Button>
            )}
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send question">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showLangDialog} onOpenChange={setShowLangDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Voice Language</AlertDialogTitle>
            <AlertDialogDescription>
              Please select the language you'd like to speak in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
            <AlertDialogAction onClick={() => handleVoiceTyping('en')} className="w-full">
              English
            </AlertDialogAction>
            <AlertDialogAction onClick={() => handleVoiceTyping('hi')} className="w-full">
              Hindi
            </AlertDialogAction>
            <AlertDialogAction onClick={() => handleVoiceTyping('te')} className="w-full">
              Telugu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
