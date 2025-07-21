import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  if (url.pathname === '/realtime-audio-os') {
    return handleWebSocket(req);
  }

  return new Response('Not Found', { status: 404 });
});

async function handleWebSocket(req: Request) {
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWS: WebSocket | null = null;
  
  socket.onopen = async () => {
    console.log('Client connected to Audio OS');
    
    try {
      // Connect to OpenAI Realtime API
      const openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
      openaiWS = new WebSocket(openaiUrl, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      openaiWS.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
        
        // Send session configuration
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are ARIA, an advanced Audio Operating System. You can control various system functions through voice commands. 

Core capabilities:
1. File Management: Create, delete, move, copy files and folders
2. Application Control: Open, close, switch between applications
3. System Settings: Adjust volume, brightness, network settings
4. Information Retrieval: Weather, time, system status
5. Task Management: Set reminders, timers, calendar events
6. Communication: Send messages, make calls
7. Media Control: Play music, videos, control playback

Respond naturally and perform the requested actions. Always confirm what you're doing and provide audio feedback. Be helpful and efficient.

Available system functions:
- open_application: Open any application
- create_file: Create files or folders
- delete_file: Delete files or folders
- get_system_info: Get system status, time, weather
- set_reminder: Create reminders or alarms
- control_media: Play, pause, skip music/video
- adjust_settings: Change volume, brightness, etc.
- send_message: Send messages or emails
- search_files: Find files and folders
- get_weather: Get weather information
- set_timer: Create timers and alarms`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tools: [
              {
                type: 'function',
                name: 'open_application',
                description: 'Open an application or program',
                parameters: {
                  type: 'object',
                  properties: {
                    app_name: { type: 'string', description: 'Name of the application to open' },
                    parameters: { type: 'string', description: 'Optional parameters for the application' }
                  },
                  required: ['app_name']
                }
              },
              {
                type: 'function',
                name: 'create_file',
                description: 'Create a new file or folder',
                parameters: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Name of the file or folder' },
                    type: { type: 'string', enum: ['file', 'folder'], description: 'Type of item to create' },
                    content: { type: 'string', description: 'Content for the file (if creating a file)' },
                    location: { type: 'string', description: 'Where to create the item' }
                  },
                  required: ['name', 'type']
                }
              },
              {
                type: 'function',
                name: 'delete_file',
                description: 'Delete a file or folder',
                parameters: {
                  type: 'object',
                  properties: {
                    path: { type: 'string', description: 'Path to the file or folder to delete' },
                    confirm: { type: 'boolean', description: 'Confirmation to delete' }
                  },
                  required: ['path']
                }
              },
              {
                type: 'function',
                name: 'get_system_info',
                description: 'Get system information like time, date, battery, memory usage',
                parameters: {
                  type: 'object',
                  properties: {
                    info_type: { 
                      type: 'string', 
                      enum: ['time', 'date', 'battery', 'memory', 'cpu', 'network', 'all'],
                      description: 'Type of system information to retrieve' 
                    }
                  },
                  required: ['info_type']
                }
              },
              {
                type: 'function',
                name: 'set_reminder',
                description: 'Set a reminder or alarm',
                parameters: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Title of the reminder' },
                    time: { type: 'string', description: 'When to remind (relative or absolute time)' },
                    description: { type: 'string', description: 'Additional details' }
                  },
                  required: ['title', 'time']
                }
              },
              {
                type: 'function',
                name: 'control_media',
                description: 'Control media playback',
                parameters: {
                  type: 'object',
                  properties: {
                    action: { 
                      type: 'string', 
                      enum: ['play', 'pause', 'stop', 'next', 'previous', 'volume_up', 'volume_down'],
                      description: 'Media control action' 
                    },
                    media: { type: 'string', description: 'Specific media to play (optional)' }
                  },
                  required: ['action']
                }
              },
              {
                type: 'function',
                name: 'adjust_settings',
                description: 'Adjust system settings',
                parameters: {
                  type: 'object',
                  properties: {
                    setting: { 
                      type: 'string', 
                      enum: ['volume', 'brightness', 'wifi', 'bluetooth', 'dark_mode'],
                      description: 'Setting to adjust' 
                    },
                    value: { type: 'string', description: 'New value or action (on/off, increase/decrease, specific value)' }
                  },
                  required: ['setting', 'value']
                }
              },
              {
                type: 'function',
                name: 'search_files',
                description: 'Search for files and folders',
                parameters: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Search query' },
                    location: { type: 'string', description: 'Where to search (optional)' },
                    file_type: { type: 'string', description: 'File type filter (optional)' }
                  },
                  required: ['query']
                }
              },
              {
                type: 'function',
                name: 'get_weather',
                description: 'Get weather information',
                parameters: {
                  type: 'object',
                  properties: {
                    location: { type: 'string', description: 'Location for weather info' }
                  },
                  required: ['location']
                }
              }
            ],
            tool_choice: 'auto',
            temperature: 0.8,
            max_response_output_tokens: 'inf'
          }
        };
        
        openaiWS.send(JSON.stringify(sessionConfig));
      };

      openaiWS.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        // Handle function calls
        if (data.type === 'response.function_call_arguments.done') {
          const result = await handleFunctionCall(data.name, JSON.parse(data.arguments));
          
          // Send function result back to OpenAI
          const functionResult = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: data.call_id,
              output: JSON.stringify(result)
            }
          };
          
          openaiWS.send(JSON.stringify(functionResult));
          openaiWS.send(JSON.stringify({ type: 'response.create' }));
        }
        
        // Forward all messages to client
        socket.send(JSON.stringify(data));
      };

      openaiWS.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'OpenAI connection error' 
        }));
      };

      openaiWS.onclose = () => {
        console.log('OpenAI WebSocket closed');
        socket.close();
      };

    } catch (error) {
      console.error('Error connecting to OpenAI:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to connect to AI system' 
      }));
    }
  };

  socket.onmessage = (event) => {
    if (openaiWS && openaiWS.readyState === WebSocket.OPEN) {
      // Forward client messages to OpenAI
      openaiWS.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log('Client disconnected from Audio OS');
    if (openaiWS) {
      openaiWS.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
  };

  return response;
}

async function handleFunctionCall(functionName: string, args: any) {
  console.log(`Executing function: ${functionName}`, args);
  
  try {
    switch (functionName) {
      case 'open_application':
        return {
          success: true,
          message: `Opening ${args.app_name}`,
          action: 'open_app',
          data: { app: args.app_name, params: args.parameters }
        };

      case 'create_file':
        return {
          success: true,
          message: `Created ${args.type} "${args.name}" successfully`,
          action: 'create_file',
          data: { name: args.name, type: args.type, content: args.content, location: args.location }
        };

      case 'delete_file':
        return {
          success: true,
          message: `Deleted "${args.path}" successfully`,
          action: 'delete_file',
          data: { path: args.path }
        };

      case 'get_system_info':
        const systemInfo = getSystemInfo(args.info_type);
        return {
          success: true,
          message: `Here's your ${args.info_type} information`,
          action: 'system_info',
          data: systemInfo
        };

      case 'set_reminder':
        return {
          success: true,
          message: `Reminder "${args.title}" set for ${args.time}`,
          action: 'set_reminder',
          data: { title: args.title, time: args.time, description: args.description }
        };

      case 'control_media':
        return {
          success: true,
          message: `Media ${args.action} executed`,
          action: 'control_media',
          data: { action: args.action, media: args.media }
        };

      case 'adjust_settings':
        return {
          success: true,
          message: `${args.setting} adjusted to ${args.value}`,
          action: 'adjust_settings',
          data: { setting: args.setting, value: args.value }
        };

      case 'search_files':
        return {
          success: true,
          message: `Found files matching "${args.query}"`,
          action: 'search_files',
          data: { query: args.query, results: generateSearchResults(args.query) }
        };

      case 'get_weather':
        const weather = await getWeatherInfo(args.location);
        return {
          success: true,
          message: `Here's the weather for ${args.location}`,
          action: 'get_weather',
          data: weather
        };

      default:
        return {
          success: false,
          message: `Unknown function: ${functionName}`,
          action: 'error',
          data: null
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error executing ${functionName}: ${error.message}`,
      action: 'error',
      data: null
    };
  }
}

function getSystemInfo(infoType: string) {
  const now = new Date();
  
  const info = {
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    battery: Math.floor(Math.random() * 100) + '%',
    memory: Math.floor(Math.random() * 32) + ' GB available',
    cpu: Math.floor(Math.random() * 100) + '% usage',
    network: 'Connected to WiFi'
  };

  if (infoType === 'all') {
    return info;
  }
  
  return { [infoType]: info[infoType as keyof typeof info] };
}

function generateSearchResults(query: string) {
  // Mock search results
  const mockFiles = [
    `document_${query}.txt`,
    `project_${query}.pdf`,
    `image_${query}.jpg`,
    `code_${query}.js`
  ];
  
  return mockFiles.slice(0, Math.floor(Math.random() * 3) + 1);
}

async function getWeatherInfo(location: string) {
  // Mock weather data - in a real implementation, you'd call a weather API
  const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temperature = Math.floor(Math.random() * 30) + 10;
  
  return {
    location,
    condition,
    temperature: `${temperature}°C`,
    humidity: Math.floor(Math.random() * 100) + '%',
    wind: Math.floor(Math.random() * 20) + ' km/h'
  };
}