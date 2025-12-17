import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, FileText, Trash2 } from 'lucide-react';

const STAGES = ['Empathize', 'Define', 'Ideate', 'Prototype', 'Test'];

export default function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tempRes, docRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/projects/${id}`),
        axios.get('http://localhost:3000/api/templates'),
        axios.get(`http://localhost:3000/api/documents?projectId=${id}`)
      ]);
      setProject(projRes.data);
      setTemplates(tempRes.data);
      setDocuments(docRes.data);
    } catch (error) {
      console.error("Failed to load project data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (e, docId) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/documents/${docId}`);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (error) {
      console.error("Failed to delete document", error);
      alert("Failed to delete document");
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          </div>
          <Link to="/" className="text-gray-500 hover:text-gray-900">Back to Dashboard</Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full">
          {STAGES.map((stage) => (
            <div key={stage} className="bg-white rounded-lg shadow flex flex-col h-full min-h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">{stage}</h3>
              </div>
              <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                {/* Existing Documents */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400">DOCUMENTS</h4>
                  {documents
                    .filter(doc => doc.template.phase === stage)
                    .map(doc => (
                      <div key={doc.id} className="relative group">
                        <Link
                          to={`/document/${doc.id}`}
                          className="block p-3 bg-blue-50 border border-blue-100 rounded hover:shadow-sm transition-all pr-8"
                        >
                          <div className="flex items-center text-sm font-medium text-blue-900">
                            <FileText className="w-4 h-4 mr-2" />
                            {doc.template.title}
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                          </div>
                        </Link>
                        <button
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white rounded"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  {documents.filter(doc => doc.template.phase === stage).length === 0 && (
                     <div className="text-xs text-gray-400 italic">No documents yet</div>
                  )}
                </div>

                {/* Available Templates */}
                <div className="space-y-2 mt-6">
                  <h4 className="text-xs font-semibold text-gray-400">AVAILABLE TEMPLATES</h4>
                  {templates
                    .filter(t => t.phase === stage)
                    .map(t => (
                      <Link
                        key={t.id}
                        to={`/project/${project.id}/template/${t.id}`}
                        className="flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200"
                      >
                        <span>{t.title}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
