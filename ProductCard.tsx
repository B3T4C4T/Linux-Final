
import React, { useState } from 'react';
import { Product } from '../types';
import { STORE_CONFIGS } from '../constants';

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard: Displays individual product information in a clean, interactive tile.
 * Includes robust logic for handling images extracted from the web.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Local state to track if the AI-provided image URL is broken or fails to load.
  const [imageError, setImageError] = useState(false);
  
  // Get store-specific styling (icons, colors).
  const storeConfig = STORE_CONFIGS[product.source];

  /**
   * If the extracted image fails to load, we use a custom avatar/placeholder
   * generator that uses the product name to create a unique, colored tile.
   */
  const displayImage = imageError 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f3f4f6&color=9ca3af&size=400&bold=true`
    : product.image;

  return (
    <a 
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group flex flex-col h-full"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-white flex items-center justify-center p-2">
        {imageError ? (
          /* Placeholder UI - Shown when the source image fails to resolve */
          <div className="flex flex-col items-center justify-center text-gray-300 gap-3 text-center w-full h-full bg-gray-50 rounded-xl">
            <i className={`${storeConfig.icon} text-5xl mb-1 opacity-20`}></i>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 px-4">Image Source Unavailable</span>
          </div>
        ) : (
          /* Actual Product Image - Extracted from the retailer's site */
          <img 
            src={displayImage} 
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={() => setImageError(true)} // Catch broken or restricted links immediately
          />
        )}
        
        {/* Store Name Badge - Floating indicator of the source */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-lg z-10 ${storeConfig.color} transform group-hover:scale-105 transition-transform`}>
          {product.source}
        </div>
      </div>
      
      {/* Product Information Section */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        <h3 className="font-bold text-gray-800 line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors leading-tight text-sm">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Scraped Price</span>
            <div className="text-xl font-black text-gray-900 tracking-tighter">
              {product.price}
            </div>
          </div>
          
          {/* Action indicator */}
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
            GO <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
