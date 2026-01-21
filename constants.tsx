
import { Store } from './types';

/**
 * The default stores selected when the application first loads.
 */
export const INITIAL_STORES = [Store.Amazon, Store.Walmart, Store.Target];

/**
 * Visual and functional configuration for each supported store.
 * domain: Used to guide the AI search to specific websites.
 * color: Tailwind background class for the store badge.
 * icon: FontAwesome icon class representing the store.
 */
export const STORE_CONFIGS: Record<Store, { domain: string; color: string; icon: string }> = {
  [Store.Amazon]: { domain: 'amazon.com', color: 'bg-orange-500', icon: 'fa-brands fa-amazon' },
  [Store.Walmart]: { domain: 'walmart.com', color: 'bg-blue-600', icon: 'fa-solid fa-cart-shopping' },
  [Store.Target]: { domain: 'target.com', color: 'bg-red-600', icon: 'fa-solid fa-bullseye' },
  [Store.BestBuy]: { domain: 'bestbuy.com', color: 'bg-yellow-400', icon: 'fa-solid fa-tag' },
  [Store.CVS]: { domain: 'cvs.com', color: 'bg-red-500', icon: 'fa-solid fa-prescription-bottle-medical' },
  [Store.Vons]: { domain: 'vons.com', color: 'bg-red-800', icon: 'fa-solid fa-apple-whole' },
};
