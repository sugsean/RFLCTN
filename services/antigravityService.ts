// services/antigravityService.ts

// Backend URL - Cloud Run deployment
const BACKEND_URL = "https://rflctn-backend-840634477368.us-central1.run.app";

export interface MissionConfig {
    topic: string;
    tone: string;
    keywords: string[];
    targetAudience: string;
    styleGuide?: string; // Optional: Text to train the writer's voice
    targetProfile?: any; // Optional: User profile for personalization
}

export interface MissionResponse {
    id: string;
    title: string;
    subtitle: string;
    author: string;
    date: string;
    coverImage: string;
    content: string;
    items: any[];
    themeColor: string;
    category: string;
    style: string;
    sourceUrl: string;
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
