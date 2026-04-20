import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function WorkshopPage() {
  const { folder } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/__api/workshops/${encodeURIComponent(folder)}`)
      .then((r) => (r.ok ? r.text() : Promise.reject('Not found')))
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('# No encontrado\n\nEste paso no tiene fichero WORKSHOP.md.');
        setLoading(false);
      });
  }, [folder]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <article className="markdown-body">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </article>
  );
}

export default function App() {
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    fetch('/__api/workshops')
      .then((r) => r.json())
      .then(setWorkshops);
  }, []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>📚 Workshop</h1>
          <p>Microfrontends</p>
        </div>
        <nav className="sidebar-nav">
          {workshops.map((w) => (
            <NavLink
              key={w.folder}
              to={`/workshop/${w.folder}`}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {w.title}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/workshop/:folder" element={<WorkshopPage />} />
          <Route
            path="*"
            element={
              workshops.length > 0 ? (
                <Navigate to={`/workshop/${workshops[0].folder}`} replace />
              ) : (
                <div className="loading">Cargando...</div>
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
