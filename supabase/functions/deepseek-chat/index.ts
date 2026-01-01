import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Available Ollama endpoints with DeepSeek models (sorted by performance)
const OLLAMA_ENDPOINTS = [
  { url: "http://108.181.196.208:11434", model: "deepseek-r1:latest" },
  { url: "http://130.61.213.45:11434", model: "deepseek-r1:latest" },
  { url: "http://51.254.199.143:11434", model: "deepseek-r1:1.5b" },
  { url: "http://185.56.150.171:11434", model: "deepseek-r1:1.5b" },
  { url: "http://138.201.198.73:11434", model: "deepseek-r1:7b" },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    console.log("Received chat request with", messages.length, "messages");

    // Try endpoints in order until one works
    let lastError: Error | null = null;
    
    for (const endpoint of OLLAMA_ENDPOINTS) {
      try {
        console.log(`Trying endpoint: ${endpoint.url} with model: ${endpoint.model}`);
        
        const response = await fetch(`${endpoint.url}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: endpoint.model,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            stream: true,
          }),
        });

        if (!response.ok) {
          console.log(`Endpoint ${endpoint.url} returned status ${response.status}`);
          continue;
        }

        console.log(`Successfully connected to ${endpoint.url}`);

        // Stream the response back
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  controller.close();
                  break;
                }

                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n').filter(line => line.trim());

                for (const line of lines) {
                  try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                      // Transform to OpenAI-compatible SSE format
                      const sseData = {
                        choices: [{
                          delta: { content: json.message.content },
                          index: 0
                        }]
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`));
                    }
                  } catch {
                    // Skip invalid JSON lines
                  }
                }
              }
            } catch (error) {
              console.error("Stream error:", error);
              controller.error(error);
            }
          }
        });

        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.log(`Endpoint ${endpoint.url} failed:`, errorMessage);
        lastError = err instanceof Error ? err : new Error(errorMessage);
        continue;
      }
    }

    // All endpoints failed
    throw lastError || new Error("All endpoints failed");

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Error in deepseek-chat function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
