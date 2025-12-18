import React from 'react';

// Helper for hex colors to avoid Tailwind's oklch which html2canvas 1.4.1 doesn't support
const colors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray800: '#1f2937',
  gray900: '#111827',
  blue50: '#eff6ff',
  blue500: '#3b82f6',
  blue800: '#1e40af',
  green50: '#f0fdf4',
  green500: '#22c55e',
  green800: '#166534',
  yellow50: '#fefce8',
  red50: '#fef2f2',
  red500: '#ef4444',
  red800: '#991b1b',
};

const VisualRenderer = ({ template, content, innerRef }) => {
  const data = content || {};

  // Common styles
  const baseStyle = { fontFamily: 'sans-serif', backgroundColor: colors.white, minWidth: '800px', boxSizing: 'border-box' };
  const h1Style = { fontSize: '36px', fontWeight: 'bold', color: colors.gray900, marginBottom: '8px', borderBottom: `2px solid ${colors.gray200}`, paddingBottom: '16px' };
  const h2Style = { fontSize: '30px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: colors.gray900 };
  const h3Style = { fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: colors.gray800 };
  const pStyle = { fontSize: '16px', color: colors.gray800, whiteSpace: 'pre-wrap' };
  const cardStyle = { padding: '24px', borderRadius: '8px', border: `1px solid ${colors.gray200}`, backgroundColor: colors.gray50, marginBottom: '24px' };
  
  // Note: Avoid 'shadow' classes from Tailwind as they use oklch in v4. Use manual box-shadow if needed.
  const shadowStyle = `0 4px 6px -1px ${colors.gray300}`;

  // --- Empathy Map Layout ---
  if (template.title === 'Empathy Map') {
    return (
      <div ref={innerRef} style={{ ...baseStyle, padding: '32px', minHeight: '600px' }}>
        <h2 style={h2Style}>{template.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '600px', border: `2px solid ${colors.gray800}`, position: 'relative' }}>
          
          
          {/* SAYS (Top Left) - NOW PARENT OF USER CIRCLE */}
          <div style={{ padding: '16px', backgroundColor: colors.yellow50, borderBottom: `2px solid ${colors.gray800}`, borderRight: `2px solid ${colors.gray800}`, position: 'relative' }}>
            <h3 style={{ ...h3Style, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Says</h3>
            <p style={pStyle}>{data.says || data.ays || ''}</p>
            
            {/* User Circle anchored to bottom-right of this cell (the intersection) */}
            <div style={{ 
              position: 'absolute', bottom: '-1px', right: '-1px', transform: 'translate(50%, 50%)', 
              zIndex: 10, width: '96px', height: '96px', borderRadius: '50%', 
              backgroundColor: colors.white, border: `2px solid ${colors.gray800}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: shadowStyle 
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: colors.gray900 }}>USER</span>
            </div>
          </div>

          {/* THINKS */}
          <div style={{ padding: '16px', backgroundColor: colors.blue50, borderBottom: `2px solid ${colors.gray800}` }}>
            <h3 style={{ ...h3Style, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Thinks</h3>
            <p style={pStyle}>{data.thinks || ''}</p>
          </div>

          {/* DOES */}
          <div style={{ padding: '16px', backgroundColor: colors.green50, borderRight: `2px solid ${colors.gray800}` }}>
            <h3 style={{ ...h3Style, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Does</h3>
            <p style={pStyle}>{data.does || ''}</p>
          </div>

          {/* FEELS */}
          <div style={{ padding: '16px', backgroundColor: colors.red50 }}>
            <h3 style={{ ...h3Style, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Feels</h3>
            <p style={pStyle}>{data.feels || ''}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- User Persona Layout ---
  if (template.title === 'User Persona') {
    return (
      <div ref={innerRef} style={{ ...baseStyle, padding: '32px' }}>
        <div style={{ padding: '24px', borderRadius: '8px', border: `4px solid ${colors.gray800}`, backgroundColor: colors.gray50 }}>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
            <div style={{ 
              width: '128px', height: '128px', borderRadius: '50%', flexShrink: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', fontWeight: 'bold', backgroundColor: colors.gray300, 
              color: colors.gray500, border: `2px solid ${colors.gray600}` 
            }}>
               {(data.name || 'User').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: colors.gray900 }}>{data.name || 'Persona Name'}</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', padding: '16px', borderRadius: '4px', backgroundColor: colors.white, border: `1px solid ${colors.gray200}` }}>
                 <div style={{ color: colors.gray800 }}><strong>Demographics:</strong> {data.demographics || 'N/A'}</div>
                 <div style={{ color: colors.gray800 }}><strong>Role:</strong> {data.role || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
             <div style={{ padding: '24px', borderRadius: '4px', backgroundColor: colors.white, borderLeft: `4px solid ${colors.blue500}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <h3 style={{ ...h3Style, color: colors.blue800 }}>Bio</h3>
                <p style={pStyle}>{data.bio || ''}</p>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ padding: '24px', borderRadius: '4px', backgroundColor: colors.white, borderLeft: `4px solid ${colors.green500}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                   <h3 style={{ ...h3Style, color: colors.green800 }}>Goals</h3>
                   <p style={pStyle}>{data.goals || ''}</p>
                </div>
                <div style={{ padding: '24px', borderRadius: '4px', backgroundColor: colors.white, borderLeft: `4px solid ${colors.red500}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                   <h3 style={{ ...h3Style, color: colors.red800 }}>Pain Points</h3>
                   <p style={pStyle}>{data.painPoints || ''}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Questionnaire Layout ---
  if (template.title === 'Questionnaire') {
    const questions = data.questions ? data.questions.split('\n').filter(q => q.trim() !== '') : [];
    
    return (
      <div ref={innerRef} style={{ ...baseStyle, padding: '48px' }}>
        <h1 style={h1Style}>{template.title}</h1>
        <p style={{ fontSize: '18px', marginBottom: '32px', color: colors.gray500 }}>{template.description}</p>
        
        <div style={{ padding: '32px', backgroundColor: colors.white, border: `1px solid ${colors.gray200}`, borderRadius: '8px', boxShadow: shadowStyle }}>
          <h3 style={{ ...h3Style, marginBottom: '24px', borderBottom: `1px solid ${colors.gray200}`, paddingBottom: '16px' }}>Research Questions</h3>
          {questions.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {questions.map((q, idx) => (
                <li key={idx} style={{ 
                  marginBottom: '16px', 
                  padding: '16px', 
                  backgroundColor: idx % 2 === 0 ? colors.gray50 : colors.white,
                  borderLeft: `4px solid ${colors.blue500}`,
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: colors.gray800
                }}>
                  {q}
                </li>
              ))}
            </ul>
          ) : (
             <p style={{ fontStyle: 'italic', color: colors.gray400 }}>No questions added yet.</p>
          )}
        </div>
      </div>
    );
  }

  // --- How Might We Questions Layout ---
  if (template.title === 'How Might We Questions') {
    const questions = data.questions ? data.questions.split('\n').filter(q => q.trim() !== '') : [];
    
    return (
      <div ref={innerRef} style={{ ...baseStyle, padding: '48px' }}>
        <h1 style={h1Style}>{template.title}</h1>
        <p style={{ fontSize: '18px', marginBottom: '32px', color: colors.gray500 }}>{template.description}</p>
        
        {/* Core Problem Section */}
        <div style={{ padding: '32px', backgroundColor: colors.white, border: `1px solid ${colors.gray200}`, borderRadius: '8px', marginBottom: '32px', boxShadow: shadowStyle }}>
           <h3 style={{ ...h3Style, marginBottom: '16px' }}>Core Problem</h3>
           <p style={{ ...pStyle, fontSize: '16px', lineHeight: '1.6' }}>{data.problem || <span style={{ fontStyle: 'italic', color: colors.gray400 }}>No problem defined.</span>}</p>
        </div>

        {/* Questions List */}
        <div style={{ padding: '32px', backgroundColor: colors.white, border: `1px solid ${colors.gray200}`, borderRadius: '8px', boxShadow: shadowStyle }}>
          <h3 style={{ ...h3Style, marginBottom: '24px', borderBottom: `1px solid ${colors.gray200}`, paddingBottom: '16px' }}>Questions</h3>
          {questions.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {questions.map((q, idx) => (
                <li key={idx} style={{ 
                  marginBottom: '16px', 
                  padding: '16px', 
                  backgroundColor: idx % 2 === 0 ? colors.gray50 : colors.white,
                  borderLeft: `4px solid ${colors.purple500}`,
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: colors.gray800
                }}>
                  {q}
                </li>
              ))}
            </ul>
          ) : (
             <p style={{ fontStyle: 'italic', color: colors.gray400 }}>No questions added yet.</p>
          )}
        </div>
      </div>
    );
  }

  // --- Idea Categorization (Board Layout) ---
  if (template.title === 'Idea Categorization') {
    const categories = data.categories || [];
    
    return (
      <div ref={innerRef} style={{ ...baseStyle, padding: '32px' }}>
        <h1 style={h1Style}>{template.title}</h1>
        <p style={{ fontSize: '18px', marginBottom: '32px', color: colors.gray500 }}>{template.description}</p>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {categories.filter(c => c.items.length > 0 || c.id !== 'uncategorized').map(cat => (
                <div key={cat.id} style={{ 
                    flex: '1', 
                    minWidth: '200px', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    backgroundColor: colors.gray100,
                    border: `1px solid ${colors.gray200}` 
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: colors.gray700 }}>{cat.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cat.items.map(item => (
                            <div key={item.id} style={{ 
                                padding: '12px', 
                                backgroundColor: '#fef3c7', // yellow-200
                                border: '1px solid #fde047', // yellow-300
                                borderRadius: '4px',
                                fontSize: '14px',
                                color: colors.gray900,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {item.content}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  // --- User Journey Map Table Layout ---
  if (template.title === 'User Journey Map') {
    const grid = data.grid || {};
    const STAGES = ['Awareness', 'Consideration', 'Decision', 'Service', 'Loyalty'];
    const ROWS = [
      'Customer Actions',
      'Touchpoints',
      'Customer Experience',
      'Pain Points',
      'KPIs',
      'Business Goals',
      'Team(s) Involved'
    ];
    
    // Light pastel colors for rows
    const ROW_COLORS = {
      'Customer Actions': '#fff7ed', // orange-50
      'Touchpoints': '#eff6ff', // blue-50
      'Customer Experience': '#f0fdf4', // green-50
      'Pain Points': '#fef2f2', // red-50
      'KPIs': '#faf5ff', // purple-50
      'Business Goals': '#ecfeff', // cyan-50
      'Team(s) Involved': '#fdf4ff' // fuchsia-50
    };

    return (
      <div ref={innerRef} style={{ ...baseStyle, padding: '32px' }}>
        <h1 style={h1Style}>{template.title}</h1>
        <p style={{ fontSize: '18px', marginBottom: '32px', color: colors.gray500 }}>{template.description}</p>
        
        <div style={{ width: '100%' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: `1px solid ${colors.gray300}`,
            fontSize: '14px'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  border: `1px solid ${colors.gray300}`, 
                  padding: '12px', 
                  backgroundColor: colors.gray100,
                  textAlign: 'left',
                  width: '200px',
                  fontWeight: 'bold',
                  color: colors.gray800
                }}>Stage</th>
                {STAGES.map(stage => (
                  <th key={stage} style={{ 
                    border: `1px solid ${colors.gray300}`, 
                    padding: '12px', 
                    backgroundColor: '#eff6ff', 
                    color: '#1e3a8a',
                    fontWeight: 'bold'
                  }}>
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row}>
                  <td style={{ 
                    border: `1px solid ${colors.gray300}`, 
                    padding: '12px', 
                    backgroundColor: colors.gray50,
                    fontWeight: '600',
                    color: colors.gray800
                  }}>
                    {row}
                  </td>
                  {STAGES.map(stage => (
                    <td key={stage} style={{ 
                      border: `1px solid ${colors.gray300}`, 
                      padding: '12px',
                      backgroundColor: ROW_COLORS[row] || '#ffffff',
                      color: colors.gray900,
                      verticalAlign: 'top',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {grid[row]?.[stage] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }


  // --- Paper Prototypes Layout ---
  if (template.title === 'Paper Prototypes') {
     // NOTE: For full fidelity export, we might want to capture the actual ReactFlow instance.
     // However, since VisualRenderer is used for the "Preview" pane *and* the hidden export container,
     // we can try to render the nodes visually here, or (simpler) just rely on the Editor's view for export 
     // if we change how export works. 
     // FOR NOW: We will replicate a simple visual representation of the nodes without React Flow interaction,
     // to ensure it renders in the export container.

      const nodes = data.nodes || [];
      const edges = data.edges || [];

      // 1. Calculate bounding box to normalize positions (prevent overlap with title)
      let minX = Infinity;
      let minY = Infinity;
      let maxBottom = 0;

      if (nodes.length > 0) {
        nodes.forEach(node => {
            if (node.position.x < minX) minX = node.position.x;
            if (node.position.y < minY) minY = node.position.y;
        });
      } else {
          minX = 0;
          minY = 0;
      }

      // Add a margin buffer (e.g., 20px) to the normalized positions
      const BUFFER = 20;

      // Helper: Get Normalized Position
      const getNormPos = (pos) => ({
          x: pos.x - minX + BUFFER,
          y: pos.y - minY + BUFFER
      });

      // Helper to get node center (using normalized positions)
      const getNodeCenter = (node) => {
          if (!node) return { x: 0, y: 0 };
          const pos = getNormPos(node.position);
          
          let w = 0;
          let h = 0;
          
          if (node.type === 'prototype') {
             w = 288;
             h = 400; // Estimate
          } else if (node.type === 'note') {
             // Robust width/height check
             // 1. Try style.width (string or number)
             // 2. Try node.measured?.width or node.width
             // 3. Fallback
             const checkWidth = node.style?.width ?? node.measured?.width ?? node.width;
             const checkHeight = node.style?.height ?? node.measured?.height ?? node.height;
             
             w = checkWidth ? parseInt(checkWidth) : 200;
             h = checkHeight ? parseInt(checkHeight) : 150;
          }

          return {
             x: pos.x + w / 2,
             y: pos.y + h / 2
          };
      };

      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      // Calculate container height
      nodes.forEach(node => {
          const pos = getNormPos(node.position);
          let h = 200;
          if (node.type === 'prototype') h = 500;
          else {
              const checkHeight = node.style?.height ?? node.measured?.height ?? node.height;
              h = checkHeight ? parseInt(checkHeight) : 150;
          }
          const bottom = pos.y + h;
          if (bottom > maxBottom) maxBottom = bottom;
      });

      // Ensure minHeight with generous bottom margin
      // Make sure the background covers the full computed height
      const containerHeight = Math.max(800, maxBottom + 200);

      const getArrowHead = (x1, y1, x2, y2) => {
          // Calculate angle
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = 10;
          
          // Points for a simple arrowhead triangle
          // Tip at x2, y2
          // Wings back by headLen
          
          // To rotate:
          // x' = x*cos - y*sin
          // y' = x*sin + y*cos
          
          // Back point on line:
          const bx = x2 - headLen * Math.cos(angle);
          const by = y2 - headLen * Math.sin(angle);
          
          // Perpendicular offset for width
          const width = 6;
          const px = width * Math.cos(angle + Math.PI/2);
          const py = width * Math.sin(angle + Math.PI/2);
          
          const p1x = bx + px;
          const p1y = by + py;
          
          const p2x = bx - px;
          const p2y = by - py;
          
          return `${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`;
      };

      return (
         <div ref={innerRef} style={{ 
             ...baseStyle, 
             padding: '32px', 
             height: `${containerHeight}px`, // Explicit height instead of minHeight to enforce background coverage
             position: 'relative', 
             backgroundColor: '#f8fafc' 
         }}>
            <h1 style={h1Style}>{template.title}</h1>
            <p style={{ fontSize: '18px', marginBottom: '32px', color: colors.gray500 }}>{template.description}</p>
            
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
               {/* Edges Layer (SVG) */}
               <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                  {edges.map(edge => {
                      const sourceNode = nodeMap.get(edge.source);
                      const targetNode = nodeMap.get(edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const start = getNodeCenter(sourceNode);
                      const end = getNodeCenter(targetNode);
                      
                      const midX = (start.x + end.x) / 2;
                      const midY = (start.y + end.y) / 2;
                      const label = edge.data?.label || '';
                      
                      // Calculate slight offset for arrowhead so it doesn't overlap exactly if we wanted, 
                      // but exact point is fine for now if z-index is right. 
                      // Since transparent nodes, might need to stop short. For now, Draw exactly to center.

                      return (
                          <g key={edge.id}>
                              {/* Edge Line */}
                              <line 
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke={colors.gray400}
                                strokeWidth="2"
                              />
                              
                              {/* Manual Arrowhead */}
                              <polygon 
                                points={getArrowHead(start.x, start.y, end.x, end.y)}
                                fill={colors.gray400}
                              />
                              
                              {/* Label (if exists) */}
                              {label && (
                                <g>
                                    <rect 
                                        x={midX - (label.length * 4)} 
                                        y={midY - 10} 
                                        width={label.length * 8} 
                                        height="20" 
                                        fill="white" 
                                        opacity="0.9"
                                        rx="4"
                                    />
                                    <text
                                        x={midX}
                                        y={midY}
                                        textAnchor="middle"
                                        alignmentBaseline="middle" 
                                        dominantBaseline="middle"
                                        fill={colors.gray800}
                                        fontSize="12"
                                        fontWeight="500"
                                    >
                                        {label}
                                    </text>
                                </g>
                              )}
                          </g>
                      );
                  })}
               </svg>

               {/* Nodes Layer */}
               {nodes.map(node => {
                   const pos = getNormPos(node.position);

                   if (node.type === 'prototype') {
                       return (
                           <div key={node.id} style={{
                               position: 'absolute',
                               left: pos.x,
                               top: pos.y,
                               width: '288px', // w-72
                               border: `2px solid ${colors.gray200}`,
                               borderRadius: '8px',
                               backgroundColor: colors.white,
                               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                               zIndex: 10
                           }}>
                               {/* Header */}
                               <div style={{ padding: '8px', borderBottom: `1px solid ${colors.gray200}`, backgroundColor: colors.gray50, display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.gray500, textTransform: 'uppercase' }}>{node.data.screenType || 'Screen'}</span>
                               </div>
                               {/* Image */}
                               <div style={{ height: '160px', backgroundColor: colors.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                   {node.data.image ? (
                                       <img src={node.data.image} alt="Prototype" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                   ) : (
                                       <span style={{ color: colors.gray400, fontSize: '12px' }}>No Image</span>
                                   )}
                               </div>
                               {/* Content */}
                               <div style={{ padding: '12px' }}>
                                   <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{node.data.title || 'Untitled'}</div>
                                   <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                                       <span style={{ padding: '2px 4px', border: `1px solid ${colors.gray200}`, borderRadius: '4px' }}>{node.data.status || 'Draft'}</span>
                                       {node.data.flowStep && <span style={{ padding: '2px 4px', border: `1px solid ${colors.gray200}`, borderRadius: '4px' }}>Step {node.data.flowStep}</span>}
                                   </div>
                                   <p style={{ fontSize: '12px', color: colors.gray600 }}>{node.data.description}</p>
                               </div>
                           </div>
                       );
                   }
                   if (node.type === 'note') {
                        // Respect Resizing with robust check
                        const checkWidth = node.style?.width ?? node.measured?.width ?? node.width;
                        const checkHeight = node.style?.height ?? node.measured?.height ?? node.height;
                        
                        const w = checkWidth ? parseInt(checkWidth) : 200;
                        const h = checkHeight ? parseInt(checkHeight) : 150;

                        return (
                           <div key={node.id} style={{
                               position: 'absolute',
                               left: pos.x,
                               top: pos.y,
                               width: `${w}px`, // Explicitly add px
                               height: `${h}px`,
                               minHeight: '100px',
                               padding: '16px',
                               borderRadius: '8px',
                               border: '1px solid #fef08a', // yellow-200
                               backgroundColor: '#fef9c3', // yellow-100
                               boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                               zIndex: 10,
                               boxSizing: 'border-box'
                           }}>
                               <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#ca8a04', marginBottom: '8px' }}>Note</div>
                               <p style={{ fontSize: '14px', color: '#1f2937', whiteSpace: 'pre-wrap' }}>{node.data.label}</p>
                           </div>
                        );
                   }
                   return null;
               })}
            </div>
         </div>
      );
  }

  // --- Default List Layout ---
  const sections = template.content && typeof template.content === 'string' 
    ? JSON.parse(template.content).sections 
    : (template.content?.sections || []);

  return (
    <div ref={innerRef} style={{ ...baseStyle, padding: '48px' }}>
      <h1 style={h1Style}>{template.title}</h1>
      <p style={{ fontSize: '18px', marginBottom: '32px', color: colors.gray500 }}>{template.description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {sections.map(section => (
          <div key={section.id} style={cardStyle}>
            <h3 style={h3Style}>{section.label}</h3>
            <div style={{ ...pStyle, lineHeight: '1.625' }}>
              {data[section.id] || <span style={{ fontStyle: 'italic', color: colors.gray400 }}>No content</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: `1px solid ${colors.gray200}`, textAlign: 'center', fontSize: '14px', color: colors.gray400 }}>
        Generated by Design Thinking Platform
      </div>
    </div>
  );
};

export default VisualRenderer;
