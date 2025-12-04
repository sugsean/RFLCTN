// services/antigravityService.ts

// TODO: Replace with your actual Cloud Run URL after deployment
const BACKEND_URL = "http://localhost:8080";

export interface MissionConfig {
    topic: string;
    tone: string;
    keywords: string[];
    targetAudience: string;
    style_guide?: string; // Optional: Text to train the writer's voice
    targetProfile?: any; // Optional: User profile for personalization
}

export interface MissionResponse {
    status: string;
    research_summary: string; // The raw research data
    article: string; // JSON string
    items: string;   // JSON string
}

export const AntigravityService = {
    dispatchMission: async (config: MissionConfig): Promise<MissionResponse> => {
        try {
            const response = await fetch(`${BACKEND_URL}/dispatch-mission`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to dispatch mission:", error);
            throw error;
        }
    },
};
