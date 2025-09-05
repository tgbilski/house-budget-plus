// src/components/AIChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// New interface for calculator data
interface CalculatorData {
  calculatorId: string;
  ownerName: string;
}

interface AIChatbotProps {
  pageContext: string;
  pageName: string;
  calculatorsData?: CalculatorData[]; // Add this new prop
}

export function AIChatbot({ pageContext, pageName, calculatorsData = [] }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Access control
  const hasAccess = user?.email === 'Tgbilski@gmail.com' || subscribed;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hi! I'm your AI assistant for the ${pageName} page. I can help guide you through filling out the forms and using the features here. You can type your questions or use voice input!`,
        type: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, pageName, messages.length]);

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: messageText,
          pageContext,
          pageName,
          conversationHistory: messages.slice(-5),
          calculatorsData, // Pass the calculator data here
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle autofill suggestions
      if (data.autofill) {
        if (data.autofill.action === 'fill_budget') {
          // Dispatch the event with the specific calculator ID
          window.dispatchEvent(new CustomEvent('budgetAutofill', {
            detail: data.autofill
          }));

          toast({
            title: "Budget Updated",
            description: "I've updated your budget calculator with the specified amounts.",
          });
        } else if (data.autofill.action === 'fill_form' && data.autofill.entries) {
          data.autofill.entries.forEach((entry: any) => {
            const event = new CustomEvent('autofill-entry', {
              detail: entry
            });
            window.dispatchEvent(event);
          });

          toast({
            title: "Form Filled",
            description: `Added ${data.autofill.entries.length} entries to your takeout calendar.`,
          });
        } else if (data.autofill.action === 'fill_gift') {
          window.dispatchEvent(new CustomEvent('giftAutofill', {
            detail: data.autofill.data
          }));

          toast({
            title: "Gift Added",
            description: "I've added your gift idea to the list.",
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Speak your message. Click the mic again to stop.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data.text && data.text.trim()) {
        setInput(data.text);
        await handleSendMessage(data.text);
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking more clearly.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Transcription Error",
        description: "Failed to convert speech to text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatAIResponse = (content: string) => {
    // Process the content step by step
    let processed = content
      // Bold text for **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Bullet points
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/^\* (.+)$/gm, '• $1')
      // Convert line breaks to proper paragraph structure
      .replace(/\n/g, '<br>');
    
    // Wrap in a single div to ensure single root element
    return `<div>${processed}</div>`;
  };

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You need to be a subscriber or admin to use the AI assistant.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Chat Toggle Button with Mascot */}
      {!isOpen && (
        <button
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 1100,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Open AI Chatbot"
          onClick={() => setIsOpen(true)}
        >
          <img
            src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
            alt="Chatbot mascot"
            width={56}
            height={56}
            style={{
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              objectFit: 'contain',
              background: '#fff',
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          style={{
            width: 'min(400px, calc(100vw - 2rem))',
            maxHeight: 'min(600px, calc(100vh - 2rem))',
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1200,
            boxShadow: '0 6px 24px rgba(0,0,0,0.20)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
                alt="Mascot Icon"
                height={32}
                width={32}
                style={{ borderRadius: '50%' }}
              />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleRecording}
                disabled={isTranscribing}
                className={`h-8 w-8 ${isRecording ? 'bg-red-500 text-white' : ''}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  if (isRecording) {
                    stopRecording();
                  }
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
            {/* Voice Status */}
            {(isRecording || isTranscribing) && (
              <div className="mb-3 p-2 rounded-lg bg-muted text-center text-sm">
                {isTranscribing ? "🔄 Converting speech to text..." : "🎤 Recording... Click mic to stop"}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.type === 'assistant' ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: formatAIResponse(message.content) 
                          }}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 mt-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or use voice..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || isTranscribing}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading || isTranscribing}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
