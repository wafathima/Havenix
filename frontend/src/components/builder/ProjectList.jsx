import { useState, useEffect } from "react";
import API from "../../api/axios";
import { BuildingOfficeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function ProjectList({ onSelectProject, selectedProjectId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/builder/my');
      if (data.projects) {
        setProjects(data.projects);
      } else if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <BuildingOfficeIcon style={{ width: 60, height: 60, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
        <p style={{ color: '#8B7355' }}>No projects yet</p>
        <button 
          onClick={() => window.location.href = '/builder/add-project'}
          className="bld-btn-primary"
          style={{ marginTop: 16 }}
        >
          Create Your First Project
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {projects.map(project => (
        <div
          key={project._id}
          onClick={() => onSelectProject(project)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            background: selectedProjectId === project._id ? '#1E1C18' : 'white',
            border: `1px solid ${selectedProjectId === project._id ? '#8B7355' : 'rgba(139,115,85,0.1)'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: selectedProjectId === project._id ? 'white' : '#1E1C18'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: selectedProjectId === project._id ? 'rgba(196,169,122,0.2)' : '#F5F0E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BuildingOfficeIcon style={{ width: 24, height: 24, color: selectedProjectId === project._id ? '#C4A97A' : '#8B7355' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>
                {project.name}
              </h3>
              <div style={{ 
                fontSize: '0.75rem', 
                color: selectedProjectId === project._id ? '#C4A97A' : '#8B7355',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                {project.location && <span>📍 {project.location}</span>}
                {project.status && <span>📋 {project.status}</span>}
              </div>
            </div>
          </div>
          <ChevronRightIcon style={{ width: 20, height: 20, color: selectedProjectId === project._id ? '#C4A97A' : '#8B7355' }} />
        </div>
      ))}
    </div>
  );
}