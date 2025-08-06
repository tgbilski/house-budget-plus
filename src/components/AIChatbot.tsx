import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  pageContext: string;
  pageName: string;
}

export function AIChatbot({ pageContext, pageName }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [textMessages, setTextMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages: voiceMessages,
    isConnected,
    isRecording,
    isSpeaking,
    startVoiceChat,
    stopVoiceChat,
    sendTextMessage,
    error: voiceError
  } = useRealtimeChat();

  // Access control
  const hasAccess = user?.email === 'Tgbilski@gmail.com' || subscribed;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [textMessages, voiceMessages]);

  useEffect(() => {
    if (voiceError) {
      toast({
        title: "Voice Chat Error",
        description: voiceError,
        variant: "destructive",
      });
    }
  }, [voiceError, toast]);

  useEffect(() => {
    if (isOpen && textMessages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hi! I'm your AI assistant for the ${pageName} page. I can help guide you through filling out the forms and using the features here. You can type your questions or use voice input!`,
        type: 'assistant',
        timestamp: new Date(),
      };
      setTextMessages([welcomeMessage]);
    }
  }, [isOpen, pageName, textMessages.length]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (useVoice && isConnected) {
      // Send text through voice chat
      sendTextMessage(input);
      setInput('');
      return;
    }

    // Send through regular chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setTextMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: { 
          message: input,
          pageContext,
          pageName,
          conversationHistory: textMessages.slice(-5)
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setTextMessages(prev => [...prev, assistantMessage]);

      // Handle autofill suggestions
      if (data.autofill) {
        if (data.autofill.action === 'fill_budget') {
          // Dispatch budget autofill event
          window.dispatchEvent(new CustomEvent('budgetAutofill', {
            detail: data.autofill
          }));
          
          toast({
            title: "Budget Updated",
            description: "I've updated your budget calculator with the specified amounts.",
          });
        } else if (data.autofill.action === 'fill_form' && data.autofill.entries) {
          // Dispatch takeout calendar autofill events
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

  const toggleVoiceMode = async () => {
    if (useVoice) {
      stopVoiceChat();
      setUseVoice(false);
    } else {
      try {
        await startVoiceChat();
        setUseVoice(true);
        toast({
          title: "Voice Mode Activated",
          description: "You can now speak to the AI assistant!",
        });
      } catch (error) {
        toast({
          title: "Voice Mode Error",
          description: "Failed to activate voice mode. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const currentMessages = useVoice ? voiceMessages : textMessages;

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
                onClick={toggleVoiceMode}
                className={`h-8 w-8 ${useVoice ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {useVoice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  if (useVoice) {
                    stopVoiceChat();
                    setUseVoice(false);
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
            {useVoice && (
              <div className="mb-3 p-2 rounded-lg bg-muted text-center text-sm">
                {!isConnected && "Connecting to voice chat..."}
                {isConnected && !isRecording && "Voice chat ready"}
                {isRecording && !isSpeaking && "🎤 Listening..."}
                {isSpeaking && "🔊 AI is speaking..."}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-4">
                {currentMessages.map((message) => (
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
                      {message.content}
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

            {/* Input - Only show for text mode or when voice is connected */}
            {(!useVoice || (useVoice && isConnected)) && (
              <div className="flex gap-2 mt-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={useVoice ? "Type or speak your message..." : "Type your message..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  {useVoice && isRecording ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
