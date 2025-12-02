
import { Article, MissionConfig, AgentLog, AgentRole } from "../types";

const BACKEND_URL = "https://your-cloud-run-url.run.app"; // Replace after deployment

export class AntigravityClient {
  private listeners: ((log: AgentLog) => void)[] = [];

  public onLog(listener: (log: AgentLog) => void) {
    this.listeners.push(listener);
  }

  private emit(role: AgentRole, message: string, status: AgentLog['status'] = 'WORKING') {
    const log: AgentLog = {
      id: crypto.randomUUID(),
      role,
      message,
      timestamp: Date.now(),
      status
    };
    this.listeners.forEach(fn => fn(log));
  }

  public async dispatchMission(config: MissionConfig): Promise<Article> {
    try {
      this.emit('ORCHESTRATOR', 'Establishing Uplink to Google Vertex AI...', 'THINKING');
      
      // 1. Send Request to Real Backend
      this.emit('EDITOR', `Transmitting brief: "${config.topic}"`, 'WORKING');
      
      const response = await fetch(`${BACKEND_URL}/dispatch-mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error("Backend Uplink Failed");

      // 2. Stream Simulated Progress while waiting (or use WebSockets for real streaming)
      this.emit('EDITOR', 'Analyzing search grounding data...', 'WORKING');
      this.emit('STYLIST', 'Curating affiliate inventory...', 'THINKING');
      this.emit('PHOTOGRAPHER', 'Generating visual assets via Imagen...', 'WORKING');

      const data = await response.json();

      // 3. Process Response
      this.emit('ORCHESTRATOR', 'Mission Data Received.', 'COMPLETED');
      
      // Transform backend data to frontend Article type
      return {
          id: crypto.randomUUID(),
          title: data.article.title,
          subtitle: data.article.subtitle,
          content: data.article.content,
          author: data.article.author,
          date: new Date().toLocaleDateString(),
          coverImage: data.items[0]?.image || "", // Use first generated item as cover
          items: data.items, // Ensure backend returns matching structure
          themeColor: '#E3E2E2',
          category: 'Editorial' 
      };

    } catch (error) {
      this.emit('ORCHESTRATOR', 'Mission Failed. Server Error.', 'ERROR');
      console.error(error);
      throw error;
    }
  }
}
