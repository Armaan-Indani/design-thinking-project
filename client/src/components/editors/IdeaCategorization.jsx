import React, { useState, useEffect } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X, GripVertical } from 'lucide-react';

// --- Sortable Item (Sticky Note) ---
function SortableItem({ id, content, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-yellow-200 dark:bg-yellow-900/40 p-3 mb-2 rounded shadow-sm text-sm border border-yellow-300 dark:border-yellow-700/50 text-yellow-900 dark:text-yellow-100 relative group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="pr-6 break-words whitespace-pre-wrap">{content}</div>
      <button
        onPointerDown={(e) => {
             // Prevent drag start when clicking delete
             e.stopPropagation();
        }}
        onClick={(e) => {
             e.stopPropagation(); 
             onDelete(id);
        }}
        className="absolute top-1 right-1 p-0.5 text-yellow-700 hover:text-red-600 hover:bg-yellow-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// --- Droppable Column (Category) ---
function DroppableColumn({ id, title, items, onDelete, isUncategorized }) {
  const { setNodeRef } = useSortable({ id: id, data: { type: 'container' } });

  return (
    <div ref={setNodeRef} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-w-[250px] w-full flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{title}</h3>
        {!isUncategorized && (
           <button onClick={() => onDelete(id)} className="text-gray-400 hover:text-red-500">
             <X className="w-4 h-4" />
           </button>
        )}
      </div>
      <div className="flex-1 min-h-[100px]">
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} content={item.content} onDelete={item.onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// --- Main Editor Component ---
export default function IdeaCategorization({ content, onUpdate }) {
  const [data, setData] = useState(() => {
    // Initialize standard structure if empty
    if (!content || !content.categories) {
       return {
         categories: [
           { id: 'uncategorized', title: 'Uncategorized Ideas', items: [] },
           { id: 'cat-1', title: 'Blue (Now)', items: [] },
           { id: 'cat-2', title: 'Yellow (How/Wow)', items: [] },
           { id: 'cat-3', title: 'Red (Ciao)', items: [] },
         ]
       };
    }
    return content;
  });

  // Sync back to parent whenever data changes
  useEffect(() => {
    onUpdate(data);
  }, [data]);

  const [activeId, setActiveId] = useState(null);
  const [newIdea, setNewIdea] = useState('' );
  const [newCategory, setNewCategory] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const uncat = newData.categories.find(c => c.id === 'uncategorized');
      if (uncat) {
        uncat.items.push({ id: `idea-${Date.now()}`, content: newIdea.trim() });
      }
      return newData;
    });
    setNewIdea('');
  };

  const handleDeleteIdea = (itemId) => {
      setData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));
          newData.categories.forEach(cat => {
              cat.items = cat.items.filter(i => i.id !== itemId);
          });
          return newData;
      });
  };

  const handleAddCategory = (e) => {
      e.preventDefault();
      if (!newCategory.trim()) return;
      
      setData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));
          newData.categories.push({ 
              id: `cat-${Date.now()}`, 
              title: newCategory.trim(), 
              items: [] 
          });
          return newData;
      });
      setNewCategory('');
  };

  const handleDeleteCategory = (catId) => {
      if (!window.confirm("Delete this category? Items inside will be lost.")) return;
      setData(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c.id !== catId)
      }));
  };

  // --- Drag Handlers ---
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find containers
    const findContainer = (id) => {
      if (data.categories.find(c => c.id === id)) return id;
      return data.categories.find(c => c.items.find(i => i.id === id))?.id;
    };

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Moving between containers
    setData((prev) => {
      const activeItems = prev.categories.find(c => c.id === activeContainer).items;
      const overItems = prev.categories.find(c => c.id === overContainer).items;
      
      const activeIndex = activeItems.findIndex(i => i.id === activeId);
      const overIndex = overItems.findIndex(i => i.id === overId);

      let newIndex;
      if (overIndex === -1) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem = over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const newData = JSON.parse(JSON.stringify(prev));
      const srcCat = newData.categories.find(c => c.id === activeContainer);
      const dstCat = newData.categories.find(c => c.id === overContainer);

      const [movedItem] = srcCat.items.splice(activeIndex, 1);
      dstCat.items.splice(newIndex, 0, movedItem);

      return newData;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId || activeId === overId) {
        setActiveId(null);
        return;
    }

    const findContainer = (id) => {
        if (data.categories.find(c => c.id === id)) return id;
        return data.categories.find(c => c.items.find(i => i.id === id))?.id;
    };

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
        const catIndex = data.categories.findIndex(c => c.id === activeContainer);
        const items = data.categories[catIndex].items;
        const oldIndex = items.findIndex(i => i.id === activeId);
        const newIndex = items.findIndex(i => i.id === overId);

        if (oldIndex !== newIndex) {
            setData((prev) => {
                const newData = JSON.parse(JSON.stringify(prev));
                newData.categories[catIndex].items = arrayMove(newData.categories[catIndex].items, oldIndex, newIndex);
                return newData;
            });
        }
    }

    setActiveId(null);
  };

  // Find active item content for overlay
  const activeItem = activeId ? data.categories.flatMap(c => c.items).find(i => i.id === activeId) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end sticky top-0 z-10">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Add New Idea</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIdea(e)}
              placeholder="Type an idea..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddIdea}
              disabled={!newIdea.trim()}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="w-[250px]">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Add Category</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
              placeholder="Category name..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 flex gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {data.categories.map((cat) => (
            <div key={cat.id} className="w-[280px] flex-shrink-0 flex flex-col">
                 <DroppableColumn 
                    id={cat.id} 
                    title={cat.title} 
                    items={cat.items.map(i => ({...i, onDelete: handleDeleteIdea}))} // Pass delete handler
                    onDelete={handleDeleteCategory}
                    isUncategorized={cat.id === 'uncategorized'}
                 />
            </div>
          ))}

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeItem ? (
                <div className="bg-yellow-200 dark:bg-yellow-900/40 p-3 rounded shadow-lg text-sm border border-yellow-300 dark:border-yellow-700/50 text-yellow-900 dark:text-yellow-100 transform rotate-2 cursor-grabbing w-[250px]">
                  {activeItem.content}
                </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
