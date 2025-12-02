
export interface ClothingItem {
  id: string;
  originalImage: string; // Base64
  processedImage?: string; // Base64 (extracted item)
  type: string;
  description: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessory' | 'full-body' | 'unknown';
  color?: string;
  price?: string;
  brand?: string;
  brandLogo?: string; // URL or Base64 for brand logo
  buyLink?: string; // URL for purchasing
  affiliateCode?: string; // Affiliate tracking code
}

export interface UserProfile {
  name: string;
  email: string;
  country: string;
  city: string;
  referenceImages: string[]; // Array of Base64 strings for better 3D understanding
  height: string;
  weight: string;
  bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph' | 'Athletic' | 'Curvy' | 'Other';
  occupation: string;
  styleKeywords: string[];
  favoriteBrands: string[];
  styleIcons: string[];
  preferences: string;
  hasProfile: boolean;
}

export interface GeneratedOutfit {
  id: string;
  image: string; // Base64
  itemsUsed: string[]; // IDs of items
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  coverImage: string; // Base64 or URL
  content: string; // HTML/Markdown string
  items: ClothingItem[];
  themeColor?: string; // Added for the pastel aesthetic
  category?: 'Editorial' | 'Collection' | 'New Arrival';
}

export enum AppView {
  BLOG_FEED = 'BLOG_FEED',
  LONG_READS = 'LONG_READS',
  ARTICLE = 'ARTICLE',
  SAVED_LOOKS = 'SAVED_LOOKS',
  PROFILE = 'PROFILE',
  NEWSROOM = 'NEWSROOM'
}

// --- ANTIGRAVITY AGENT TYPES ---

export type AgentRole = 'EDITOR' | 'STYLIST' | 'PHOTOGRAPHER' | 'ORCHESTRATOR';

export interface AgentLog {
  id: string;
  role: AgentRole;
  message: string;
  timestamp: number;
  status: 'THINKING' | 'WORKING' | 'COMPLETED' | 'ERROR';
}

export interface MissionConfig {
  topic: string;
  tone: string;
  keywords: string[];
  targetAudience?: string;
  targetProfile?: UserProfile;
}
