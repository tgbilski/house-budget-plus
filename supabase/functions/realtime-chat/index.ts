// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REALTIME-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 400 });
  }

  try {
    logStep("Starting WebSocket upgrade");
    
    const { socket, response } = Deno.upgradeWebSocket(req, {
      headers: corsHeaders,
    });

    let openaiWs: WebSocket | null = null;
    let sessionCreated = false;

    socket.onopen = async () => {
      logStep("Client WebSocket connected");
      
      try {
        // Connect to OpenAI Realtime API
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiApiKey) {
          throw new Error("OPENAI_API_KEY not configured");
        }

        const openaiUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`;
        logStep("Connecting to OpenAI", { url: openaiUrl });
        
        openaiWs = new WebSocket(openaiUrl, {
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "OpenAI-Beta": "realtime=v1",
          },
        });

        openaiWs.onopen = () => {
          logStep("Connected to OpenAI Realtime API");
        };

        openaiWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            logStep("Received from OpenAI", { type: data.type });

            // Send session.update after session.created
            if (data.type === "session.created" && !sessionCreated) {
              sessionCreated = true;
              logStep("Sending session update");
              
              const sessionUpdate = {
                type: "session.update",
                session: {
                  modalities: ["text", "audio"],
                  instructions: "You are a helpful AI assistant for a budget management app. Help users with their financial questions, budget planning, and expense tracking. Be conversational and friendly in your voice responses.",
                  voice: "alloy",
                  input_audio_format: "pcm16",
                  output_audio_format: "pcm16",
                  input_audio_transcription: {
                    model: "whisper-1"
                  },
                  turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1000
                  },
                  temperature: 0.8,
                  max_response_output_tokens: "inf"
                }
              };
              
              openaiWs?.send(JSON.stringify(sessionUpdate));
            }

            // Forward all messages to client
            socket.send(JSON.stringify(data));
          } catch (error) {
            logStep("Error processing OpenAI message", { error: error.message });
          }
        };

        openaiWs.onerror = (error) => {
          logStep("OpenAI WebSocket error", { error });
          socket.send(JSON.stringify({ type: "error", message: "OpenAI connection error" }));
        };

        openaiWs.onclose = () => {
          logStep("OpenAI WebSocket closed");
          socket.close();
        };

      } catch (error) {
        logStep("Error setting up OpenAI connection", { error: error.message });
        socket.send(JSON.stringify({ type: "error", message: error.message }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        logStep("Received from client", { type: data.type });
        
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(JSON.stringify(data));
        } else {
          logStep("OpenAI WebSocket not ready", { readyState: openaiWs?.readyState });
        }
      } catch (error) {
        logStep("Error processing client message", { error: error.message });
      }
    };

    socket.onclose = () => {
      logStep("Client WebSocket closed");
      if (openaiWs) {
        openaiWs.close();
      }
    };

    socket.onerror = (error) => {
      logStep("Client WebSocket error", { error });
    };

    return response;
  } catch (error) {
    logStep("Error in WebSocket setup", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});