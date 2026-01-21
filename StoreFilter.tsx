
import React, { useState, useRef, useEffect } from 'react';
import { Store } from '../types';
import { STORE_CONFIGS } from '../constants';

interface StoreFilterProps {
  enabledStores: Set<Store>;
  onToggleStore: (store: Store) => void;
}

/**
 * StoreFilter: A custom dropdown menu that allows users to select 
 * which websites the AI should search.
 */
const StoreFilter: React.FC<StoreFilterProps> = ({ enabledStores, onToggleStore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to detect clicks outside the dropdown.
   * This is a UX standard that closes the menu if the user clicks anywhere else on the screen.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort stores alphabetically so the list is predictable for the user.
  const sortedStores = Object.values(Store).sort((a, b) => a.localeCompare(b));

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center items-center gap-x-2 w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <i className="fa-solid fa-sliders text-blue-600"></i>
          Filter Sources ({enabledStores.size})
          <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
      </div>

      {/* The Actual Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Marketplaces</h3>
          </div>
          
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {sortedStores.map((store) => {
              const config = STORE_CONFIGS[store];
              const isEnabled = enabledStores.has(store);

              return (
                <button
                  key={store}
                  onClick={() => onToggleStore(store)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {/* Store Brand Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${config.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <i className={config.icon}></i>
                    </div>
                    <span className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>{store}</span>
                  </div>
                  
                  {/* Custom Checkbox UI */}
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isEnabled ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                    {isEnabled && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Footer Action Button */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 shadow-md active:scale-95 transition-all"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreFilter;
