// Service to fetch articles from the backend API

const API_BASE_URL = 'http://localhost:8000';

export interface RFLCTNArticle {
    id: string;
    title: string;
    subtitle: string;
    author: string;
    date: string;
    coverImage: string;
    content: string;
    items: any[];
    themeColor?: string;
    category?: 'Editorial' | 'Collection' | 'New Arrival';
    style?: string;
    sourceUrl?: string;
}

export class ArticlesService {
    /**
     * Fetch all articles from the backend
     */
    static async fetchArticles(): Promise<RFLCTNArticle[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/articles`);
            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    }

    /**
     * Fetch a single article by ID
     */
    static async fetchArticle(id: string): Promise<RFLCTNArticle | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch article');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching article:', error);
            return null;
        }
    }

    /**
     * Check if the backend API is available
     */
    static async checkBackend(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
