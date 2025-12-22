import React, { useState, useEffect, useRef } from 'react';
import { AlignLeft, List, ListOrdered, CornerDownLeft } from 'lucide-react';

const MODE = {
  TEXT: 'text',
  BULLET: 'bullet',
  NUMBER: 'number'
};

export default function AutoBulletTextArea({ value, onChange, placeholder, className, ...props }) {
  const [mode, setMode] = useState(MODE.TEXT);
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  // Parse value into items when mode switches to LIST or on initial load if we want auto-detection (skipping auto-detect for now, default to text unless known structure?)
  // Actually, let's keep it simple: We control internal state.
  // When 'value' updates from outside (parent), we sync if it's different.
  
  // Initialize state from props
  useEffect(() => {
    // Simple heuristic: if starts with "• " or "1. ", it might be a list.
    // user explicitly requested "Either allows bullets for the entire block or not at all".
    // So we can check the first line.
    
    if (!value) {
        setItems([{ id: crypto.randomUUID(), text: '', indent: 0 }]);
        return;
    }

    const lines = value.split('\n');
    const firstLine = lines[0] || '';
    
    if (firstLine.trim().startsWith('• ')) {
        setMode(MODE.BULLET);
        parseList(value, '• ');
    } else if (/^\s*\d+\.\s/.test(firstLine)) {
        setMode(MODE.NUMBER);
        parseList(value, 'number');
    } else {
        // Only set to Text if we aren't already in valid list mode with empty items?
        // To avoid flickering, assume text if not strictly list format.
        // But if user is actively editing a list, we don't want to snap back.
        // For now, trusting internal state updates mostly, but syncing prop changes is needed for saving.
    }
  }, []);

  const parseList = (text, markerType) => {
    const lines = text.split('\n');
    const newItems = lines.map(line => {
      let indent = 0;
      let content = line;
      
      // Count indentation (2 spaces = 1 level)
      const spaceMatch = line.match(/^(\s*)/);
      if (spaceMatch) {
          indent = Math.floor(spaceMatch[1].length / 2);
      }

      // Remove marker
      if (markerType === 'number') {
          content = line.replace(/^\s*\d+\.\s/, '');
      } else {
          content = line.replace(/^\s*•\s/, '');
      }
      
      // If line was just marker, content is empty
      return {
          id: crypto.randomUUID(),
          text: content,
          indent: indent
      };
    });
    
    if (newItems.length === 0) {
        newItems.push({ id: crypto.randomUUID(), text: '', indent: 0 });
    }
    setItems(newItems);
  };

  // Serialize items to string and call onChange
  const updateParent = (currentMode, currentItems) => {
    let result = '';
    if (currentMode === MODE.TEXT) {
        // Should catch this before calling, but if we are in text mode, value is driven by textarea
        return; 
    }

    // Calculate numbers for serialization if in NUMBER mode
    const counters = [0, 0, 0, 0, 0, 0]; // Depth 0-5

    result = currentItems.map((item, index) => {
        const indentStr = '  '.repeat(item.indent);
        
        let marker = '';
        if (currentMode === MODE.BULLET) {
            marker = '• ';
        } else {
            // Number mode logic identical to render logic
            counters[item.indent]++;
            // Reset deeper
            for(let i = item.indent + 1; i < counters.length; i++) counters[i] = 0;
            marker = `${counters[item.indent]}. `;
        }
                                
        return `${indentStr}${marker}${item.text}`;
    }).join('\n');
    
    // Call parent onChange
    // Mock event
    onChange({ target: { value: result, name: props.name } });
  };

  const handleModeChange = (newMode) => {
    if (mode === newMode) return;
    
    if (newMode === MODE.TEXT) {
      // Convert Items to Text (Plain join? Or keep markers?)
      // User said "bullets must not be normal text that can be messed with".
      // If we go to text mode, do we strip bullets? Or keep them as plain text?
      // "Allow bullets for the entire block or not at all" implies exclusive choice.
      // If I switch to text, I should probably strip the bullets to just have the text content?
      // OR, verify if "Text Mode" is just for plain paragraphs.
      // Let's assume Text Mode = Plain Text (No bullets).
      
      const plainText = items.map(i => i.text).join('\n'); // Lose indentation? Or keep indent?
      // Let's keep indentation but strip markers.
      // onChange({ target: { value: plainText, name: props.name } });
      
      // Actually, safest is to parse current value into items first if coming from text?
      // If coming from List to Text -> Serialize with bullets so data isn't lost?
      // But user said "bullets must not be normal text".
      // OK, let's behave like a rich editor:
      // List Mode -> Renders structured list.
      // Text Mode -> Renders plain text block.
      // If I switch List -> Text, I'll provide the raw text with markers so they don't lose data.
      // But purely for editing.
      updateParent(mode, items);
      setMode(newMode);
    } else if (mode !== MODE.TEXT && newMode !== MODE.TEXT) {
      // List -> List (Bullet <-> Number)
      // Just switch mode and re-serialize. Items structure remains same.
      setMode(newMode);
      updateParent(newMode, items);
    } else {
      // Text -> List
      // Parse text into items
      // If value is empty, start empty
      // If value has text, split by newlines and treat as items
      const lines = value ? value.split('\n') : [''];
      const newItems = lines.map(line => {
          // If line has existing marker, strip it?
          let content = line.trim();
          let indent = 0;
          // Clean existing markers if any
          // Check for indentation in original line before trim?
          // Actually, we should check original line for indentation, but trim content.
          const originalLine = line;
          const indentMatch = originalLine.match(/^(\s*)/);
          if (indentMatch) {
              // Existing indent from text mode (if user typed spaces manually)
              // But standard text mode usually doesn't enforce 2-space structure.
              // Let's rely on the regex strippers below which capture indentation + marker
          }

          // Try to detect existing list structure even if coming from 'Text' mode
          // (User might have pasted a list)
          const listMatch = originalLine.match(/^(\s*)(•|\d+\.)\s+(.*)/);
          if (listMatch) {
             indent = Math.floor(listMatch[1].length / 2);
             content = listMatch[3];
          } else {
             // Non-list line
             // Keep content as is, indent 0
             content = line.trim();
          }
          
          return {
              id: crypto.randomUUID(),
              text: content,
              indent: indent
          };
      });
      setItems(newItems);
      setMode(newMode);
      updateParent(newMode, newItems);
    }
  };

  // --- List Interaction Handlers ---

  const handleItemChange = (id, newText) => {
    const newItems = items.map(item => item.id === id ? { ...item, text: newText } : item);
    setItems(newItems);
    updateParent(mode, newItems);
  };

  const handleKeyDown = (e, index) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          const currentItem = items[index];
          
          // New Item creation
          const newItem = {
              id: crypto.randomUUID(),
              text: '',
              indent: currentItem.indent
          };
          
          const newItems = [...items];
          newItems.splice(index + 1, 0, newItem);
          setItems(newItems);
          updateParent(mode, newItems);
          
          // Focus next input
          setTimeout(() => {
              const inputs = containerRef.current.querySelectorAll('input');
              if (inputs[index + 1]) inputs[index + 1].focus();
          }, 0);
      }
      else if (e.key === 'Backspace' && items[index].text === '') {
          // Merge / Delete logic
          if (items.length > 1) {
              e.preventDefault();
              const newItems = items.filter(item => item.id !== items[index].id);
              setItems(newItems);
              updateParent(mode, newItems);
              
              // Focus previous
              setTimeout(() => {
                const inputs = containerRef.current.querySelectorAll('input');
                const prevIndex = index - 1 >= 0 ? index - 1 : 0;
                if (inputs[prevIndex]) {
                    inputs[prevIndex].focus();
                    // Set cursor to end?
                }
              }, 0);
          }
      }
      else if (e.key === 'Tab') {
          e.preventDefault();
          const newIndent = e.shiftKey 
            ? Math.max(0, items[index].indent - 1)
            : Math.min(items[index].indent + 1, 5); // Max depth 5
            
          const newItems = [...items];
          newItems[index] = { ...newItems[index], indent: newIndent };
          setItems(newItems);
          updateParent(mode, newItems);
      }
      else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const inputs = containerRef.current.querySelectorAll('input');
          if (inputs[index - 1]) inputs[index - 1].focus();
      }
      else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const inputs = containerRef.current.querySelectorAll('input');
          if (inputs[index + 1]) inputs[index + 1].focus();
      }
  };

  // Helper to get number for an item based on logic (e.g. restart on indent change?)
  // Simple Indent-reset logic:
  // Maintain a counters array [0, 0, 0, 0, 0]
  // When traversing, increment counter at current indent. Reset all deeper counters.
  const getNumber = (index) => {
      // This is expensive to calc on render for list, but fine for small lists (Top ~20 items)
      // A full pass is safer.
      // Let's just do a quick pass logic inside the render map since we need previous context?
      // Actually we can just compute it on the fly in the component function body.
      return index + 1; // Fallback placeholder
  };
  
  // Calculate numbers
  const itemNumbers = {}; // id -> number string
  if (mode === MODE.NUMBER) {
      const counters = [0, 0, 0, 0, 0, 0]; // Depth 0-5
      items.forEach(item => {
          counters[item.indent]++;
          // Reset deeper
          for(let i = item.indent + 1; i < counters.length; i++) counters[i] = 0;
          itemNumbers[item.id] = `${counters[item.indent]}.`;
      });
  }

  return (
    <div className="flex flex-col border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden" {...props}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
         <button
            type="button"
            onClick={() => handleModeChange(MODE.TEXT)}
            className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${mode === MODE.TEXT ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            title="Plain Text"
         >
            <AlignLeft size={16} />
         </button>
         <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
         <button
            type="button"
            onClick={() => handleModeChange(MODE.BULLET)}
            className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${mode === MODE.BULLET ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            title="Bullet List"
         >
            <List size={16} />
         </button>
         <button
            type="button"
            onClick={() => handleModeChange(MODE.NUMBER)}
            className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${mode === MODE.NUMBER ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            title="Numbered List"
         >
            <ListOrdered size={16} />
         </button>
      </div>

      {mode === MODE.TEXT ? (
        <textarea
            value={value}
            onChange={onChange}
            className={`flex-1 w-full bg-transparent p-3 outline-none resize-none dark:text-white ${className}`}
            placeholder={placeholder}
            style={{ minHeight: '150px' }}
        />
      ) : (
        <div 
            ref={containerRef}
            className="flex-1 w-full p-3 space-y-1 overflow-y-auto"
            style={{ minHeight: '150px', maxHeight: '500px' }}
        >
            {items.map((item, index) => (
                <div key={item.id} className="flex items-start group">
                    {/* Indent Spacer */}
                    <div style={{ width: `${item.indent * 24}px` }} className="shrink-0" />
                    
                    {/* Marker */}
                    <div className="w-8 shrink-0 text-right mr-2 text-gray-500 dark:text-gray-400 select-none font-medium text-sm pt-1">
                        {mode === MODE.BULLET ? '•' : itemNumbers[item.id]}
                    </div>
                    
                    {/* Input */}
                    <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleItemChange(item.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                        placeholder={index === 0 && items.length === 1 ? placeholder : ''}
                        autoFocus={index === items.length - 1 && items.length > 1} // Auto focus new items
                    />
                </div>
            ))}
            
            {/* Empty state helper? - Clicking empty area focuses last item? */}
            <div 
                className="flex-1 cursor-text min-h-[50px]" 
                onClick={() => {
                    const inputs = containerRef.current.querySelectorAll('input');
                    if(inputs.length > 0) inputs[inputs.length - 1].focus();
                }} 
            />
        </div>
      )}
    </div>
  );
}
