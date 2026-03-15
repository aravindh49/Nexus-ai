import { mockBackend } from "./mockBackend";

// The dummy API key provided for demo deployment on the friend's system.
const DUMMY_API_KEY = "AIzaSyDdaWsSscVBdmszsotn0b_FfP0rn3QZoLQ";

export const getGeminiResponse = async (prompt: string) => {
  try {
    // Collect live data from the dashboard to give the AI context "for this site only"
    const resources = await mockBackend.getResources();
    const tasks = await mockBackend.getTasks();

    const systemInstruction = `
      You are NEXUS CENTRAL AI, an advanced Operational Command Center Assistant.
      You DO NOT give generic knowledge answers. You ONLY answer based on the live operations data of this specific site provided below.
      Be highly professional and concise, like a cyberpunk AI.
      
      [LIVE DASHBOARD TELEMETRY DATA]
      Current Servers/Nodes: ${JSON.stringify(resources.map(r => ({ id: r.id, name: r.name, load: r.currentLoad + '%', status: r.status })))}
      Active Tasks: ${JSON.stringify(tasks.map(t => ({ id: t.id, name: t.name, assignedTo: t.assignedResource, status: t.status })))}
      
      Instructions for your response:
      1. If the user asks for CPU load, tell them exactly which nodes are highest based on the data above.
      2. If you see a node with >80% load or CRITICAL status, warn the user and suggest an "AI Override".
      3. Format your responses with short bullet points in markdown.
    `;

    // Try to get from Vite env, fallback to the hardcoded dummy key the user provided
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || DUMMY_API_KEY;

    // Use native browser fetch instead of the Node SDK to prevent 'process is not defined' crashes in Vite
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to communicate with Gemini API");
    }

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    return "No intelligent response payload generated.";
  } catch (error: any) {
    console.error("Gemini Native Fetch Error:", error);

    // Fallback Mock AI if all network completely fails
    return `**NEXUS AI SYSTEM ERROR** (API Offline)
    
Error Details: ${error.message || "Unknown Network Exception"}

Unable to connect to the external Gemini Matrix. Please check your internet connection or API Key limits.`;
  }
};
