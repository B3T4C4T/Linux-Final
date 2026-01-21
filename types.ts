
/**
 * Define the supported marketplaces for our search engine.
 * Removing specialized stores to simplify the core search experience.
 */
export enum Store {
  Amazon = 'Amazon',
  Walmart = 'Walmart',
  Target = 'Target',
  BestBuy = 'Best Buy',
  CVS = 'CVS',
  Vons = 'Vons'
}

/**
 * Interface representing a single product result scraped from a store.
 */
export interface Product {
  id: string;          // Unique identifier for React keys
  name: string;        // Product title
  price: string;       // Formatted price string
  image: string;       // URL to product image
  source: Store;       // The store where it was found
  url: string;         // Link to the actual product page
  description: string; // Brief description or source info
}

/**
 * Interface for managing search preferences and filters.
 */
export interface SearchFilters {
  enabledStores: Set<Store>;
  minPrice?: number;
  maxPrice?: number;
}
