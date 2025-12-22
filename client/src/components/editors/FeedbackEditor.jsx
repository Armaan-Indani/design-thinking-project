import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AutoBulletTextArea from '../AutoBulletTextArea';

export default function FeedbackEditor({ content, onUpdate }) {
  // Initialize state from content or default
  const [items, setItems] = useState(content?.items || []);
  const initialized = useRef(false);

  // Initialize with default items if empty on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (!content?.items || content.items.length === 0) {
        const defaultItems = [
          { id: crypto.randomUUID(), question: 'What did you like about the prototype?', answer: '' },
          { id: crypto.randomUUID(), question: 'What could be improved?', answer: '' },
        ];
        setItems(defaultItems);
        onUpdate({ items: defaultItems });
      } else {
          setItems(content.items);
      }
    }
  }, []);

  // Sync to parent whenever local items change
  useEffect(() => {
    if (initialized.current) {
        onUpdate({ items });
    }
  }, [items]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), question: '', answer: '' }]);
  };

  const removeItem = (id) => {
    if (confirm('Delete this question?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Feedback Questions</h2>
        <button 
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-sm group">
            <div className="flex justify-between items-start mb-4">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {index + 1}</span>
               <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Question"
               >
                 <Trash2 size={16} />
               </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                placeholder="Enter your question here..."
                className="w-full text-base font-medium p-2 border-b-2 border-transparent focus:border-blue-500 bg-transparent outline-none dark:text-white placeholder-gray-400"
              />
              
              <AutoBulletTextArea
                value={item.answer}
                onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
                placeholder="Record user answer here..."
                className="w-full min-h-[96px]"
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No questions yet.</p>
            <button onClick={addItem} className="mt-2 text-blue-600 hover:underline">Add one to start</button>
          </div>
        )}
      </div>
    </div>
  );
}
