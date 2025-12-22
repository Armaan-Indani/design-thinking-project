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
import { Plus, Image as ImageIcon, Type, Trash2, Bold, Type as TypeIcon } from 'lucide-react';

// --- Custom Hooks ---
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

// --- Custom Components ---

// 1. Text Node (Mind Map Topic)
const TextNode = ({ data, selected }) => {
  const inputRef = useRef(null);
  
  // Focus editing on key press
  useEffect(() => {
    if (!selected) return;
    
    const handleKeyDown = (e) => {
        // If already editing, allow standard behavior (e.g. arrows, backspace inside text)
        if (document.activeElement === inputRef.current) {
            // Optional: Enter completely finishes editing
            if (e.key === 'Enter') {
                e.preventDefault();
                inputRef.current.blur();
            }
            return;
        }

        // If NOT editing, check for printable characters to start editing
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
             e.preventDefault();
             // Start editing
             inputRef.current.focus();
             inputRef.current.innerText = e.key;
             
             // Sync immediate change so we don't lose the first char if a render happens
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
          // Select all text
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
      }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400" />
      <div 
         ref={inputRef}
         className="outline-none" 
         contentEditable 
         suppressContentEditableWarning 
         onBlur={(e) => data.onChangeLabel && data.onChangeLabel(e.target.innerText)}
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
      <Handle type="target" position={Position.Left} style={{opacity: 0}} />
      <Handle type="source" position={Position.Right} style={{opacity: 0}} />
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

// --- Main Editor ---

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

  // Handlers
  const onConnect = useCallback((params) => {
      // Default new edge style
      const newEdge = { 
          ...params, 
          type: 'default', 
          animated: false,
          style: { stroke: isDark ? '#94a3b8' : '#cbd5e1', strokeWidth: 2 },
          label: ''
      };
      setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges, isDark]);

  // Manage Selection to show contextual toolbar
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelection({ nodes, edges });
  }, []);

  // Update Node Data Helper
  const updateNodeData = (id, newData) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    }));
  };
  
  // Update Edge Data Helper
  const updateEdge = (id, updates) => {
      setEdges((eds) => eds.map((e) => {
          if (e.id === id) return { ...e, ...updates };
          return e;
      }));
  };

  const addNode = (type) => {
    const id = `node-${Date.now()}`;
    let position = { x: 0, y: 0 };
    
    // Calculate center of view if wrapper exists
    if (reactFlowWrapper.current) {
        const { top, left, width, height } = reactFlowWrapper.current.getBoundingClientRect();
        position = screenToFlowPosition({
            x: left + width / 2,
            y: top + height / 2,
        });
        
        // Add slight random offset to prevent perfect stacking if multiple added quickly
        position.x += (Math.random() - 0.5) * 20;
        position.y += (Math.random() - 0.5) * 20;
    } else {
         position = {
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
         };
    }

    if (type === 'text') {
      const newNode = {
        id,
        type: 'textNode',
        position,
        data: { 
           label: 'New Topic', 
           color: COLORS[Math.floor(Math.random() * COLORS.length)],
           fontSize: '14px',
           isBold: false,
           // We assign a default border color if none selected, but data.color is set above
           onChangeLabel: (txt) => updateNodeData(id, { label: txt })
        },
      };
      setNodes((nds) => nds.concat(newNode));
    }
  };

  // Re-attach handlers on init/load because JSON.stringify strips functions
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
         style: { width: 200, height: 150 } // Initial size
       };
       setNodes((nds) => nds.concat(newNode));
    };
    reader.readAsDataURL(file);
  };
  
  const onDeleteKey = useCallback(() => {
       const selectedNodeIds = selection.nodes.map(n => n.id);
       const selectedEdgeIds = selection.edges.map(e => e.id);
       setNodes(nds => nds.filter(n => !selectedNodeIds.includes(n.id)));
       setEdges(eds => eds.filter(e => !selectedEdgeIds.includes(e.id)));
       setSelection({ nodes: [], edges: [] }); 
  }, [selection, setNodes, setEdges]);
  
  // Drag and Drop
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
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
    [screenToFlowPosition, setNodes],
  );

  // --- Context Toolbar Actions ---
  // Fix: selection.nodes contains stale copies. Find the real node in state.
  const selectedNodeId = selection.nodes[0]?.id;
  const activeNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  
  const selectedEdgeId = selection.edges[0]?.id;
  const activeEdge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors" ref={reactFlowWrapper}>
      {/* Top Toolbar */}
      <div className="p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex gap-4 items-center z-10 flex-wrap h-14 transition-colors">
        <button onClick={() => addNode('text')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
          <Type size={16} /> 
          Topic
        </button>
        <div className="relative overflow-hidden">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium">
                <ImageIcon size={16} />
                Image
            </button>
            <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageUpload}
            />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Selected Node Options */}
        {activeNode && activeNode.type === 'textNode' && (
           <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
               <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Node:</span>
               {/* Color Picker */}
               <div className="flex gap-1">
                   {COLORS.map(c => (
                       <button 
                         key={c}
                         onClick={() => updateNodeData(activeNode.id, { color: c })}
                         className={`w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 ${activeNode.data.color === c ? 'ring-2 ring-offset-1 ring-black dark:ring-white' : ''}`}
                         style={{ backgroundColor: c }}
                       />
                   ))}
               </div>
               {/* Font Size */}
               <select 
                  className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-1"
                  value={activeNode.data.fontSize || '14px'}
                  onChange={(e) => updateNodeData(activeNode.id, { fontSize: e.target.value })}
                >
                   <option value="12px">Small</option>
                   <option value="14px">Normal</option>
                   <option value="18px">Large</option>
                   <option value="24px">X-Large</option>
               </select>
               {/* Bold */}
               <button 
                  onClick={() => updateNodeData(activeNode.id, { isBold: !activeNode.data.isBold })}
                  className={`p-1 rounded ${activeNode.data.isBold ? 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
               >
                   <Bold size={16} />
               </button>
           </div>
        )}

        {/* Selected Edge Options */}
        {activeEdge && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Edge:</span>
                {/* Edge Label */}
                <input 
                  type="text" 
                  placeholder="Label..." 
                  className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-1 w-24"
                  value={activeEdge.label || ''}
                  onChange={(e) => updateEdge(activeEdge.id, { label: e.target.value })}
                />
                {/* Edge Color */}
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
        {(activeNode || activeEdge) && (
             <button 
               onClick={onDeleteKey}
               className="ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded"
               title="Delete Selected"
             >
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
          fitView
          attributionPosition="bottom-right"
          className="bg-gray-50 dark:bg-gray-900 transition-colors"
        >
          <Background color={isDark ? '#475569' : '#ccc'} gap={20} />
          <Controls className="dark:bg-gray-800 dark:border-gray-700" />
          <MiniMap className="dark:bg-gray-800 dark:border-gray-700" nodeColor={isDark ? '#cbd5e1' : '#e2e8f0'} />
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
