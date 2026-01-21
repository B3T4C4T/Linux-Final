
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Store, Product } from './types';
import { INITIAL_STORES, STORE_CONFIGS } from './constants';
import { GeminiService } from './services/geminiService';
import StoreFilter from './components/StoreFilter';
import ProductCard from './components/ProductCard';

/**
 * Define available sorting methods for the search results.
 */
type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'store-asc' | 'store-desc';

// Controls how many products are shown per page of results.
const ITEMS_PER_PAGE = 8;

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [query, setQuery] = useState('');                      // Current search input
  const [products, setProducts] = useState<Product[]>([]);      // All products found by AI
  const [loading, setLoading] = useState(false);               // Loading spinner state
  const [enabledStores, setEnabledStores] = useState<Set<Store>>(new Set(INITIAL_STORES)); // User store selections
  const [error, setError] = useState<string | null>(null);     // Error messages for the user
  const [sortBy, setSortBy] = useState<SortOption>('price-asc'); // Sorting preference
  const [currentPage, setCurrentPage] = useState(1);           // Current pagination page

  // Initialize the Gemini AI Search Service.
  const geminiService = useMemo(() => new GeminiService(), []);

  /**
   * handleSearch: Triggered when the user submits the search form.
   * Calls the Gemini API and updates the product list.
   */
  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1); // Always start back at page 1 for a new search
    
    try {
      const results = await geminiService.searchProducts(query, enabledStores);
      setProducts(results);
      if (results.length === 0) {
        setError("No products found for the selected stores. Try adjusting your filters or query.");
      }
    } catch (err) {
      setError("Failed to fetch product data. Please check your network or API settings.");
    } finally {
      setLoading(false);
    }
  }, [query, enabledStores, geminiService]);

  /**
   * toggleStore: Adds or removes a store from the search criteria.
   */
  const toggleStore = (store: Store) => {
    const next = new Set(enabledStores);
    if (next.has(store)) {
      // Don't allow deselecting the last store.
      if (next.size > 1) next.delete(store);
    } else {
      next.add(store);
    }
    setEnabledStores(next);
  };

  /**
   * Helper to convert strings like "$49.99" into numbers like 49.99 for sorting.
   */
  const parsePrice = (priceStr: string): number => {
    const numeric = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(numeric) || 0;
  };

  /**
   * sortedProducts: Computes the product list order based on user selection.
   * useMemo ensures this only runs when results or sort order actually change.
   */
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return parsePrice(a.price) - parsePrice(b.price);
        case 'price-desc': return parsePrice(b.price) - parsePrice(a.price);
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'store-asc': return a.source.localeCompare(b.source);
        case 'store-desc': return b.source.localeCompare(a.source);
        default: return 0;
      }
    });
  }, [products, sortBy]);

  /**
   * currentItems: The slice of sorted products specifically for the current page.
   */
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  /**
   * Navigation handler for pagination buttons.
   */
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* --- SITE HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              <i className="fa-solid fa-magnifying-glass-dollar text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 hidden sm:block">
              PriceScout<span className="text-blue-600">AI</span>
            </h1>
          </div>

          {/* --- SEARCH FORM --- */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 sm:mx-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search products across major retailers..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fa-solid fa-gear text-lg"></i>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm"></div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Search Controls (Filter & Sort) */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Control Center
            </h2>
            <div className="flex items-center gap-4">
              <StoreFilter enabledStores={enabledStores} onToggleStore={toggleStore} />
              
              {products.length > 0 && !loading && (
                <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 shadow-sm outline-none cursor-pointer transition-all hover:bg-gray-50 font-semibold"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A-Z</option>
                    <option value="name-desc">Name: Z-A</option>
                    <option value="store-asc">Store: A-Z</option>
                    <option value="store-desc">Store: Z-A</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {products.length > 0 && !loading && (
            <div className="text-sm text-gray-400 font-medium">
              Showing <span className="text-gray-900 font-bold">{currentItems.length}</span> of <span className="text-gray-900 font-bold">{products.length}</span> results
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-gray-600 font-medium text-lg animate-pulse tracking-wide">Searching...</p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-sm">
            <i className="fa-solid fa-circle-exclamation text-red-400 text-5xl mb-6"></i>
            <h3 className="text-xl font-bold text-red-900 mb-2">{error}</h3>
            <p className="text-red-700">Please try again or select different storefronts.</p>
          </div>
        ) : products.length > 0 ? (
          /* SUCCESS STATE (Product Grid) */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {currentItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-12">
                <button 
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all active:scale-95 font-bold ${
                      currentPage === page 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          /* IDLE STATE (Landing View) */
          <div className="flex flex-col items-center justify-center py-40 text-center opacity-40">
            <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <i className="fa-solid fa-basket-shopping text-6xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2 uppercase tracking-widest text-xs">Awaiting Command</h3>
            <p className="max-w-md text-gray-500">Search for products across major retailers like Amazon, Target, and Walmart instantly.</p>
          </div>
        )}
      </main>

      {/* --- SITE FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-gray-900 mb-5 uppercase text-xs tracking-widest">Advanced Price Intelligence</h4>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                PriceScout leverages Gemini 3.0 with Search Grounding to simulate highly efficient virtual scrapers. 
                The engine aggregates data from major retailers and local grocery chains.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-5 uppercase text-xs tracking-widest">Marketplaces</h4>
              <ul className="text-gray-500 text-sm space-y-3">
                {Object.entries(STORE_CONFIGS).map(([store, config]) => (
                  <li key={store}>
                    <a 
                      href={`https://www.${config.domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-medium hover:text-blue-600 transition-colors"
                    >
                      <i className={`${config.icon} w-5 text-center`}></i>
                      {store}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-100 text-center text-gray-400 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} PriceScout Intelligence. Simplified for rapid product comparison.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
