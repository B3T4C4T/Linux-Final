
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Store } from "../types";
import { STORE_CONFIGS } from "../constants";

/**
 * GeminiService handles all communication with the Google Gemini API.
 * It uses 'Google Search Grounding' to act as a virtual web scraper, 
 * retrieving real-time product information without needing custom scrapers for every site.
 */
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    /**
     * Initialize the Gemini client using the API Key provided by the environment.
     */
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Main search function. 
   * @param query - The text the user entered (e.g., "iPhone 15")
   * @param enabledStores - A set of Stores selected by the user to search in via the filter function.
   */
  async searchProducts(query: string, enabledStores: Set<Store>): Promise<Product[]> {
    // Generate a list of domains (e.g., "amazon.com, walmart.com") to narrow the AI's search focus.
    const storeDomains = Array.from(enabledStores)
      .map(store => STORE_CONFIGS[store].domain)
      .join(', ');

    /**
     * The prompt: Instruct the AI to perform a "deep scrape" via Google Search.
     * We explicitly demand that it finds the ACTUAL image used on the product listing page (seems to work slowly + not 100% of the time).
     * This (should) prevents generic placeholder results and ensures visual accuracy.
     */
    const prompt = `You are a professional web data extraction agent. 
    Perform a deep search for the product "${query}" on these specific retailers: ${storeDomains}.
    
    CRITICAL REQUIREMENT: For every product found, you MUST attempt to identify and extract the primary product image URL directly from the retailer's webpage content. Prioritize the actual photo used on the listing.
    
    For each result, return:
    1. The full product title.
    2. The exact current price (with currency symbol).
    3. The direct URL to the specific product listing page.
    4. The direct URL of the high-resolution product image found on that page.
    
    Return the results in a JSON array format. Aim for high relevance and quantity (up to 15 per store).`;

    try {
      // Execute the request using the 'gemini-3-pro-preview' model for high reasoning quality.
      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          // Enable Google Search to find current web data.
          tools: [{ googleSearch: {} }],
          // High reasoning time to ensure broader search results and better image extraction accuracy.
          thinkingConfig: { thinkingBudget: 16384 },
          responseMimeType: "application/json",
          // Define a strict schema to ensure the application doesn't crash from bad data.
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.STRING },
                source: { type: Type.STRING },
                url: { type: Type.STRING },
                image: { type: Type.STRING }
              },
              required: ["name", "price", "source", "url", "image"]
            }
          }
        },
      });

      // Extract text and parse as JSON.
      const rawText = response.text || "[]";
      let results: any[] = [];
      try {
          results = JSON.parse(rawText);
      } catch (e) {
          console.error("Failed to parse Gemini JSON output", e);
      }

      // Map the AI's raw JSON into our application's Product interface.
      return results.map((item, idx) => ({
        id: `${item.source}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        price: item.price,
        /**
         * IMAGE STRATEGY: 
         * 1. Try to find an image on-page
         * 2. If null, provide a high-quality "Product Placeholder" from Unsplash as a last resort.
         */
        image: item.image || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600`,
        source: this.mapSourceToStore(item.source),
        url: item.url || "#",
        description: `Source verified on ${item.source}`
      }));
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }

  /**
   * Helper to convert the AI's string-based source identification 
   * back into our structured Store enum.
   */
  private mapSourceToStore(sourceStr: string): Store {
    const s = sourceStr.toLowerCase();
    if (s.includes('amazon')) return Store.Amazon;
    if (s.includes('walmart')) return Store.Walmart;
    if (s.includes('target')) return Store.Target;
    if (s.includes('best buy')) return Store.BestBuy;
    if (s.includes('cvs')) return Store.CVS;
    if (s.includes('vons')) return Store.Vons;
    return Store.Amazon; // Default to Amazon if unsure
  }
}
