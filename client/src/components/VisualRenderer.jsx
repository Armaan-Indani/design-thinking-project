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
