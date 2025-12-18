import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Plus, Image as ImageIcon, Upload } from 'lucide-react';

// --- Sortable Frame Component ---
function SortableFrame({ id, frame, onUpdate, onDelete, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(id, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm flex flex-col h-full group"
    >
        {/* Header with Drag Handle */}
        <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
            <div className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                <div {...attributes} {...listeners} className="cursor-move mr-2 hover:text-gray-700 dark:hover:text-gray-200">
                    <GripVertical size={18} />
                </div>
                <span>Frame {index + 1}</span>
            </div>
            <button 
                onClick={() => onDelete(id)} 
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete Frame"
            >
                <Trash2 size={16} />
            </button>
        </div>

        <div className="p-4 space-y-4 flex-1 flex flex-col">
            {/* Image Area */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center group/image">
                {frame.image ? (
                    <>
                        <img src={frame.image} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                            <Upload size={24} className="mb-2" />
                            <span className="text-xs">Change Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <ImageIcon size={32} className="mb-2" />
                        <span className="text-xs">Upload Sketch/Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                )}
            </div>
            
            {/* Text Inputs */}
            <div className="space-y-3 flex-1">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Context / Situation</label>
                    <textarea 
                        value={frame.context || ''}
                        onChange={(e) => onUpdate(id, { context: e.target.value })}
                        placeholder="What is happening?"
                        className="w-full text-sm p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 resize-none h-16"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Action</label>
                    <textarea 
                        value={frame.action || ''}
                        onChange={(e) => onUpdate(id, { action: e.target.value })}
                        placeholder="What does the user do?"
                        className="w-full text-sm p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 resize-none h-16"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Outcome</label>
                    <textarea 
                        value={frame.outcome || ''}
                        onChange={(e) => onUpdate(id, { outcome: e.target.value })}
                        placeholder="What is the result?"
                        className="w-full text-sm p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 resize-none h-16"
                    />
                 </div>
            </div>
        </div>
    </div>
  );
}

export default function StoryboardEditor({ content, onUpdate }) {
    const [frames, setFrames] = useState(content?.frames || []);
    const [activeId, setActiveId] = useState(null);
    const initialized = React.useRef(false);

    // Initialize default frames if empty on mount
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            if ((!content?.frames || content.frames.length === 0) && frames.length === 0) {
                 const inits = [createFrame(), createFrame(), createFrame()];
                 setFrames(inits);
                 // Immediate update to parent
                 onUpdate({ frames: inits });
            }
        }
    }, []);

    // Sync to parent whenever local frames change
    useEffect(() => {
        // Debounce or direct? Direct is fine as long as we don't listen to props loop.
        if (initialized.current) {
             onUpdate({ frames });
        }
    }, [frames]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function createFrame() {
        return {
            id: crypto.randomUUID(),
            image: null,
            context: '',
            action: '',
            outcome: ''
        };
    }

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setFrames((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const updateFrame = (id, newData) => {
        setFrames(frames.map(f => f.id === id ? { ...f, ...newData } : f));
    };

    const deleteFrame = (id) => {
        if (confirm('Delete this frame?')) {
            setFrames(frames.filter(f => f.id !== id));
        }
    };

    const addFrame = () => {
        setFrames([...frames, createFrame()]);
    };

    const resetTemplate = (count) => {
        if (confirm('This will replace current frames. Continue?')) {
            setFrames(Array(count).fill(null).map(() => createFrame()));
        }
    };

    return (
        <div className="p-4">
             {/* Toolbar */}
             <div className="mb-6 flex flex-wrap gap-3 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Templates:</span>
                <button 
                  onClick={() => resetTemplate(3)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                    3-Frame Story
                </button>
                <button 
                  onClick={() => resetTemplate(5)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                    5-Frame Journey
                </button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                <button 
                  onClick={addFrame}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors ml-auto"
                >
                    <Plus size={16} /> Add Frame
                </button>
             </div>

             <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
             >
                <SortableContext 
                    items={frames.map(f => f.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {frames.map((frame, index) => (
                            <SortableFrame 
                                key={frame.id} 
                                id={frame.id}
                                frame={frame} 
                                index={index}
                                onUpdate={updateFrame}
                                onDelete={deleteFrame}
                            />
                        ))}
                    </div>
                </SortableContext>
                 <DragOverlay>
                    {activeId ? (
                         <div className="opacity-80">
                            <SortableFrame 
                                id={activeId} 
                                frame={frames.find(f => f.id === activeId)} 
                                index={frames.findIndex(f => f.id === activeId)}
                                onUpdate={() => {}} 
                                onDelete={() => {}} 
                            />
                         </div>
                    ) : null}
                </DragOverlay>
             </DndContext>

             {frames.length === 0 && (
                 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed dark:border-gray-700 mt-4">
                     <p className="text-gray-500 dark:text-gray-400">No frames yet. Add one or select a template to start.</p>
                     <button onClick={addFrame} className="mt-4 text-blue-600 hover:underline">Add First Frame</button>
                 </div>
             )}
        </div>
    );
}
