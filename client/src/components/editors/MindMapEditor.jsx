import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  NodeResizer
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Image as ImageIcon, Type, Trash2, Bold, Italic, Undo, Redo } from 'lucide-react';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

// 1. Text Node (Mind Map Topic)
const TextNode = ({ data, selected }) => {
  const inputRef = useRef(null);
  
  // Focus editing on key press
  useEffect(() => {
    if (!selected) return;
    
    const handleKeyDown = (e) => {
        if (document.activeElement === inputRef.current) {
            // Stop propagation so backspace doesn't delete node
            e.stopPropagation(); 
            return;
        }

        // Check for printable characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
             e.preventDefault();
             inputRef.current.focus();
             inputRef.current.innerText = e.key;
             if (data.onChangeLabel) data.onChangeLabel(e.key);
             
             // Move cursor to end
             const range = document.createRange();
             const sel = window.getSelection();
             range.selectNodeContents(inputRef.current);
             range.collapse(false);
             sel.removeAllRanges();
             sel.addRange(range);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, data]);

  const handleDoubleClick = () => {
      if (inputRef.current) {
          inputRef.current.focus();
          const range = document.createRange();
          range.selectNodeContents(inputRef.current);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`px-4 py-2 rounded-full border-2 shadow-sm min-w-[100px] text-center transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
      style={{
        borderColor: data.color || 'var(--node-border, #e5e7eb)',
        backgroundColor: data.bgColor,
        fontSize: data.fontSize || '14px',
        fontWeight: data.isBold ? 'bold' : 'normal',
        fontStyle: data.isItalic ? 'italic' : 'normal',
      }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400" />
      <div 
         ref={inputRef}
         className="outline-none whitespace-pre-wrap break-words max-w-[400px]" 
         contentEditable 
         suppressContentEditableWarning 
         onBlur={(e) => data.onChangeLabel && data.onChangeLabel(e.target.innerText)}
         onKeyDown={(e) => e.stopPropagation()} // Prevent React Flow shortcuts while typing
      >
         {data.label}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-400" />
    </div>
  );
};

// 2. Image Node
const ImageNode = ({ data, selected, id }) => {
  return (
    <div className={`relative group h-full w-full ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <NodeResizer 
        minWidth={100} 
        minHeight={100} 
        isVisible={selected} 
        color="#3b82f6"
        handleStyle={{ width: 8, height: 8 }}
      />
      <div className="overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full h-full">
         <img src={data.src} alt="Mind Map Asset" className="w-full h-full object-cover block pointer-events-none" />
      </div>
      {/* Handles visible for linking */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-500 border-2 border-white dark:border-gray-900" style={{ left: -15 }} />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-500 border-2 border-white dark:border-gray-900" style={{ right: -15 }} />
    </div>
  );
};

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode
};

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
  '#000000', // Black
];

const MindMapEditorInner = ({ content, onUpdate }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(content?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(content?.edges || []);
  const [selection, setSelection] = useState({ nodes: [], edges: [] });
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const isDark = useDarkMode();
  
  // Sync back to parent
  useEffect(() => {
    onUpdate({ nodes, edges });
  }, [nodes, edges]);

  // --- Undo/Redo History ---
  const historyRef = useRef({ past: [], future: [] });
  
  const takeSnapshot = useCallback(() => {
      historyRef.current.past.push({ nodes: [...nodes], edges: [...edges] });
      historyRef.current.future = []; // Clear future on new action
      if (historyRef.current.past.length > 50) historyRef.current.past.shift();
  }, [nodes, edges]);

  const undo = useCallback(() => {
      if (historyRef.current.past.length === 0) return;
      const current = { nodes: [...nodes], edges: [...edges] };
      historyRef.current.future.push(current);
      const previous = historyRef.current.past.pop();
      setNodes(previous.nodes);
      setEdges(previous.edges);
  }, [nodes, edges, setNodes, setEdges]);
  
  const redo = useCallback(() => {
      if (historyRef.current.future.length === 0) return;
      const current = { nodes: [...nodes], edges: [...edges] };
      historyRef.current.past.push(current);
      const next = historyRef.current.future.pop();
      setNodes(next.nodes);
      setEdges(next.edges);
  }, [nodes, edges, setNodes, setEdges]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
      const handleKeyDown = (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
              e.preventDefault();
              undo();
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
              e.preventDefault();
              redo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // --- Handlers ---
  const onConnect = useCallback((params) => {
      takeSnapshot(); 
      const newEdge = { 
          ...params, 
          type: 'default', 
          animated: false,
          style: { stroke: isDark ? '#94a3b8' : '#cbd5e1', strokeWidth: 2 },
          label: ''
      };
      setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges, isDark, takeSnapshot]);

  // Manage Selection
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelection({ nodes, edges });
  }, []);

  // Update Node Data Helper (Single)
  const updateNodeData = (id, newData) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    }));
  };
  
  // Batch Update Helper
  const batchUpdateNodeData = (key, value) => {
      takeSnapshot();
      const idsToUpdate = selection.nodes.length > 0 ? selection.nodes.map(n => n.id) : [];
      if (idsToUpdate.length === 0) return;

      setNodes((nds) => nds.map((node) => {
          if (idsToUpdate.includes(node.id)) {
              return { ...node, data: { ...node.data, [key]: value } };
          }
          return node;
      }));
  };
  
  const updateEdge = (id, updates) => {
      setEdges((eds) => eds.map((e) => {
          if (e.id === id) return { ...e, ...updates };
          return e;
      }));
  };

  const addNode = (type) => {
    takeSnapshot();
    const id = `node-${Date.now()}`;
    let position = { x: 0, y: 0 };
    
    // Calculate center...
    if (reactFlowWrapper.current) {
        const { top, left, width, height } = reactFlowWrapper.current.getBoundingClientRect();
        position = screenToFlowPosition({
            x: left + width / 2,
            y: top + height / 2,
        });
        position.x += (Math.random() - 0.5) * 20;
        position.y += (Math.random() - 0.5) * 20;
    } else {
         position = { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 };
    }

    if (type === 'text') {
      const newNode = {
        id,
        type: 'textNode',
        position,
        data: { 
           label: 'New Topic', 
           color: '#000000', 
           fontSize: '14px',
           isBold: false,
           isItalic: false, // Default
           onChangeLabel: (txt) => {
               updateNodeData(id, { label: txt })
           }
        },
      };
      setNodes((nds) => nds.concat(newNode));
    }
  };

  // Re-attach handlers on init
  useEffect(() => {
      setNodes((nds) => nds.map(n => {
          if (n.type === 'textNode') {
              return {
                  ...n,
                  data: {
                      ...n.data,
                      onChangeLabel: (txt) => updateNodeData(n.id, { label: txt })
                  }
              };
          }
          return n;
      }));
  }, []);

  const handleImageUpload = (event) => {
    takeSnapshot();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
       const id = `img-${Date.now()}`;
       const newNode = {
         id,
         type: 'imageNode',
         position: { x: 100, y: 100 },
         data: { src: e.target.result },
         style: { width: 200, height: 150 }
       };
       setNodes((nds) => nds.concat(newNode));
    };
    reader.readAsDataURL(file);
  };
  
  const onDeleteKey = useCallback(() => {
       takeSnapshot();
       const selectedNodeIds = selection.nodes.map(n => n.id);
       const selectedEdgeIds = selection.edges.map(e => e.id);
       setNodes(nds => nds.filter(n => !selectedNodeIds.includes(n.id)));
       setEdges(eds => eds.filter(e => !selectedEdgeIds.includes(e.id)));
       setSelection({ nodes: [], edges: [] }); 
  }, [selection, setNodes, setEdges, takeSnapshot]);
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          takeSnapshot();
          const file = event.dataTransfer.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newNode = {
                id: `img-${Date.now()}`,
                type: 'imageNode',
                position,
                data: { src: e.target.result },
                style: { width: 200, height: 150 }
            };
            setNodes((nds) => nds.concat(newNode));
          };
          reader.readAsDataURL(file);
      }
    },
    [screenToFlowPosition, setNodes, takeSnapshot],
  );

  const onNodeDragStart = useCallback(() => {
      takeSnapshot();
  }, [takeSnapshot]);

  // --- Context Toolbar Actions ---
  const selectedNodeId = selection.nodes[0]?.id;
  const activeNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const isMultipleNodes = selection.nodes.length > 1;
  const selectedEdgeId = selection.edges[0]?.id;
  const activeEdge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null;
  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors" ref={reactFlowWrapper}>
      {/* Top Toolbar */}
      <div className="p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex gap-4 items-center z-10 flex-wrap h-14 transition-colors">
        
        {/* Undo/Redo */}
        <div className="flex gap-1 mr-2">
            <button onClick={undo} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Undo (Ctrl+Z)">
                <Undo size={18} />
            </button>
            <button onClick={redo} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Redo (Ctrl+Y)">
                <Redo size={18} />
            </button>
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <button onClick={() => addNode('text')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
          <Type size={16} /> 
          Topic
        </button>
        <div className="relative overflow-hidden">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium">
                <ImageIcon size={16} />
                Image
            </button>
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Selected Node Options */}
        {(activeNode || isMultipleNodes) && (
           <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
               <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                   {isMultipleNodes ? 'Multi:' : 'Node:'}
               </span>
               <div className="flex gap-1">
                   {COLORS.map(c => (
                       <button 
                         key={c}
                         onClick={() => batchUpdateNodeData('color', c)}
                         className={`w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 ${!isMultipleNodes && activeNode?.data.color === c ? 'ring-2 ring-offset-1 ring-black dark:ring-white' : ''}`}
                         style={{ backgroundColor: c }}
                       />
                   ))}
               </div>
               <select 
                  className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-1"
                  value={(!isMultipleNodes && activeNode?.data.fontSize) || '14px'}
                  onChange={(e) => batchUpdateNodeData('fontSize', e.target.value)}
                >
                   <option value="12px">Small</option>
                   <option value="14px">Normal</option>
                   <option value="18px">Large</option>
                   <option value="24px">X-Large</option>
               </select>
               <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                   <button 
                      onClick={() => batchUpdateNodeData('isBold', !activeNode?.data.isBold)}
                      className={`p-1 rounded ${!isMultipleNodes && activeNode?.data.isBold ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                      title="Bold"
                   >
                       <Bold size={16} />
                   </button>
                   <button 
                      onClick={() => batchUpdateNodeData('isItalic', !activeNode?.data.isItalic)}
                      className={`p-1 rounded ${!isMultipleNodes && activeNode?.data.isItalic ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                      title="Italic"
                   >
                       <Italic size={16} />
                   </button>
               </div>
           </div>
        )}

        {/* Selected Edge Options */}
        {activeEdge && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Edge:</span>
                <input 
                  type="text" 
                  placeholder="Label..." 
                  className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-1 w-24"
                  value={activeEdge.label || ''}
                  onChange={(e) => updateEdge(activeEdge.id, { label: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()} // FIX: Stop propagation so backspace doesn't delete edge
                />
                 <div className="flex gap-1">
                   {['#cbd5e1', '#ef4444', '#3b82f6', '#22c55e', '#000000', '#ffffff'].map(c => (
                       <button 
                         key={c}
                         onClick={() => updateEdge(activeEdge.id, { style: { ...activeEdge.style, stroke: c } })}
                         className={`w-4 h-4 rounded-full border border-gray-200 ${activeEdge.style?.stroke === c ? 'ring-2 ring-offset-1 ring-black dark:ring-white' : ''}`}
                         style={{ backgroundColor: c }}
                       />
                   ))}
               </div>
            </div>
        )}

        {/* Delete Button */}
        {(activeNode || activeEdge || isMultipleNodes) && (
             <button onClick={onDeleteKey} className="ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded" title="Delete Selected">
                <Trash2 size={16} />
             </button>
        )}

      </div>

      {/* Canvas */}
      <div className="flex-grow h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStart={onNodeDragStart}
          fitView
          attributionPosition="bottom-right"
          className="bg-gray-50 dark:bg-gray-900 transition-colors"
          panOnDrag={[1, 2]} 
          selectionOnDrag={true} 
        >
          <Background color={isDark ? '#475569' : '#ccc'} gap={20} />
          <Controls className="dark:bg-gray-800 dark:border-gray-700" />
          <MiniMap className="dark:bg-gray-800 dark:border-gray-700" nodeColor={isDark ? '#cbd5e1' : '#e2e8f0'} />
          
          <div className="absolute top-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 pointer-events-none select-none">
             <div className="font-bold mb-1 border-b border-gray-200 dark:border-gray-600 pb-1">Controls</div>
             <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                 <span>Left Drag:</span> <span>Select Nodes</span>
                 <span>Right/Mid Drag:</span> <span>Pan Canvas</span>
                 <span>Scroll:</span> <span>Zoom</span>
                 <span>Double Click:</span> <span>Edit Text</span>
             </div>
          </div>
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrap with provider
export default function MindMapEditor(props) {
    return (
        <ReactFlowProvider>
            <MindMapEditorInner {...props} />
        </ReactFlowProvider>
    );
}
