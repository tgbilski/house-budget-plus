import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatbotProps {
  pageContext: string;
  pageName: string;
}

export function AIChatbot({ pageContext, pageName }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const { toast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Access control
  const hasAccess = user?.email === 'Tgbilski@gmail.com' || subscribed;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hi! I'm your AI assistant for the ${pageName} page. I can help guide you through filling out the forms and using the features here. You can type your questions or use voice input!`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, pageName, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: content,
          pageContext,
          pageName,
          conversationHistory: messages.slice(-5),
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.autofill) {
        handleAutofill(data.autofill);
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = (autofillData: any) => {
    if (autofillData.action === 'fill_form' && autofillData.entries) {
      // Dispatch custom events for form filling
      autofillData.entries.forEach((entry: any) => {
        const event = new CustomEvent('autofill-entry', {
          detail: entry
        });
        window.dispatchEvent(event);
      });
      
      toast({
        title: "Form Filled",
        description: `Added ${autofillData.entries.length} entries to your takeout calendar.`,
      });
    }
  };

  // ... other functions like handleAutofill, speakText, etc.

  // Mascot icon button style
  const mascotButtonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 28,
    right: 28,
    zIndex: 1100,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
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
      {!isOpen && (
        <button
          style={mascotButtonStyle}
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
      {isOpen && (
        <Card
          style={{
            width: 'min(400px, calc(100vw - 2rem))',
            maxHeight: 'min(500px, calc(100vh - 2rem))',
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1200,
            boxShadow: '0 6px 24px rgba(0,0,0,0.20)',
            borderRadius: 16,
          }}
        >
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
                  alt="Mascot Icon"
                  height={32}
                  width={32}
                  style={{ borderRadius: '50%' }}
                />
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>AI Assistant</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', height: 'min(400px, calc(100vh - 200px))' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px', marginBottom: 8 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                    margin: '8px 0',
                    background: msg.role === 'user' ? '#e0f7fa' : '#f1f8e9',
                    borderRadius: 8,
                    padding: '6px 12px',
                    display: 'inline-block',
                    maxWidth: '80%',
                  }}
                >
                  <span>{msg.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') sendMessage(input);
                }}
                disabled={isLoading}
                placeholder="Type your message..."
              />
              <Button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}><Send size={18} /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
