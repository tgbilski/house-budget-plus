import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, CornerDownLeft } from "lucide-react";

const PREDETERMINED_RESPONSE = `**Budget Analysis & Tracking**
Our AI analyzes your income vs. expenses to identify savings opportunities and spending patterns.

**Vendor Cost Optimization**
Compare contractor quotes and get recommendations for the best value on home improvement projects.

**Savings Goal Planning**
Track progress toward financial goals with personalized projections and timeline estimates.

**Smart Recommendations**
Get actionable advice on cutting costs, optimizing budgets, and maximizing your household savings.

Try our AI assistant on any page to get personalized insights based on your actual financial data!`;

const PROMPT = "How can House Budget Calculator and AI help me plan my budget?";

export const AIChatPreview = () => {
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = () => {
    if (showResponse) return;

    setIsTyping(true);
    setTimeout(() => {
      setShowResponse(true);
      setIsTyping(false);
    }, 800);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-50 to-white border-2 border-primary/20 shadow-lg">
      <div className="p-3 space-y-2">
        {/* Input Area - Always visible */}
        <div className="flex gap-2 items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
          <div className="flex-1 text-sm text-gray-700">
            {PROMPT}
          </div>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={showResponse}
            className="bg-primary hover:bg-primary/90 h-8 w-8 p-0"
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Response Area */}
        {(isTyping || showResponse) && (
          <div className="bg-gray-100 rounded-lg px-3 py-2 min-h-[120px] max-h-[200px] overflow-y-auto">
            {isTyping ? (
              <div className="flex gap-1 py-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Bot className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-900 whitespace-pre-line leading-relaxed">{PREDETERMINED_RESPONSE}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
