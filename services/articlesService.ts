// Service to fetch articles from static manifest

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
     * Fetch all articles from the static JSON manifest
     */
    static async fetchArticles(): Promise<RFLCTNArticle[]> {
        try {
            // Fetch the generated manifest file
            const response = await fetch('/articles.json');
            if (!response.ok) {
                throw new Error('Failed to fetch article manifest');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    }

    /**
     * Fetch a single article by ID
     * Note: In static mode, we fetch from the manifest or load the markdown file
     */
    static async fetchArticle(id: string): Promise<RFLCTNArticle | null> {
        try {
            const articles = await this.fetchArticles();
            return articles.find(a => a.id === id) || null;
        } catch (error) {
            console.error('Error fetching article:', error);
            return null;
        }
    }

    static async checkBackend(): Promise<boolean> {
        try {
            const response = await fetch('/articles.json');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
