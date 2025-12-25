import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';

// Modified to be a pass-through since we are now local/frontend-only
const ProtectedRoute = () => {
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project/:id" element={<ProjectView />} />
              <Route path="/project/:projectId/template/:templateId" element={<Editor />} />
              <Route path="/document/:id" element={<Editor />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
