import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseRealtimeChatReturn {
  messages: Message[];
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  startVoiceChat: () => Promise<void>;
  stopVoiceChat: () => void;
  sendTextMessage: (text: string) => void;
  error: string | null;
}

export const useRealtimeChat = (): UseRealtimeChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const currentTranscriptRef = useRef<string>('');

  const addMessage = useCallback((type: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }]);
  }, []);

  const connectWebSocket = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const wsUrl = `wss://jakfagdthwehkvynykwu.functions.supabase.co/realtime-chat`;
      console.log('Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data.type);

          switch (data.type) {
            case 'response.audio.delta':
              setIsSpeaking(true);
              // Convert base64 to Uint8Array
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              if (audioContextRef.current) {
                await playAudioData(audioContextRef.current, bytes);
              }
              break;

            case 'response.audio_transcript.delta':
              currentTranscriptRef.current += data.delta;
              break;

            case 'response.audio_transcript.done':
              if (currentTranscriptRef.current.trim()) {
                addMessage('assistant', currentTranscriptRef.current.trim());
                currentTranscriptRef.current = '';
              }
              break;

            case 'response.audio.done':
              setIsSpeaking(false);
              break;

            case 'input_audio_buffer.speech_started':
              setIsSpeaking(false);
              clearAudioQueue();
              break;

            case 'conversation.item.input_audio_transcription.completed':
              if (data.transcript?.trim()) {
                addMessage('user', data.transcript.trim());
              }
              break;

            case 'error':
              console.error('Received error:', data.message);
              setError(data.message);
              break;

            default:
              console.log('Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);
      };

    } catch (error) {
      console.error('Error connecting:', error);
      setError('Failed to connect to voice chat');
    }
  }, [addMessage]);

  const startVoiceChat = useCallback(async () => {
    try {
      await connectWebSocket();
      
      // Start audio recording
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setError('Failed to start voice chat. Please check microphone permissions.');
    }
  }, [connectWebSocket]);

  const stopVoiceChat = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    clearAudioQueue();
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      addMessage('user', text);
      
      const event = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text
            }
          ]
        }
      };

      wsRef.current.send(JSON.stringify(event));
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
    }
  }, [addMessage]);

  useEffect(() => {
    return () => {
      stopVoiceChat();
    };
  }, [stopVoiceChat]);

  return {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    startVoiceChat,
    stopVoiceChat,
    sendTextMessage,
    error
  };
};