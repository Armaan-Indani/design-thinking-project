import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Panel,
  NodeResizer,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Trash2, Upload, GripVertical, X } from 'lucide-react';

const flowKey = 'paper-prototype-flow';

// --- Custom Edge ---
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const onEdgeClick = (evt, id) => {
    evt.stopPropagation();
  };
  
  const updateLabel = (evt) => {
      const newLabel = evt.target.value;
      setEdges((edges) => edges.map((e) => {
          if (e.id === id) {
              return { ...e, data: { ...e.data, label: newLabel } };
          }
          return e;
      }));
  };

  const deleteEdge = () => {
      setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#64748b' }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="flex flex-col items-center gap-1 group">
             {/* Delete Button (visible on hover or always) */}
             <button 
                className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                onClick={deleteEdge}
                title="Delete Connection"
             >
                <X size={10} />
             </button>
             
             {/* Label Input */}
             <input 
                value={data?.label || ''}
                onChange={updateLabel}
                placeholder="Label..."
                className="bg-white border rounded px-2 py-0.5 text-xs shadow-sm focus:ring-1 focus:ring-blue-500 outline-none w-24 text-center opacity-80 hover:opacity-100 focus:opacity-100 transition-opacity"
             />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// --- Custom Nodes ---

// 1. Prototype Card Node (Image + Metadata)
const PrototypeNode = ({ data, id, selected }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        data.onUpdate(id, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`shadow-lg rounded-lg bg-white border-2 w-72 transition-all ${selected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'}`}>
      {/* Handles for all sides to enable flexible connections */}
      <Handle type="target" position={Position.Top} id="t" className="w-3 h-3 bg-blue-500" />
      <Handle type="target" position={Position.Left} id="l" className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Right} id="r" className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} id="b" className="w-3 h-3 bg-blue-500" />
      
      {/* Header / grip */}
      <div className="bg-gray-50 border-b p-2 rounded-t-lg flex items-center justify-between cursor-move drag-handle">
         <div className="flex items-center text-gray-400">
            <GripVertical size={16} />
            <span className="text-xs font-semibold ml-1 uppercase tracking-wider text-gray-500">{data.screenType || 'Screen'}</span>
         </div>
         <button onClick={() => data.onDelete(id)} className="text-gray-400 hover:text-red-500">
           <Trash2 size={16} />
         </button>
      </div>

      {/* Image Area */}
      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
        {data.image ? (
          <img src={data.image} alt="Prototype" className="w-full h-full object-contain" />
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-blue-500">
            <Upload size={24} />
            <span className="text-xs mt-2">Upload Image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
        {/* Re-upload overlay */}
        {data.image && (
             <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white transition-opacity">
                 <span className="text-sm">Change Image</span>
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
             </label>
        )}
      </div>

      {/* Metadata Form */}
      <div className="p-3 space-y-3">
        <input 
          type="text" 
          value={data.title} 
          onChange={(e) => data.onUpdate(id, { title: e.target.value })}
          placeholder="Screen Title"
          className="w-full text-sm font-bold border-none p-0 focus:ring-0 placeholder-gray-400"
        />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
           <input 
             type="text"
             value={data.screenType}
             onChange={(e) => data.onUpdate(id, { screenType: e.target.value })}
             placeholder="Type (e.g. Login)"
             className="border rounded px-2 py-1"
           />
           <input 
             type="text"
             value={data.flowStep}
             onChange={(e) => data.onUpdate(id, { flowStep: e.target.value })}
             placeholder="Step (e.g. 1)"
             className="border rounded px-2 py-1"
           />
        </div>

        <select 
            value={data.status} 
            onChange={(e) => data.onUpdate(id, { status: e.target.value })}
            className={`w-full text-xs rounded border px-2 py-1 font-medium ${
                data.status === 'Tested' ? 'bg-green-100 text-green-800 border-green-200' :
                data.status === 'Iterated' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                'bg-gray-100 text-gray-600 border-gray-200'
            }`}
        >
            <option value="Draft">Draft</option>
            <option value="Tested">Tested</option>
            <option value="Iterated">Iterated</option>
        </select>
        
        <textarea 
          value={data.description}
          onChange={(e) => data.onUpdate(id, { description: e.target.value })}
          placeholder="Description..."
          className="w-full text-xs border rounded p-2 resize-none h-16"
        />
      </div>
    </div>
  );
};

// 2. Note Node (Resizable Text)
const NoteNode = ({ data, id, selected }) => {
    return (
        <div className={`h-full w-full p-4 rounded-lg bg-yellow-100 border shadow-sm flex flex-col ${selected ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-yellow-200'}`}>
             <NodeResizer 
                isVisible={selected} 
                minWidth={100} 
                minHeight={100} 
                lineClassName="border-yellow-400" 
                handleClassName="h-3 w-3 bg-yellow-500 border border-white rounded"
             />
             
             {/* Handles */}
             <Handle type="target" position={Position.Top} id="t" className="w-2 h-2 !bg-yellow-500 !opacity-50" />
             <Handle type="target" position={Position.Left} id="l" className="w-2 h-2 !bg-yellow-500 !opacity-50" />
             <Handle type="source" position={Position.Right} id="r" className="w-2 h-2 !bg-yellow-500 !opacity-50" />
             <Handle type="source" position={Position.Bottom} id="b" className="w-2 h-2 !bg-yellow-500 !opacity-50" />

             <div className="flex justify-between items-start mb-2">
                 <span className="text-[10px] uppercase font-bold text-yellow-600">Note</span>
                 <button onClick={() => data.onDelete(id)} className="text-yellow-600 hover:text-red-500">
                    <Trash2 size={14} />
                 </button>
             </div>
             <textarea 
                value={data.label}
                onChange={(e) => data.onUpdate(id, { label: e.target.value })}
                className="w-full flex-grow bg-transparent border-none resize-none text-sm text-gray-800 p-0 focus:ring-0"
                placeholder="Add annotation..."
             />
        </div>
    );
};

const nodeTypes = {
  prototype: PrototypeNode,
  note: NoteNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function PaperPrototypeCanvas({ content, onUpdate }) {
  // Initial State from content or default
  const [nodes, setNodes, onNodesChange] = useNodesState(content?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(content?.edges || []);
  
  // Instance & Container
  const [rfInstance, setRfInstance] = useState(null);
  const containerRef = React.useRef(null);

  // Sync to parent on change
  useEffect(() => {
    onUpdate({ nodes, edges });
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
        ...params, 
        type: 'custom',
        animated: false, // User requested SOLID arrows, so animated=false usually implies solid or we control style.
        style: { stroke: '#64748b', strokeWidth: 2 },
        data: { label: '' }
    }, eds)),
    [setEdges],
  );

  const updateNodeData = (id, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  const deleteNode = (id) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
  };
  
  // Helper to get center position
  const getCenterPos = () => {
      if (!rfInstance || !containerRef.current) {
          return { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 };
      }
      const { x, y, zoom } = rfInstance.getViewport();
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      
      return {
          x: (-x + width / 2) / zoom - 100, // Center minus half node width (approx)
          y: (-y + height / 2) / zoom - 75
      };
  };

  const addPrototypeCard = () => {
    const id = `card-${Date.now()}`;
    const pos = getCenterPos();
    const newNode = {
      id,
      type: 'prototype',
      position: pos,
      data: { 
          title: `Screen ${nodes.length + 1}`, 
          screenType: '', 
          flowStep: '', 
          status: 'Draft', 
          description: '',
          image: null,
          onUpdate: updateNodeData,
          onDelete: deleteNode
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addNote = () => {
    const id = `note-${Date.now()}`;
    const pos = getCenterPos();
    const newNode = {
        id,
        type: 'note',
        position: pos,
        style: { width: 200, height: 150 },
        data: { 
            label: '',
            onUpdate: updateNodeData,
            onDelete: deleteNode
         },
      };
      setNodes((nds) => nds.concat(newNode));
  };

  // Re-hydrate functions (like onUpdate/onDelete) which aren't serializable
  useEffect(() => {
      setNodes((nds) => nds.map(n => ({
          ...n,
          data: {
              ...n.data,
              onUpdate: updateNodeData,
              onDelete: deleteNode
          }
      })));
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '800px', backgroundColor: '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} color="#e2e8f0" />
        
        <Panel position="top-right" className="bg-white p-2 rounded shadow-md border flex gap-2">
            <button onClick={addPrototypeCard} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                <Upload size={16} /> Add Screen
            </button>
            <button onClick={addNote} className="flex items-center gap-2 px-3 py-2 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 text-sm font-medium">
                + Note
            </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
