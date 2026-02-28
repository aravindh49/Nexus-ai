
import { GoogleGenAI, Type } from "@google/genai";
import { mockBackend } from "./mockBackend";

// The API key is obtained exclusively from environment variables.
// The availability of process.env.API_KEY is assumed per guidelines.
export const getGeminiResponse = async (prompt: string) => {
  try {
    // Create instance right before making the API call to ensure latest configuration.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const resources = await mockBackend.getResources();
    const tasks = await mockBackend.getTasks();

    const systemInstruction = `
      You are NexusAI, an advanced Operational Management Assistant. 
      You have real-time access to system resources and tasks.
      Current Resources: ${JSON.stringify(resources)}
      Current Tasks: ${JSON.stringify(tasks)}
      
      Tasks:
      1. Provide status updates on resources.
      2. Suggest optimizations.
      3. Identify critical bottlenecks.
      4. Use a professional, efficient tone.
      5. Format responses in clean Markdown.
    `;

    // Using gemini-3-flash-preview for general operational intelligence tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);

    // Fallback Mock AI if no API key is set
    return `**NEXUS AI MOCK RESPONSE** (API Offline/Invalid Key)
    
Processing query: *"${prompt}"*

Based on the current telemetry and active nodes, here is your simulated response:
- **System Status**: Nominal.
- **Resource Saturation**: Within acceptable limits.
- **Recommendations**: Continue monitoring the GPU cluster load. Auto-optimization is enabled.

*(Note: To enable true AI intelligence, please provide a valid Gemini API Key in the environment variables.)*`;
  }
};
