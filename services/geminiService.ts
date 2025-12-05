
import { GoogleGenAI, Modality, Schema, Type } from "@google/genai";
import { ClothingItem, Article, UserProfile } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is not configured.");
  }
  return new GoogleGenAI({ apiKey });
};

const getMimeType = (base64: string): string => {
  if (!base64) return 'image/jpeg';
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
};

// Helper to clean JSON from Markdown
const cleanJson = (text: string) => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean;
};

export interface EditorConfig {
  userProfile?: UserProfile;
  tone?: string;
  keywords?: string[];
}

// --- AGENT: THE EDITOR ---
// Generates the content structure of the article using Search Grounding
export const agentEditor = async (topic: string, config: EditorConfig = {}): Promise<Partial<Article>> => {
  const ai = getClient();
  const { userProfile, tone, keywords } = config;

  let context = "";
  if (userProfile) {
    context = `
        TARGET AUDIENCE PROFILE:
        - Name: ${userProfile.name}
        - Occupation: ${userProfile.occupation}
        - Style Keywords: ${userProfile.styleKeywords.join(', ')}
        
        Tailor the angle for this specific persona.
        `;
  }

  let toneInstruction = "Voice: Visceral, raw, bold, confident, and distinctly HUMAN. Style: Brutalist fashion journalism (think Dazed, Hypebeast, Highsnobiety).";
  if (tone) {
    // Special handling for the Street Luxe / UK Urban voice
    if (tone === "Street Luxe / UK Urban") {
      toneInstruction = `
                PERSONA: You are a 23-year-old Black writer from the UK with deep roots in urban street culture.
                
                EXPERTISE:
                - You understand the streets and the culture that drives fashion from the ground up
                - You have an encyclopedic knowledge of luxury fashion houses and their evolution
                - You see the intersection where streetwear meets high fashion as the most exciting space in contemporary style
                - You recognize how street culture has influenced and transformed luxury brands
                
                VOICE CHARACTERISTICS:
                - Authentic and culturally aware - you speak from lived experience
                - Contemporary and relatable - your language reflects current UK urban vernacular (but remains accessible)
                - Insightful about cultural movements - you understand WHY trends matter, not just WHAT they are
                - Confident in mixing high and low - you see no contradiction in pairing Supreme with Saint Laurent
                - Critical and discerning - you call out when luxury brands appropriate without understanding
                
                WRITING STYLE:
                - Use contemporary British slang naturally (but don't overdo it)
                - Reference both underground UK fashion scenes and global luxury trends
                - Discuss the democratization of luxury and how streetwear changed the game
                - Highlight collaborations between street brands and luxury houses
                - Address the cultural significance of fashion, not just aesthetics
                - Be opinionated but informed - have a point of view
                - Avoid corporate fashion speak - keep it real and grounded
                
                CONTENT FOCUS:
                - Street culture's influence on luxury fashion
                - UK urban fashion movements and their global impact
                - How to authentically mix streetwear with luxury pieces
                - Emerging designers bridging both worlds
                - The evolution of luxury brands embracing street culture
                - Cultural commentary on fashion accessibility and gatekeeping
            `;
    } else {
      toneInstruction = `Voice/Tone: ${tone}. Ensure the writing style strictly matches this persona.`;
    }
  }

  let keywordsInstruction = "";
  if (keywords && keywords.length > 0) {
    keywordsInstruction = `MANDATORY KEYWORDS: The following words/phrases MUST be naturally woven into the article content: ${keywords.join(', ')}.`;
  }

  const prompt = `
        You are the Editor-in-Chief of 'RFLCTN', a cutting-edge digital fashion platform.
        
        TASK:
        1. Use Google Search to find the latest, real-world fashion news, underground trends, or designer collections related to: "${topic}".
        2. Write an article based on your findings.
        
        EDITORIAL GUIDELINES:
        - ${toneInstruction}
        - ${keywordsInstruction}
        - Avoid: Generic AI phrases ("tapestry", "realm", "testament", "delve"). Be opinionated, specific, and fresh.
        
        OUTPUT FORMAT:
        You must return a strictly valid JSON object. Do not include any text outside the JSON object.
        Structure:
        {
            "title": "Uppercase, punchy title (max 6 words)",
            "subtitle": "Intriguing subtitle (max 2 sentences)",
            "content": "HTML content. Use <p> for paragraphs, <blockquote> for pull quotes. Max 3 paragraphs. CSS classes: text-lg, leading-relaxed, text-stone-700.",
            "author": "A cool fictional persona name"
        }
        
        ${context}
    `;

  // NOTE: We cannot use responseSchema when using googleSearch tool.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // responseMimeType: "application/json" // NOT ALLOWED WITH TOOLS
    }
  });

  const text = response.text;
  if (!text) throw new Error("Editor Agent failed");

  console.log("Editor Raw Output:", text);

  try {
    return JSON.parse(cleanJson(text));
  } catch (e) {
    console.error("Failed to parse Editor JSON", e);
    throw new Error("AI produced invalid JSON format.");
  }
};

// --- AGENT: THE STYLIST ---
// Decides which items to feature based on the article content and adds affiliate links
export const agentStylist = async (articleContext: Partial<Article>): Promise<Partial<ClothingItem>[]> => {
  const ai = getClient();

  const prompt = `
        You are the Fashion Director. Based on this article:
        Title: ${articleContext.title}
        Subtitle: ${articleContext.subtitle}

        TASK:
        1. Curate a look consisting of exactly 4 items that embody this theme.
        2. Mix high-end brands (Rick Owens, Prada, Balenciaga, Acronym) with underground labels.
        3. Generate a specific "buyLink" for each item. This should be a realistic URL (e.g., a Google Shopping search URL or a specific brand store URL).
        
        OUTPUT:
        Return a JSON Array of objects with:
        - description (Visual description for image generation)
        - brand (High fashion brand)
        - price (Realistic luxury price string, e.g. "$1,200")
        - category (top, bottom, shoes, accessory)
        - buyLink (A valid URL to "buy" the item, pointing to a search query for that item)
    `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        brand: { type: Type.STRING },
        price: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['top', 'bottom', 'shoes', 'accessory'] },
        buyLink: { type: Type.STRING }
      },
      required: ["description", "brand", "price", "category", "buyLink"]
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const text = response.text;
  if (!text) throw new Error("Stylist Agent failed");
  return JSON.parse(text);
};

// --- AGENT: THE PHOTOGRAPHER ---
// Generates images for the items
export const agentPhotographer = async (items: Partial<ClothingItem>[]): Promise<ClothingItem[]> => {
  const ai = getClient();
  const results: ClothingItem[] = [];

  for (const item of items) {
    try {
      const prompt = `Studio product photography of ${item.description} by ${item.brand}. Minimalist style, white background, soft lighting, 4k resolution.`;

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4'
        }
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;

      // Simulate Affiliate Code Injection
      const affiliateLink = item.buyLink ? `${item.buyLink}&ref=RFLCTN_PARTNER` : `https://www.google.com/search?q=${encodeURIComponent((item.brand || '') + ' ' + item.description)}&tbm=shop`;

      if (imageBytes) {
        results.push({
          id: crypto.randomUUID(),
          type: item.category || 'unknown',
          category: item.category as any,
          description: item.description || 'Item',
          brand: item.brand,
          price: item.price,
          originalImage: imageBytes,
          processedImage: imageBytes,
          buyLink: affiliateLink,
          affiliateCode: 'RFLCTN_AUTO_GEN'
        });
      }
    } catch (e) {
      console.error(`Failed to photograph item: ${item.description}`, e);
    }
  }
  return results;
};

/**
 * Analyzes an uploaded image to identify the clothing item.
 */
export const analyzeClothingItem = async (base64Image: string): Promise<{ description: string; category: ClothingItem['category']; color: string }> => {
  try {
    const ai = getClient();

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "A short, 3-5 word description of the main clothing item." },
        category: { type: Type.STRING, enum: ['top', 'bottom', 'shoes', 'accessory', 'full-body', 'unknown'] },
        color: { type: Type.STRING, description: "The dominant color of the item." }
      },
      required: ["description", "category", "color"]
    };

    const mimeType = getMimeType(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: "Analyze this image. Identify the single most prominent clothing item. Ignore the person wearing it if present. Return the category and description." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis failed:", error);
    return { description: "Unknown Item", category: "unknown", color: "unknown" };
  }
};

/**
 * Attempts to "extract" the item by generating a clean version of it.
 */
export const extractClothingItem = async (base64Image: string, description: string, aspectRatio: string = "3:4"): Promise<string | null> => {
  try {
    const ai = getClient();
    const mimeType = getMimeType(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: `Create a professional product photograph of the ${description} visible in this image. Isolate the item on a pure white background. Ensure the texture, color, and details match the original image exactly. Remove any human models or body parts. Flat lay or invisible mannequin style.` }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE],
        // @ts-ignore
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
    return null;
  } catch (error) {
    console.error("Extraction failed:", error);
    return null;
  }
};

/**
 * Generates a new clothing item image from text description.
 */
export const generateClothingFromText = async (description: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `A professional studio product photography shot of ${description}. The item is isolated on a pure white background, laid out flat or on a ghost mannequin. High resolution, photorealistic, soft studio lighting.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '3:4',
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return imageBytes;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
};

/**
 * Generates the virtual try-on image.
 */
export const generateVirtualTryOn = async (
  userBase64: string,
  clothingItems: ClothingItem[]
): Promise<string> => {
  try {
    const ai = getClient();

    const userMimeType = getMimeType(userBase64);
    const parts: any[] = [
      { inlineData: { mimeType: userMimeType, data: userBase64 } }
    ];

    let prompt = "Generate a photorealistic image of the person in the FIRST image provided. They should be wearing the following items found in the subsequent images:\n";

    clothingItems.forEach((item, index) => {
      const imgData = item.processedImage || item.originalImage;
      const itemMimeType = getMimeType(imgData);

      parts.push({ inlineData: { mimeType: itemMimeType, data: imgData } });
      prompt += `- Item ${index + 1}: ${item.color ? item.color + ' ' : ''}${item.description} (shown in image ${index + 2})\n`;
    });

    prompt += "\nMaintain the person's original pose, body shape, and facial features from the first image exactly. Do not alter the face, only modify the clothing. The clothing should look naturally fitted on the body. The background should remain similar to the first image.";

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
    throw new Error("No image generated");

  } catch (error) {
    console.error("Try-on failed:", error);
    throw error;
  }
};

/**
 * Rewrites article content based on a specific style/persona.
 */
export const rewriteArticle = async (content: string, style: string): Promise<string> => {
  try {
    const ai = getClient();

    let instruction = "";

    if (style === "The Conscious Curator") {
      instruction = `
            TASK: Rewrite the HTML content below to match a "Conscious Curator" persona.
            The output must be sophisticated, advocating for sustainable luxury and the utility of virtual try-on technology.
        `;
    } else if (style === "Street Luxe / UK Urban") {
      instruction = `
            TASK: Rewrite the HTML content below in the voice of a 23-year-old Black UK writer who bridges street culture and luxury fashion.
            
            VOICE GUIDELINES:
            - Write from an authentic UK urban perspective with cultural awareness
            - Use contemporary British vernacular naturally (but keep it accessible)
            - Focus on how street culture influences and transforms luxury fashion
            - Be confident about mixing high-end and streetwear pieces
            - Discuss the cultural significance and democratization of fashion
            - Be opinionated but informed - have a clear point of view
            - Avoid generic fashion journalism clichés - keep it real and grounded
            - Reference both underground UK scenes and global luxury trends where relevant
        `;
    } else {
      instruction = `You are an expert fashion editor. Rewrite the following HTML content to match a "${style}" tone/style.`;
    }

    const prompt = `
      ${instruction}
      
      Rules for all modes:
      1. Keep the HTML tags (p, div, etc.) and structure intact, only change the text content inside them.
      2. Keep the specific clothing item names and brands mentioned exactly as they are.
      3. Maintain the length roughly.
      
      Content to rewrite:
      ${content}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || content;
  } catch (error) {
    console.error("Rewrite failed:", error);
    throw error;
  }
};

/**
 * Generates an audio narration of the article text using TTS.
 */
export const generateSpeech = async (text: string, style: string): Promise<string> => {
  try {
    const ai = getClient();

    // Map style to voice
    // Voices: 'Puck' (Tenor), 'Charon' (Baritone), 'Kore' (Alto), 'Fenrir' (Bass), 'Aoede' (Soprano)
    let voiceName = 'Puck'; // Default
    if (style === 'The Conscious Curator') voiceName = 'Kore'; // Calm/Warm
    if (style === 'Gen Z') voiceName = 'Fenrir'; // Deep/Cool/Energetic
    if (style === 'Professional') voiceName = 'Charon'; // Serious/Authoritative
    if (style === 'Street Luxe / UK Urban') voiceName = 'Charon'; // Contemporary/Confident

    // Clean html from text for better speech
    const cleanText = text.replace(/<[^>]*>/g, ' ').slice(0, 800); // Limit length for speed

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: cleanText }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (part) return part;

    throw new Error("No audio generated");
  } catch (error) {
    console.error("TTS failed:", error);
    throw error;
  }
};
