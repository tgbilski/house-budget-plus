import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, ArrowRightLeft, Wallet, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';
import { sanitizeText } from '@/utils/sanitize';
import { cn } from '@/lib/utils';

export interface ParsedEntry {
  type: 'expense' | 'savings';
  amount: number;
  // Expense fields
  merchant?: string;
  category?: string;
  // Savings fields
  month?: number | null;
  notes?: string;
}

interface VoiceAddSectionProps {
  onSaveExpense: (entry: ParsedEntry, transcription: string) => Promise<void>;
  onSaveSavings: (entry: ParsedEntry, transcription: string) => Promise<void>;
  context: 'expenses' | 'savings';
}

export const VoiceAddSection: React.FC<VoiceAddSectionProps> = ({ onSaveExpense, onSaveSavings, context }) => {
  const { toast } = useToast();
  const { currency } = useCurrency();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [parsedEntry, setParsedEntry] = useState<ParsedEntry | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
      setParsedEntry(null);
      setAiStatus('');
    } catch (error) {
      toast({ title: 'Error', description: 'Could not access microphone', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setAiStatus('Transcribing audio...');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        setAiStatus('Analyzing your entry...');
        const { data, error } = await supabase.functions.invoke('voice-expense', {
          body: { audio: base64Audio },
        });
        if (error) throw error;
        setTranscription(data.transcription);
        setParsedEntry(data.entry);
        setAiStatus('');
        toast({ title: 'Got it!', description: `Detected a ${data.entry.type === 'expense' ? 'expense' : 'savings'} entry` });
      };
    } catch (error: any) {
      setAiStatus('');
      toast({ title: 'Error', description: error?.message || 'Failed to process voice recording', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleType = () => {
    if (!parsedEntry) return;
    setParsedEntry({
      ...parsedEntry,
      type: parsedEntry.type === 'expense' ? 'savings' : 'expense',
    });
  };

  const handleSave = async () => {
    if (!parsedEntry) return;
    try {
      if (parsedEntry.type === 'expense') {
        await onSaveExpense(parsedEntry, transcription);
      } else {
        await onSaveSavings(parsedEntry, transcription);
      }
      setTranscription('');
      setParsedEntry(null);
      setAiStatus('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save entry', variant: 'destructive' });
    }
  };

  const isExpense = parsedEntry?.type === 'expense';

  return (
    <Card className="bg-card border-2 border-primary/20 shadow-cartoon overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-teal/20 flex items-center justify-center">
            <Mic className="h-4 w-4 text-primary" />
          </div>
          Voice Quick Add
          <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary border-0">
            Premium
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {context === 'expenses' 
            ? 'Say what you spent — or what you saved. AI figures it out.' 
            : 'Say what you saved — or what you spent. AI routes it.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mic Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30",
              isRecording
                ? "bg-destructive shadow-lg shadow-destructive/30 animate-pulse scale-110"
                : isProcessing
                ? "bg-muted cursor-not-allowed"
                : "bg-gradient-to-br from-primary to-primary-glow hover:scale-110 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
            )}
          >
            {isRecording ? (
              <MicOff className="h-10 w-10 text-destructive-foreground" />
            ) : (
              <Mic className="h-10 w-10 text-primary-foreground" />
            )}
          </button>
          <p className="text-sm text-muted-foreground text-center">
            {isRecording ? '🔴 Listening... tap to stop' : isProcessing ? '⏳ Processing...' : 'Tap to speak'}
          </p>
        </div>

        {/* AI Status */}
        {aiStatus && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary animate-pulse">
            <div className="w-2 h-2 bg-primary rounded-full" />
            {aiStatus}
          </div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">You said:</span> "{sanitizeText(transcription)}"
            </p>
          </div>
        )}

        {/* Parsed Result with Toggle */}
        {parsedEntry && (
          <div className={cn(
            "rounded-xl border-2 p-4 space-y-3 transition-colors duration-300",
            isExpense 
              ? "border-warning/40 bg-warning/5" 
              : "border-success/40 bg-success/5"
          )}>
            {/* Type Badge + Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isExpense ? (
                  <Wallet className="h-5 w-5 text-warning" />
                ) : (
                  <PiggyBank className="h-5 w-5 text-success" />
                )}
                <span className={cn(
                  "text-sm font-bold uppercase tracking-wide",
                  isExpense ? "text-warning" : "text-success"
                )}>
                  {isExpense ? 'Expense' : 'Savings'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleType} className="text-xs gap-1 h-7">
                <ArrowRightLeft className="h-3 w-3" />
                Switch to {isExpense ? 'Savings' : 'Expense'}
              </Button>
            </div>

            {/* Amount */}
            <p className="text-3xl font-bold text-foreground">
              {currency.symbol}{parsedEntry.amount.toFixed(2)}
            </p>

            {/* Details */}
            {isExpense && (
              <div className="flex flex-wrap gap-2 text-sm">
                {parsedEntry.merchant && parsedEntry.merchant !== 'Unknown' && (
                  <Badge variant="outline" className="font-normal">{parsedEntry.merchant}</Badge>
                )}
                {parsedEntry.category && (
                  <Badge variant="secondary" className="font-normal">{parsedEntry.category}</Badge>
                )}
              </div>
            )}
            {!isExpense && parsedEntry.notes && (
              <p className="text-sm text-muted-foreground italic">{parsedEntry.notes}</p>
            )}

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full" size="lg">
              {isExpense ? 'Save Expense' : 'Save to Savings'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
