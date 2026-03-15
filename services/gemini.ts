import { mockBackend } from "./mockBackend";

export const getGeminiResponse = async (prompt: string) => {
  try {
    // Collect live data from the dashboard to give the AI context "for this site only"
    const resources = await mockBackend.getResources();
    const tasks = await mockBackend.getTasks();

    // Simulate "thinking" time for the UI
    await new Promise(resolve => setTimeout(resolve, 600));

    const lowerPrompt = prompt.toLowerCase();
    let response = "";

    // Offline Local Rule-Based Engine
    if (lowerPrompt.includes("cpu") || lowerPrompt.includes("load")) {
      response += "**Live CPU / Load Telemetry:**\n\n";
      resources.forEach(r => {
        const marker = r.currentLoad > 80 ? '🔴 WARNING' : (r.currentLoad > 60 ? '🟡 ELEVATED' : '🟢 NORMAL');
        response += `- **${r.name}**: ${r.currentLoad}% [${marker}]\n`;
      });
      response += "\n*Systems are actively monitored.*";
    }
    else if (lowerPrompt.includes("status") || lowerPrompt.includes("critical") || lowerPrompt.includes("alert")) {
      const criticalNodes = resources.filter(r => r.status === 'CRITICAL' || r.currentLoad > 80);
      if (criticalNodes.length > 0) {
        response += "**CRITICAL ADVISORY!**\n\nThe following systems require immediate attention:\n\n";
        criticalNodes.forEach(r => {
          response += `- **${r.name}** is reporting a load of ${r.currentLoad}%\n`;
        });
        response += "\n*Recommendation: Execute AI Override protocol from the Notification Bell immediately.*";
      } else {
        response += "**System wide Status:**\n\nAll matrix nodes and server clusters are currently operating within nominal parameters. No critical anomalies detected at this time.";
      }
    }
    else if (lowerPrompt.includes("task") || lowerPrompt.includes("work")) {
      response += "**Active Task Roster:**\n\n";
      tasks.forEach(t => {
        response += `- [**${t.status}**] ${t.name} -> Assigned to: *${t.assignedResource}*\n`;
      });
    }
    else {
      response += `**NEXUS OFFLINE LOCAL AI**\n\nReceived query: *"${prompt}"*\n\nI am currently operating in **Local Telemetry Mode** (External API disconnected). \n\nI can instantly provide real-time data on:\n- **"CPU Load"**\n- **"System Status"**\n- **"Active Tasks"**\n\nPlease ask about one of these operational metrics.`;
    }

    return response;

  } catch (error: any) {
    console.error("Local Engine Error:", error);
    return `**NEXUS AI SYSTEM ERROR**
    
Error Details: ${error.message || "Unknown Exception"}

The Internal Telemetry Processor failed to parse the dashboard data.`;
  }
};
