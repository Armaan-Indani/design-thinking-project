import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const COLORS = {
  emotions: 'bg-orange-100 border-orange-300 text-gray-900',
  actions: 'bg-orange-200 border-orange-400 text-gray-900',
  touchpoints: 'bg-amber-200 border-amber-400 text-gray-900', // Yellow/Gold
  frontstage: 'bg-teal-200 border-teal-400 text-gray-900',
  backstage: 'bg-blue-600 text-white border-blue-700', // Darker blue
  support: 'bg-purple-900 text-white border-purple-950', // Dark purple
};

const HEADER_COLORS = {
  emotions: 'bg-orange-400 text-white',
  actions: 'bg-orange-500 text-white',
  touchpoints: 'bg-amber-400 text-white',
  frontstage: 'bg-teal-500 text-white',
  backstage: 'bg-blue-700 text-white',
  support: 'bg-purple-800 text-white',
};

const ROWS = [
  { id: 'emotions', label: 'Customer Emotions', color: 'emotions' },
  { id: 'actions', label: 'Customer Actions', color: 'actions' },
  { id: 'touchpoints', label: 'Touch Points', color: 'touchpoints' },
  { id: 'frontstage', label: 'Frontstage', color: 'frontstage' },
  { id: 'backstage', label: 'Backstage', color: 'backstage' },
  { id: 'support', label: 'Support Processes', color: 'support' },
];

export default function ServiceBlueprintEditor({ content, onUpdate }) {
  // Initialize from content or create default structure
  // New structure: content.rows = { emotions: [{id, text}], actions: [{id, text}], ... }
  // Migration logic: if 'steps' exists, spread them into the new format
  const [rowItems, setRowItems] = useState(() => {
    if (content?.rowItems) return content.rowItems;
    
    // Default initial state
    const defaults = {
        emotions: [{ id: 1, text: '' }, { id: 2, text: '' }],
        actions: [{ id: 3, text: '' }, { id: 4, text: '' }],
        touchpoints: [{ id: 5, text: '' }, { id: 6, text: '' }],
        frontstage: [{ id: 7, text: '' }, { id: 8, text: '' }],
        backstage: [{ id: 9, text: '' }, { id: 10, text: '' }],
        support: [{ id: 11, text: '' }, { id: 12, text: '' }],
    };

    // Migration from old 'steps' format if present
    if (content?.steps && Array.isArray(content.steps)) {
       const migrated = { ...defaults };
       // Clear defaults first to strictly follow steps? 
       // No, typically user wants to keep data.
       const newRowItems = {
           emotions: [], actions: [], touchpoints: [], frontstage: [], backstage: [], support: []
       };
       content.steps.forEach((step) => {
           ROWS.forEach(row => {
               if (step[row.id]) {
                   newRowItems[row.id].push({ id: Math.random(), text: step[row.id] });
               }
           });
       });
       // If empty after migration (e.g. empty steps), fallback to defaults?
       // Let's just use what we extracted. If empty, so be it (user can add).
       return newRowItems;
    }

    return defaults;
  });

  useEffect(() => {
    // Save as rowItems
    onUpdate({ ...content, rowItems, steps: undefined }); // Remove legacy 'steps'
  }, [rowItems]);

  const handleTextChange = (rowId, itemId, value) => {
    setRowItems(prev => ({
        ...prev,
        [rowId]: prev[rowId].map(item => item.id === itemId ? { ...item, text: value } : item)
    }));
  };

  const addItem = (rowId) => {
    setRowItems(prev => ({
        ...prev,
        [rowId]: [...prev[rowId], { id: Date.now(), text: '' }]
    }));
  };

  const removeItem = (rowId, itemId) => {
    setRowItems(prev => ({
        ...prev,
        [rowId]: prev[rowId].filter(item => item.id !== itemId)
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      <div className="flex-1 overflow-auto">
        <div className="min-w-max w-full bg-white dark:bg-gray-800">
          
          {ROWS.map((row) => (
            <React.Fragment key={row.id}>
              {/* Separators */}
              {row.id === 'frontstage' && (
                <div className="bg-gray-700 text-white text-xs font-bold py-1 px-4 text-center border-t border-b border-white border-dashed">
                  Line of Interaction
                </div>
              )}
              {row.id === 'backstage' && (
                <div className="bg-gray-700 text-white text-xs font-bold py-1 px-4 text-center border-t border-b border-white border-dashed">
                  Line of Visibility
                </div>
              )}
               {row.id === 'support' && (
                <div className="bg-gray-700 text-white text-xs font-bold py-1 px-4 text-center border-t border-b border-white border-dashed">
                  Line of Internal Interaction
                </div>
              )}


              <div className="flex w-full items-stretch border-b border-gray-200 dark:border-gray-700 last:border-0 relative">
                {/* Header Column */}
                <div className={`w-48 flex-shrink-0 p-4 flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700 ${HEADER_COLORS[row.color]} relative group/header`}>
                  <div className="font-bold text-center leading-tight">{row.label}</div>
                  
                  {/* Add Button in Header - REMOVED */}
                </div>

                {/* Row Content - Space Around */}
                <div className="flex-1 flex items-center justify-around p-4 relative bg-slate-50 dark:bg-slate-900 min-h-[120px]">
                    {rowItems[row.id]?.length === 0 && (
                        <div className="text-gray-400 italic text-sm">No items.</div>
                    )}

                    {rowItems[row.id]?.map((item, index) => (
                        <div key={item.id} className="relative group mx-4 first:ml-0 last:mr-0 min-w-[180px] max-w-[400px] flex-shrink-0">
                            <div className={`relative grid ${row.id === 'backstage' || row.id === 'support' ? 'min-h-[8rem]' : 'min-h-[6rem]'}`}>
                                {/* Hidden div for size measurement */}
                                <div className={`col-start-1 row-start-1 p-3 text-sm whitespace-pre-wrap break-words border border-transparent opacity-0 pointer-events-none ${row.id === 'backstage' || row.id === 'support' ? 'min-h-[8rem]' : 'min-h-[6rem]'}`}>
                                    {item.text + ' '}
                                </div>

                                {/* Actual Input */}
                                <textarea
                                    className={`col-start-1 row-start-1 w-full h-full p-3 text-sm rounded border shadow-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors overflow-hidden ${COLORS[row.color]} ${row.id === 'backstage' || row.id === 'support' ? 'placeholder-gray-300' : 'placeholder-gray-500'}`}
                                    placeholder="Insert text..."
                                    value={item.text}
                                    onChange={(e) => handleTextChange(row.id, item.id, e.target.value)}
                                />
                                
                                <button 
                                    onClick={() => removeItem(row.id, item.id)}
                                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-red-200 shadow-sm z-20"
                                    title="Remove Item"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Button at Right End */}
                    <button 
                        onClick={() => addItem(row.id)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-full p-2 transition-colors border border-blue-300 dark:border-blue-700 shadow-sm"
                        title="Add Item"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </React.Fragment>
          ))}

        </div>
      </div>
    </div>
  );
}
