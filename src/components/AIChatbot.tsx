import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Send, Bot, User, Volume2, VolumeX } from 'lucide-react';

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SCROLLABLE container ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check access permissions - super user or subscriber only
  const hasAccess = user?.email === 'Tgbilski@gmail.com' || subscribed;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hi! I'm your AI assistant for the ${pageName} page. I can help guide you through filling out the forms and using the features here. You can type your questions or use voice input!`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, pageName, messages.length]);

  // Scroll to bottom whenever messages change
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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: content,
          pageContext,
          pageName,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle autofill if present
      if (data.autofill) {
        await handleAutofill(data.autofill);
      }

      // Convert response to speech
      await speakText(data.response);
    } catch (error) {
      // Handle error
      toast({ title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ... other functions like handleAutofill, speakText, etc.

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
    <Card style={{ width: 400, position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <CardHeader>
        <CardTitle>
          AI Assistant
          <Button variant="ghost" size="sm" style={{ float: 'right' }} onClick={() => setIsOpen(o => !o)}>
            {isOpen ? 'Close' : 'Open'}
          </Button>
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
          {/* SCROLLABLE MESSAGE AREA */}
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
          {/* INPUT AREA */}
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
      )}
    </Card>
  );
}
