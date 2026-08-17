import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes when key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your Gemini API Key in the Secrets panel (Settings > Secrets).");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Endpoint to generate learning plans
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { topic, details } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const client = getAiClient();
    
    const prompt = `Generate a comprehensive, realistic, and highly structured learning plan for learning about: "${topic}".
Additional preferences/details: "${details || 'None provided'}".

Provide a logical sequence of modules, each containing specific tracking tasks, study durations in minutes, and actionable reference/study resource suggestions. Make the plan clear, encouraging, and highly detailed.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert learning coach and instructional designer. Create highly effective study schedules and curricula that break complex technical or creative topics down into actionable steps. Avoid introductory fluff; deliver structured modules and tasks.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING,
              description: "Elegant, clean name for the learning plan" 
            },
            description: { 
              type: Type.STRING,
              description: "A short, motivating summary of what the user will achieve" 
            },
            duration: { 
              type: Type.STRING,
              description: "Suggested overall duration (e.g., '3 Weeks', '15 Days')" 
            },
            modules: {
              type: Type.ARRAY,
              description: "Structured learning blocks ordered sequentially",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique slug, e.g. 'm1-basics'" },
                  title: { type: Type.STRING, description: "Module title" },
                  description: { type: Type.STRING, description: "Short summary of learning goals" },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "Unique task slug, e.g. 't1-install'" },
                        title: { type: Type.STRING, description: "Actionable study or practice task" },
                        durationMinutes: { 
                          type: Type.INTEGER, 
                          description: "Suggested study session duration in minutes (e.g. 25, 45, 60)" 
                        },
                        resources: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "High-quality reference topics, search terms, docs, or ideas to research"
                        }
                      },
                      required: ["id", "title", "durationMinutes"]
                    }
                  }
                },
                required: ["id", "title", "description", "tasks"]
              }
            }
          },
          required: ["title", "description", "duration", "modules"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini model');
    }

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    }
    
    const planData = JSON.parse(cleanedText);
    res.json(planData);
  } catch (error: any) {
    console.error('Error generating plan:', error);
    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while generating your learning plan.' 
    });
  }
});

// Endpoint to generate daily inspiration
app.get('/api/daily-inspiration', async (req, res) => {
  try {
    const client = getAiClient();
    const prompt = `Generate a short, powerful, and deeply motivating daily Bible verse about discipline, focus, learning, or strength. Provide just the verse text and the reference (e.g. "Verse text." - Book Chapter:Verse). Do not add any extra commentary.`;
    
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini model');
    }
    
    res.json({ quote: text.trim() });
  } catch (error: any) {
    console.error('Error generating daily inspiration:', error);
    res.status(500).json({ error: 'Failed to generate inspiration' });
  }
});

// Serve frontend assets and routes
async function setupViteMiddleware() {
  const http = await import('http');
  const server = http.createServer(app);
  
  const { Server } = await import('socket.io');
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  // Basic room logic
  const rooms = new Map<string, Map<string, any>>(); // roomId -> Map<socketId, userState>

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (data) => {
      const { roomId, user } = data;
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      
      const room = rooms.get(roomId)!;
      room.set(socket.id, { 
        socketId: socket.id,
        user, 
        state: 'idle', 
        taskName: '',
        joinedAt: Date.now()
      });

      // Broadcast to room
      io.to(roomId).emit('room-state', Array.from(room.values()));
    });

    socket.on('update-state', (data) => {
      const { roomId, state, taskName } = data;
      const room = rooms.get(roomId);
      if (room && room.has(socket.id)) {
        const userState = room.get(socket.id)!;
        userState.state = state;
        userState.taskName = taskName;
        io.to(roomId).emit('room-state', Array.from(room.values()));
      }
    });

    socket.on('send-message', (data) => {
      const { roomId, message, user } = data;
      io.to(roomId).emit('new-message', {
        id: Date.now().toString(),
        text: message,
        user,
        timestamp: Date.now()
      });
    });

    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          const room = rooms.get(roomId);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) {
              rooms.delete(roomId);
            } else {
              io.to(roomId).emit('room-state', Array.from(room.values()));
            }
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteMiddleware();
