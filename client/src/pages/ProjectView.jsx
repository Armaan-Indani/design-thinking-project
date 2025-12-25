import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, FileText, Trash2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import NotFound from './NotFound';
import { storage } from '../lib/storage';

const STAGES = ['Empathize', 'Define', 'Ideate', 'Prototype', 'Test', 'Other'];

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
        storage.getProject(id),
        storage.getTemplates(),
        storage.getDocuments(id)
      ]);
      setProject(projRes.data);
      setTemplates(tempRes.data);
      setDocuments(docRes.data);
    } catch (error) {
      console.error("Failed to load project data", error);
      // In local storage, 404 is an error throw, handle accordingly
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (e, docId) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await storage.deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (error) {
      console.error("Failed to delete document", error);
      alert("Failed to delete document");
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (!project) return <NotFound />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Back to Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-full mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 overflow-x-auto">
        <div className="flex gap-4 h-full w-full">
          {STAGES.map((stage) => (
            <div key={stage} className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full min-h-[400px] border dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-xs">{stage}</h3>
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
                          className="block p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded hover:shadow-sm transition-all pr-8"
                        >
                          <div className="flex items-center text-sm font-medium text-blue-900 dark:text-blue-100">
                            <FileText className="w-4 h-4 mr-2" />
                            {doc.template.title}
                            {(() => {
                                try {
                                  const content = JSON.parse(doc.content || '{}');
                                  return content.userType ? <span className="ml-2 font-normal text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs">{content.userType}</span> : null;
                                } catch (e) { return null; }
                            })()}
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                          </div>
                        </Link>
                        <button
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-700 rounded"
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
                        className="flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
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
