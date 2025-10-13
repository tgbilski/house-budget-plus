import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Send } from "lucide-react";

const PREDETERMINED_RESPONSE = `**Budget Analysis & Tracking**
Our AI analyzes your income vs. expenses to identify savings opportunities and spending patterns.

**Vendor Cost Optimization**
Compare contractor quotes and get recommendations for the best value on home improvement projects.

**Savings Goal Planning**
Track progress toward financial goals with personalized projections and timeline estimates.

**Smart Recommendations**
Get actionable advice on cutting costs, optimizing budgets, and maximizing your household savings.

Try our AI assistant on any page to get personalized insights based on your actual financial data!`;

export const AIChatPreview = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input] = useState("How can AI help with my house budget?");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = () => {
    if (messages.length > 0) return; // Only allow one submission

    // Add user message
    setMessages([{ role: 'user', content: input }]);
    setIsTyping(true);

    // Simulate typing delay before showing response
    setTimeout(() => {
      setMessages([
        { role: 'user', content: input },
        { role: 'assistant', content: PREDETERMINED_RESPONSE }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-50 to-white border-2 border-primary/20 shadow-lg">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">AI Financial Assistant</h3>
            <p className="text-xs text-gray-500">Ask me anything about budgeting</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 italic">
              <Bot className="h-4 w-4" />
              <span>Try the demo question below...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-xs whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
            {input}
          </div>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={messages.length > 0}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
