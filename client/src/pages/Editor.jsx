import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as htmlToImage from 'html-to-image';
import { Download, Eye, EyeOff, GripVertical } from 'lucide-react';
import VisualRenderer from '../components/VisualRenderer';
import IdeaCategorization from '../components/editors/IdeaCategorization';
import UserJourneyMap from '../components/editors/UserJourneyMap';
import PaperPrototypeCanvas from '../components/editors/PaperPrototypeCanvas';
import ThemeToggle from '../components/ThemeToggle';


export default function Editor() {
  const { id, projectId, templateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [editorWidth, setEditorWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  
  // State
  const [template, setTemplate] = useState(null);
  const [project, setProject] = useState(null);
  const [doc, setDoc] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, [id, projectId, templateId]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const loadData = async () => {
    try {
      if (id) {
        // Edit existing document
        const res = await axios.get(`http://localhost:3000/api/documents/${id}`);
        setDoc(res.data);
        setTemplate(res.data.template);
        setProject(res.data.project);
        setFormData(JSON.parse(res.data.content || '{}'));
      } else {
        // New document from template
        const [tempRes, projRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/templates/${templateId}`),
          axios.get(`http://localhost:3000/api/projects/${projectId}`)
        ]);
        setTemplate(tempRes.data);
        setProject(projRes.data);
      }
    } catch (error) {
      console.error("Failed to load editor data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const saveDocument = async () => {
    setSaving(true);
    try {
      if (doc) {
        // Update
        await axios.put(`http://localhost:3000/api/documents/${doc.id}`, {
          content: formData
        });
      } else {
        // Create
        const res = await axios.post('http://localhost:3000/api/documents', {
          projectId,
          templateId,
          content: formData
        });
        // Redirect to edit mode to avoid duplicate creation on save
        navigate(`/document/${res.data.id}`, { replace: true });
        // Update local state to reflect creation so export works
        setDoc({ ...res.data, template, project });
      }
      alert('Saved successfully!');
    } catch (error) {
      console.error("Save failed", error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const input = window.document.getElementById('visual-renderer-container');
    if (!input) return;

    // Debug: Log dimensions
    console.log('Exporting element:', input);
    console.log('Dimensions:', input.offsetWidth, input.offsetHeight);

    if (input.offsetWidth === 0 || input.offsetHeight === 0) {
      alert("Error: Export element has 0 size. Please try again.");
      return;
    }

    try {
      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const imgData = await htmlToImage.toPng(input, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        // CRITICAL FIX: Override position in the clone so it renders locally in the canvas,
        // while the 'real' element remains hidden off-screen.
        style: {
          position: 'static',
          left: 'auto',
          top: 'auto',
          margin: '0',
          display: 'block',
          transform: 'none' // Ensure no transforms move it away
        },
        width: input.scrollWidth + 50, // Capture full width with buffer
        height: input.scrollHeight // Capture full height
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${template.title.replace(/\s+/g, '_')}_Export.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export Image: " + err.message);
    }
  };

  if (loading) return <div>Loading editor...</div>;
  if (!template) return <div>Template not found</div>;

  const templateContent = typeof template.content === 'string' ? JSON.parse(template.content) : template.content;

  const sections = templateContent.sections || [];

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
      <header className="border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{template.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project?.name} / {template.phase}</p>
        </div>
        <div className="flex space-x-3">
          <ThemeToggle />
          <button
            onClick={() => navigate(`/project/${project?.id || doc?.projectId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Back
          </button>
          <button
            onClick={saveDocument}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Document'}
          </button>
          
          {template.title !== 'Paper Prototypes' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center border border-gray-300 dark:border-gray-600 rounded"
              title={showPreview ? "Hide Preview" : "Show Preview"}
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          )}
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center"
            title="Export as Image"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PNG
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Form Editor */}
        <div 
            className={`overflow-y-auto p-8 transition-all duration-75 bg-white dark:bg-gray-900 ${showPreview && template.title !== 'Paper Prototypes' ? 'border-r dark:border-gray-700' : 'w-full'}`}
            style={{ width: showPreview && template.title !== 'Paper Prototypes' ? `${editorWidth}%` : '100%' }}
        >
           <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-8 text-blue-800 dark:text-blue-200 text-sm whitespace-pre-wrap">
             <strong>Guidance:</strong> {template.description}
           </div>

           {template.title === 'Idea Categorization' ? (
              <IdeaCategorization 
                content={formData} 
                onUpdate={(newData) => setFormData(newData)} 
              />
           ) : template.title === 'User Journey Map' ? (
              <UserJourneyMap 
                content={formData} 
                onUpdate={(newData) => setFormData(newData)} 
              />
           ) : template.title === 'Paper Prototypes' ? (
              <PaperPrototypeCanvas 
                content={formData} 
                onUpdate={(newData) => setFormData(newData)} 
              />
           ) : (
             <div className="space-y-8">
             {sections.map((section) => (
               <div key={section.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-sm">
                 <label className="block text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                   {section.label}
                 </label>
                 {section.type === 'textarea' ? (
                   <textarea
                     value={formData[section.id] || ''}
                     onChange={(e) => handleInputChange(section.id, e.target.value)}
                     placeholder={section.placeholder}
                     className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                   />
                 ) : (
                   <input
                     type="text"
                     value={formData[section.id] || ''}
                     onChange={(e) => handleInputChange(section.id, e.target.value)}
                     placeholder={section.placeholder}
                     className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                   />
                 )}
               </div>
             ))}
           </div>
           )}
        </div>

        {/* Resizer Handle */}
        {showPreview && template.title !== 'Paper Prototypes' && (
            <div
                className="w-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-col-resize flex items-center justify-center border-l border-r border-gray-200 dark:border-gray-700 z-20 shrink-0 transition-colors"
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            </div>
        )}

        {/* Right Side: Visual Preview */}
        {showPreview && template.title !== 'Paper Prototypes' && (
          <div 
            className="bg-gray-100 dark:bg-gray-800 overflow-y-auto p-8 flex justify-center items-start"
            style={{ width: `${100 - editorWidth}%` }}
          >
            <div className="bg-white shadow-lg origin-top scale-[0.6] sm:scale-[0.8] lg:scale-100 transition-transform">
              <VisualRenderer template={template} content={formData} />
            </div>
          </div>
        )}

        {/* Hidden Container for Export Rendering (Still needed for high-res export) */}
        <div id="visual-renderer-container" style={{ 
          position: 'absolute', 
          top: '-10000px', 
          left: '-10000px',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'sans-serif',
          width: '800px', // Explicit width
          zIndex: -1000
        }}>
             <VisualRenderer template={template} content={formData} />
        </div>
      </main>
    </div>
  );
}
