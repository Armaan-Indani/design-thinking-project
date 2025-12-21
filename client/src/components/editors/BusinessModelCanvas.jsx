import React from 'react';

// Common input styles
const textAreaStyle = "w-full flex-grow px-3 py-2 bg-transparent border-none resize-none focus:ring-0 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 font-sans h-full outline-none z-10 relative";
const labelStyle = "block text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-1 z-10 relative px-3 pt-3";
const containerStyle = "flex flex-col h-full border-gray-300 dark:border-gray-600 p-0 bg-white dark:bg-gray-800 relative group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[160px] custom-scrollbar"; // Removed p-3, added p-0 and custom-scrollbar class
const subSectionStyle = "mt-auto border-t border-dashed border-gray-300 dark:border-gray-600 z-10 relative"; // Changed positioning logic

// Custom Scrollbar CSS
const ScrollbarStyles = () => (
    <style>{`
        .custom-scrollbar textarea::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar textarea::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar textarea::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
        }
        .custom-scrollbar textarea::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.8);
        }
        .custom-scrollbar textarea {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
    `}</style>
);

// Render a canvas cell (Defined outside to prevent re-creation on render)
const Cell = ({ title, field, placeholder, subTitle, subField, subPlaceholder, className = "", content, onUpdate, watermark }) => {
    const updateField = (f, val) => {
        onUpdate({
            ...content,
            [f]: val
        });
    };

    return (
        <div className={`${containerStyle} ${className}`}>
             {watermark && (
                <div className="absolute inset-0 flex items-end justify-end p-4 pointer-events-none select-none overflow-hidden pb-1 pr-2">
                    <span className="text-6xl font-bold text-gray-200 dark:text-gray-700">{watermark}</span>
                </div>
            )}
            <div className="flex-grow flex flex-col min-h-0 z-10">
                <label className={labelStyle}>{title}</label>
                <textarea
                    value={content?.[field] || ''}
                    onChange={(e) => updateField(field, e.target.value)}
                    placeholder={placeholder}
                    className={textAreaStyle}
                />
            </div>
            {subTitle && (
                <div className={subSectionStyle}>
                    <label className={`${labelStyle} pt-2`}>{subTitle}</label>
                    <textarea
                        value={content?.[subField] || ''}
                        onChange={(e) => updateField(subField, e.target.value)}
                        placeholder={subPlaceholder}
                        className={`${textAreaStyle} !h-24`} 
                    />
                </div>
            )}
        </div>
    );
};

export default function BusinessModelCanvas({ content, onUpdate }) {
  return (
    <div className="w-full min-h-full p-4 bg-gray-100 dark:bg-gray-900 flex flex-col">
        <ScrollbarStyles />
        <div className="w-full flex-grow flex flex-col border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 shadow-xl min-h-[800px]">
            {/* Top Row (Problem, Solution, UVP, Unfair Adv, Segments) */}
            <div className="grid grid-cols-5 flex-[2] border-b-2 border-black dark:border-gray-500 divide-x-2 divide-black dark:divide-gray-500">
                {/* 1. Problem */}
                <Cell 
                    title="Problem" 
                    field="problem" 
                    placeholder="List your customers' top 3 problems..." 
                    subTitle="Existing Alternatives"
                    subField="existing-alternatives"
                    subPlaceholder="List how these problems are solved today..."
                    content={content} onUpdate={onUpdate}
                    watermark="2"
                />

                {/* 2. Solution & Key Metrics (Split Column) */}
                <div className="flex flex-col">
                     <Cell 
                        title="Solution" 
                        field="solution" 
                        placeholder="Outline possible solution for each problem..." 
                        className="!border-0 h-1/2"
                        content={content} onUpdate={onUpdate}
                        watermark="4"
                    />
                     <Cell 
                        title="Key Metrics" 
                        field="key-metrics" 
                        placeholder="List key numbers telling how your business is doing..." 
                        className="!border-0 !border-t-2 !border-black dark:!border-gray-500 h-1/2"
                        content={content} onUpdate={onUpdate}
                        watermark="8"
                    />
                </div>

                {/* 3. Value Proposition */}
                <Cell 
                    title="Unique Value Proposition" 
                    field="uvp" 
                    placeholder="Single, clear, compelling message that turns an unaware visitor into an interested prospect..."
                    subTitle="High-Level Concept"
                    subField="high-level-concept"
                    subPlaceholder="List your X for Y analogy (e.g. YouTube = Flickr for videos)..."
                    content={content} onUpdate={onUpdate}
                    watermark="3"
                />

                {/* 4. Unfair Advantage & Channels (Split Column) */}
                <div className="flex flex-col">
                     <Cell 
                        title="Unfair Advantage" 
                        field="unfair-advantage" 
                        placeholder="Something that can't be easily copied or bought..." 
                        className="!border-0 h-1/2"
                        content={content} onUpdate={onUpdate}
                        watermark="9"
                    />
                     <Cell 
                        title="Channels" 
                        field="channels" 
                        placeholder="List your path to customers..." 
                        className="!border-0 !border-t-2 !border-black dark:!border-gray-500 h-1/2"
                        content={content} onUpdate={onUpdate}
                        watermark="5"
                    />
                </div>

                {/* 5. Customer Segments */}
                <Cell 
                    title="Customer Segments" 
                    field="customer-segments" 
                    placeholder="List your target customers and users..."
                    subTitle="Early Adopters"
                    subField="early-adopters"
                    subPlaceholder="List characteristics of your ideal customer..."
                    content={content} onUpdate={onUpdate}
                    watermark="1"
                />
            </div>

            {/* Bottom Row (Cost, Revenue) */}
            <div className="grid grid-cols-2 flex-1 border-black dark:border-gray-500">
                 <Cell 
                    title="Cost Structure" 
                    field="cost-structure" 
                    placeholder="List your fixed and variable costs..." 
                    className="!border-0 !border-r-2 !border-black dark:!border-gray-500"
                    content={content} onUpdate={onUpdate}
                    watermark="7"
                />
                 <Cell 
                    title="Revenue Streams" 
                    field="revenue-streams" 
                    placeholder="List your sources of revenue..." 
                    className="!border-0"
                    content={content} onUpdate={onUpdate}
                    watermark="6"
                />
            </div>
        </div>
    </div>
  );
}
