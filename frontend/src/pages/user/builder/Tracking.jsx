import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import ProjectList from "../../../components/builder/ProjectList";
import {
  MapPinIcon, CalendarIcon, ClockIcon, CheckCircleIcon,
  XMarkIcon, PlusIcon, PencilIcon, TrashIcon,
  CameraIcon, UserGroupIcon, BuildingOfficeIcon,
  VideoCameraIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function Tracking() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State
  const [selectedProject, setSelectedProject] = useState(null);
  const [trackingEntries, setTrackingEntries] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState({
    tracking: false,
    milestones: false
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMilestoneModal, setShowDeleteMilestoneModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Form state for tracking entries
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: "",
    description: "",
    status: "in_progress",
    progress: 0,
    notes: "",
    location: "",
    weather: "",
    temperature: "",
    workersPresent: "",
    equipmentUsed: ""
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    date: "",
    status: "in_progress",
    progress: 0,
    notes: "",
    location: "",
    weather: "",
    temperature: "",
    workersPresent: "",
    equipmentUsed: ""
  });

  // Milestone form
  const [milestoneData, setMilestoneData] = useState({
    title: "",
    description: "",
    dueDate: "",
    completedDate: "",
    status: "pending",
    progress: 0
  });

  // Media
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    if (selectedProject) {
      fetchTrackingEntries();
      fetchMilestones();
    }
  }, [selectedProject, filters]);

  const fetchTrackingEntries = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(p => ({ ...p, tracking: true }));
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const { data } = await API.get(`/builder/tracking/${selectedProject._id}?${params.toString()}`);
      
      if (data.success) {
        setTrackingEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Error fetching tracking entries:", error);
      toast.error("Failed to load tracking data");
      setTrackingEntries([]);
    } finally {
      setLoading(p => ({ ...p, tracking: false }));
    }
  };

  const fetchMilestones = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(p => ({ ...p, milestones: true }));
      const { data } = await API.get(`/builder/tracking/milestones/${selectedProject._id}`);
      
      if (data.success) {
        setMilestones(data.milestones || []);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
      toast.error("Failed to load milestones");
      setMilestones([]);
    } finally {
      setLoading(p => ({ ...p, milestones: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMilestoneChange = (e) => {
    const { name, value } = e.target;
    setMilestoneData({ ...milestoneData, [name]: value });
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(prev => [...prev, { file, preview: reader.result }]);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(prev => [...prev, { file, preview: null }]);
      }
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: "",
      description: "",
      status: "in_progress",
      progress: 0,
      notes: "",
      location: "",
      weather: "",
      temperature: "",
      workersPresent: "",
      equipmentUsed: ""
    });
    setMediaFiles([]);
    setMediaPreview([]);
  };

  const resetMilestoneForm = () => {
    setMilestoneData({
      title: "",
      description: "",
      dueDate: "",
      completedDate: "",
      status: "pending",
      progress: 0
    });
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setEditFormData({
      title: entry.title || "",
      description: entry.description || "",
      date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: entry.status || "in_progress",
      progress: entry.progress || 0,
      notes: entry.notes || "",
      location: entry.location || "",
      weather: entry.weather || "",
      temperature: entry.temperature || "",
      workersPresent: entry.workersPresent || "",
      equipmentUsed: Array.isArray(entry.equipmentUsed) ? entry.equipmentUsed.join(', ') : entry.equipmentUsed || ""
    });
    setShowEditModal(true);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    try {
      setLoading(p => ({ ...p, tracking: true }));
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('projectId', selectedProject._id);
      
      mediaFiles.forEach((file) => {
        formDataToSend.append('media', file);
      });
      
      const response = await API.post(`/builder/tracking`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success("Tracking entry added successfully");
        setShowAddModal(false);
        resetForm();
        fetchTrackingEntries();
      }
    } catch (error) {
      console.error("Error adding tracking entry:", error);
      toast.error(error.response?.data?.message || "Failed to add entry");
    } finally {
      setLoading(p => ({ ...p, tracking: false }));
    }
  };

  const handleEditEntry = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(p => ({ ...p, tracking: true }));
      const formDataToSend = new FormData();
      
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== null && editFormData[key] !== undefined && editFormData[key] !== '') {
          formDataToSend.append(key, editFormData[key]);
        }
      });
      
      mediaFiles.forEach((file) => {
        formDataToSend.append('media', file);
      });
      
      const response = await API.put(`/builder/tracking/${selectedEntry._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success("Tracking entry updated successfully");
        setShowEditModal(false);
        setSelectedEntry(null);
        setMediaFiles([]);
        setMediaPreview([]);
        fetchTrackingEntries();
      }
    } catch (error) {
      console.error("Error updating tracking entry:", error);
      toast.error(error.response?.data?.message || "Failed to update entry");
    } finally {
      setLoading(p => ({ ...p, tracking: false }));
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) return;
    
    try {
      setLoading(p => ({ ...p, milestones: true }));
      const response = await API.post('/builder/tracking/milestones', {
        ...milestoneData,
        projectId: selectedProject._id
      });
      
      if (response.data.success) {
        toast.success("Milestone added successfully");
        setShowMilestoneModal(false);
        resetMilestoneForm();
        fetchMilestones();
      }
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast.error(error.response?.data?.message || "Failed to add milestone");
    } finally {
      setLoading(p => ({ ...p, milestones: false }));
    }
  };

  const handleUpdateMilestone = async (milestoneId, updates) => {
    try {
      const response = await API.put(`/builder/tracking/milestones/${milestoneId}`, updates);
      
      if (response.data.success) {
        toast.success("Milestone updated");
        fetchMilestones();
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone");
    }
  };

  const handleDeleteMilestone = async () => {
    if (!selectedMilestone) return;
    
    try {
      const response = await API.delete(`/builder/tracking/milestones/${selectedMilestone._id}`);
      
      if (response.data.success) {
        toast.success("Milestone deleted successfully");
        setShowDeleteMilestoneModal(false);
        setSelectedMilestone(null);
        fetchMilestones();
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error(error.response?.data?.message || "Failed to delete milestone");
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    
    try {
      const response = await API.delete(`/builder/tracking/${selectedEntry._id}`);
      
      if (response.data.success) {
        toast.success("Entry deleted successfully");
        setShowDeleteModal(false);
        setSelectedEntry(null);
        fetchTrackingEntries();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#C4A97A',
      'in_progress': '#4A90E2',
      'completed': '#2E7D32',
      'delayed': '#C4503C',
      'cancelled': '#9E9E9E'
    };
    return colors[status] || '#8B7355';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'delayed': 'Delayed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const calculateProjectProgress = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getMediaUrl = (media) => {
    if (!media || !media.url) return '';
    if (media.url.startsWith('http')) return media.url;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    return `${baseUrl}${media.url}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", padding: '40px' }}>
      <style>{`
        .track-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(139,115,85,0.1);
          transition: all 0.3s ease;
        }
        .track-card:hover {
          border-color: rgba(139,115,85,0.3);
        }

        .track-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(139,115,85,0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        .track-progress-fill {
          height: 100%;
          background: #8B7355;
          border-radius: 2px;
          transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }

        .track-timeline-item {
          position: relative;
          padding-left: 30px;
          padding-bottom: 24px;
          border-left: 2px solid rgba(139,115,85,0.2);
        }
        .track-timeline-item:last-child {
          border-left-color: transparent;
        }
        .track-timeline-dot {
          position: absolute;
          left: -9px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid #8B7355;
        }
        .track-timeline-dot.completed {
          background: #2E7D32;
          border-color: #2E7D32;
        }
        .track-timeline-dot.in_progress {
          background: #4A90E2;
          border-color: #4A90E2;
          animation: pulse 2s infinite;
        }

        .track-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .track-media-item {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(139,115,85,0.1);
          transition: all 0.2s ease;
        }
        .track-media-item:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .track-btn-primary {
          background: #1E1C18;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .track-btn-primary:hover {
          background: #2C2A26;
          transform: translateY(-2px);
        }

        .track-btn-secondary {
          background: white;
          color: #1E1C18;
          border: 1px solid rgba(139,115,85,0.3);
          padding: 10px 20px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .track-btn-secondary:hover {
          border-color: #8B7355;
          background: #F5F0E8;
        }

        .track-status-badge {
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: inline-block;
        }

        .track-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .track-input:focus {
          outline: none;
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }

        .track-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .track-modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .track-large-modal {
          max-width: 900px;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(74,144,226,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(74,144,226,0); }
          100% { box-shadow: 0 0 0 0 rgba(74,144,226,0); }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
            Project Tracking
          </div>
          <h1 className="bld-serif" style={{ fontSize: '2.5rem', fontWeight: 300, color: '#1E1C18' }}>
            Site <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Progress</em>
          </h1>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 32 }}>
          {/* Left Column - Projects List */}
          <div className="track-card" style={{ padding: '20px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Your Projects</h3>
            <ProjectList 
              onSelectProject={setSelectedProject}
              selectedProjectId={selectedProject?._id}
            />
          </div>

          {/* Right Column - Project Tracking */}
          <div>
            {selectedProject ? (
              <>
                {/* Project Header */}
                <div className="track-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 4 }}>{selectedProject.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#8B7355', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPinIcon style={{ width: 14, height: 14 }} />
                          {selectedProject.location || 'Location not set'}
                        </span>
                        {selectedProject.startDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarIcon style={{ width: 14, height: 14 }} />
                            Started {formatDate(selectedProject.startDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="bld-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18' }}>
                        {calculateProjectProgress()}% Complete
                      </div>
                      <div className="track-progress-bar" style={{ width: 200 }}>
                        <div className="track-progress-fill" style={{ width: `${calculateProjectProgress()}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20 }}>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 2 }}>Total Milestones</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{milestones.length}</div>
                    </div>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 2 }}>Completed</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2E7D32' }}>
                        {milestones.filter(m => m.status === 'completed').length}
                      </div>
                    </div>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 2 }}>In Progress</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4A90E2' }}>
                        {milestones.filter(m => m.status === 'in_progress').length}
                      </div>
                    </div>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 2 }}>Site Updates</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{trackingEntries.length}</div>
                    </div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="track-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Project Milestones</h3>
                    <button
                      onClick={() => setShowMilestoneModal(true)}
                      className="track-btn-secondary"
                      style={{ padding: '6px 12px' }}
                    >
                      <PlusIcon style={{ width: 12, height: 12 }} />
                      Add Milestone
                    </button>
                  </div>

                  {loading.milestones ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
                    </div>
                  ) : milestones.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {milestones.map(milestone => (
                        <div
                          key={milestone._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: '#F5F0E8',
                            border: '1px solid rgba(139,115,85,0.1)',
                            borderRadius: '8px',
                            flexWrap: 'wrap',
                            gap: 12
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                              <span className="track-status-badge" style={{
                                background: `${getStatusColor(milestone.status)}20`,
                                color: getStatusColor(milestone.status)
                              }}>
                                {getStatusLabel(milestone.status)}
                              </span>
                              <span style={{ fontWeight: 600 }}>{milestone.title}</span>
                            </div>
                            {milestone.description && (
                              <div style={{ fontSize: '0.75rem', color: '#6B6355', marginTop: 4 }}>{milestone.description}</div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#8B7355', fontSize: '0.7rem', marginTop: 4 }}>
                              <span>Due: {formatDate(milestone.dueDate)}</span>
                              {milestone.completedDate && (
                                <span>Completed: {formatDate(milestone.completedDate)}</span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 100 }}>
                              <div className="track-progress-bar">
                                <div className="track-progress-fill" style={{ width: `${milestone.progress || 0}%` }} />
                              </div>
                            </div>
                            
                            <select
                              value={milestone.status}
                              onChange={(e) => handleUpdateMilestone(milestone._id, { status: e.target.value })}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid rgba(139,115,85,0.2)',
                                borderRadius: '6px',
                                fontSize: '0.7rem'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="delayed">Delayed</option>
                            </select>

                            <button
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                setShowDeleteMilestoneModal(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                color: '#C4503C',
                                opacity: 0.7
                              }}
                              title="Delete milestone"
                            >
                              <TrashIcon style={{ width: 16, height: 16 }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B7355' }}>
                      <CheckCircleIcon style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.4 }} />
                      <p>No milestones added yet</p>
                      <button
                        onClick={() => setShowMilestoneModal(true)}
                        className="track-btn-secondary"
                        style={{ marginTop: 12 }}
                      >
                        Add First Milestone
                      </button>
                    </div>
                  )}
                </div>

                {/* Tracking Updates Section */}
                <div className="track-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Site Updates</h3>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="track-btn-primary"
                      >
                        <PlusIcon style={{ width: 14, height: 14 }} />
                        Add Update
                      </button>
                      
                      <div style={{ display: 'flex', border: '1px solid rgba(139,115,85,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          onClick={() => setViewMode('list')}
                          style={{
                            padding: '6px 12px',
                            background: viewMode === 'list' ? '#8B7355' : 'white',
                            color: viewMode === 'list' ? 'white' : '#8B7355',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          List
                        </button>
                        <button
                          onClick={() => setViewMode('timeline')}
                          style={{
                            padding: '6px 12px',
                            background: viewMode === 'timeline' ? '#8B7355' : 'white',
                            color: viewMode === 'timeline' ? 'white' : '#8B7355',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          Timeline
                        </button>
                      </div>

                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="track-btn-secondary"
                        style={{ padding: '6px 12px' }}
                      >
                        Filters
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div style={{ marginBottom: 20, padding: 16, background: '#F5F0E8', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Status</label>
                          <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="track-input"
                          >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>From Date</label>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="track-input"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>To Date</label>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="track-input"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                        <button
                          onClick={() => {
                            setFilters({ status: '', startDate: '', endDate: '' });
                            fetchTrackingEntries();
                          }}
                          className="track-btn-secondary"
                          style={{ padding: '6px 12px' }}
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => fetchTrackingEntries()}
                          className="track-btn-primary"
                          style={{ padding: '6px 12px' }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timeline View */}
                  {viewMode === 'timeline' ? (
                    <div style={{ padding: '20px 0' }}>
                      {loading.tracking ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
                        </div>
                      ) : trackingEntries.length > 0 ? (
                        trackingEntries.map((entry) => (
                          <div key={entry._id} className="track-timeline-item">
                            <div className={`track-timeline-dot ${entry.status}`} />
                            
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                  <span style={{ fontSize: '0.8rem', color: '#8B7355' }}>
                                    {formatDate(entry.date)} at {formatTime(entry.createdAt)}
                                  </span>
                                  <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '4px 0' }}>{entry.title}</h4>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <span className="track-status-badge" style={{
                                    background: `${getStatusColor(entry.status)}20`,
                                    color: getStatusColor(entry.status)
                                  }}>
                                    {getStatusLabel(entry.status)}
                                  </span>
                                  <button
                                    onClick={() => openEditModal(entry)}
                                    style={{ background: 'none', border: 'none', color: '#8B7355', cursor: 'pointer', padding: '4px' }}
                                  >
                                    <PencilIcon style={{ width: 14, height: 14 }} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedEntry(entry);
                                      setShowDeleteModal(true);
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#C4503C', cursor: 'pointer', padding: '4px' }}
                                  >
                                    <TrashIcon style={{ width: 14, height: 14 }} />
                                  </button>
                                </div>
                              </div>
                              
                              <p style={{ color: '#6B6355', margin: '8px 0' }}>{entry.description}</p>
                              
                              {/* Site Details */}
                              {(entry.workersPresent || entry.weather || entry.equipmentUsed) && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '12px 0', padding: '12px', background: '#F5F0E8', borderRadius: '8px' }}>
                                  {entry.workersPresent && (
                                    <div>
                                      <div className="bld-sans" style={{ fontSize: '0.6rem', color: '#8B7355', marginBottom: 2 }}>Workers</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <UserGroupIcon style={{ width: 14, height: 14, color: '#8B7355' }} />
                                        <span>{entry.workersPresent}</span>
                                      </div>
                                    </div>
                                  )}
                                  {entry.weather && (
                                    <div>
                                      <div className="bld-sans" style={{ fontSize: '0.6rem', color: '#8B7355', marginBottom: 2 }}>Weather</div>
                                      <div>{entry.weather} {entry.temperature && `(${entry.temperature}°C)`}</div>
                                    </div>
                                  )}
                                  {entry.equipmentUsed && (
                                    <div>
                                      <div className="bld-sans" style={{ fontSize: '0.6rem', color: '#8B7355', marginBottom: 2 }}>Equipment</div>
                                      <div>{entry.equipmentUsed}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Media Grid */}
                              {entry.media && entry.media.length > 0 && (
                                <div className="track-media-grid">
                                  {entry.media.map((media, idx) => (
                                    <div
                                      key={idx}
                                      className="track-media-item"
                                      onClick={() => {
                                        setSelectedMedia(media);
                                        setShowMediaModal(true);
                                      }}
                                    >
                                      {media.type === 'image' ? (
                                        <img
                                          src={getMediaUrl(media)}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%238B7355"%3E%3Crect x="2" y="2" width="20" height="20" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                                          }}
                                          alt={`Update ${idx + 1}`}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div style={{
                                          width: '100%',
                                          height: '100%',
                                          background: '#F5F0E8',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}>
                                          <VideoCameraIcon style={{ width: 30, height: 30, color: '#8B7355' }} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Notes */}
                              {entry.notes && (
                                <div style={{ marginTop: 12, padding: '12px', background: 'rgba(139,115,85,0.05)', borderRadius: '8px' }}>
                                  <div className="bld-sans" style={{ fontSize: '0.6rem', color: '#8B7355', marginBottom: 4 }}>Notes</div>
                                  <p style={{ fontSize: '0.85rem', color: '#1E1C18' }}>{entry.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B7355' }}>
                          <CameraIcon style={{ width: 50, height: 50, margin: '0 auto 16px', opacity: 0.3 }} />
                          <p>No tracking updates yet</p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="track-btn-primary"
                            style={{ marginTop: 16 }}
                          >
                            <PlusIcon style={{ width: 14, height: 14 }} />
                            Add First Update
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* List View */
                    <div>
                      {loading.tracking ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
                        </div>
                      ) : trackingEntries.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {trackingEntries.map(entry => (
                            <div
                              key={entry._id}
                              style={{
                                padding: '16px',
                                border: '1px solid rgba(139,115,85,0.1)',
                                borderRadius: '8px',
                                background: 'white'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <CalendarIcon style={{ width: 12, height: 12 }} />
                                      {formatDate(entry.date)}
                                    </span>
                                    <span className="track-status-badge" style={{
                                      background: `${getStatusColor(entry.status)}20`,
                                      color: getStatusColor(entry.status)
                                    }}>
                                      {getStatusLabel(entry.status)}
                                    </span>
                                  </div>
                                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{entry.title}</h4>
                                  <p style={{ color: '#6B6355', fontSize: '0.85rem', marginBottom: 8 }}>{entry.description}</p>
                                  
                                  {/* Quick Stats */}
                                  {(entry.workersPresent || entry.weather) && (
                                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                      {entry.workersPresent && (
                                        <span style={{ fontSize: '0.7rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                          <UserGroupIcon style={{ width: 12, height: 12 }} />
                                          {entry.workersPresent} workers
                                        </span>
                                      )}
                                      {entry.weather && (
                                        <span style={{ fontSize: '0.7rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                          {entry.weather} {entry.temperature && `(${entry.temperature}°C)`}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Preview Media */}
                                  {entry.media && entry.media.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                      {entry.media.slice(0, 4).map((media, idx) => (
                                        <div
                                          key={idx}
                                          style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(139,115,85,0.2)'
                                          }}
                                          onClick={() => {
                                            setSelectedMedia(media);
                                            setShowMediaModal(true);
                                          }}
                                        >
                                          {media.type === 'image' ? (
                                            <img
                                              src={getMediaUrl(media)}
                                              alt=""
                                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                          ) : (
                                            <div style={{
                                              width: '100%',
                                              height: '100%',
                                              background: '#F5F0E8',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}>
                                              <VideoCameraIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      {entry.media.length > 4 && (
                                        <div style={{
                                          width: 50,
                                          height: 50,
                                          borderRadius: '6px',
                                          background: '#F5F0E8',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.7rem',
                                          color: '#8B7355'
                                        }}>
                                          +{entry.media.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    onClick={() => openEditModal(entry)}
                                    style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}
                                    title="Edit"
                                  >
                                    <PencilIcon style={{ width: 16, height: 16 }} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedEntry(entry);
                                      setShowDeleteModal(true);
                                    }}
                                    style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#C4503C' }}
                                    title="Delete"
                                  >
                                    <TrashIcon style={{ width: 16, height: 16 }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B7355' }}>
                          <CameraIcon style={{ width: 50, height: 50, margin: '0 auto 16px', opacity: 0.3 }} />
                          <p>No tracking updates yet</p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="track-btn-primary"
                            style={{ marginTop: 16 }}
                          >
                            <PlusIcon style={{ width: 14, height: 14 }} />
                            Add First Update
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="track-card" style={{ textAlign: 'center', padding: '60px 0' }}>
                <BuildingOfficeIcon style={{ width: 80, height: 80, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Select a Project</h3>
                <p style={{ color: '#8B7355' }}>Choose a project from the left to view its progress tracking</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="track-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="track-modal track-large-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="bld-serif" style={{ fontSize: '1.5rem' }}>Add Site Update</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <form onSubmit={handleAddEntry}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="track-input"
                      placeholder="e.g., Foundation work, Wall construction"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="track-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="track-input"
                    rows="3"
                    placeholder="Describe the work done today..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="track-input"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Progress %</label>
                    <input
                      type="number"
                      name="progress"
                      value={formData.progress}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="track-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Workers Present</label>
                    <input
                      type="number"
                      name="workersPresent"
                      value={formData.workersPresent}
                      onChange={handleInputChange}
                      className="track-input"
                      placeholder="Number of workers"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Weather</label>
                    <input
                      type="text"
                      name="weather"
                      value={formData.weather}
                      onChange={handleInputChange}
                      className="track-input"
                      placeholder="e.g., Sunny, Rainy"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Temperature (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      className="track-input"
                      placeholder="Temperature"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Equipment Used</label>
                  <input
                    type="text"
                    name="equipmentUsed"
                    value={formData.equipmentUsed}
                    onChange={handleInputChange}
                    className="track-input"
                    placeholder="e.g., Excavator, Concrete mixer"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Location/Area</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="track-input"
                    placeholder="Specific area of the site"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Photos & Videos</label>
                  <div style={{ border: '1px dashed rgba(139,115,85,0.3)', borderRadius: '8px', padding: '20px' }}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      multiple
                      style={{ display: 'none' }}
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                      <CameraIcon style={{ width: 40, height: 40, color: '#8B7355', margin: '0 auto 8px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#8B7355' }}>Click to upload photos/videos</span>
                    </label>
                  </div>

                  {mediaPreview.length > 0 && (
                    <div className="track-media-grid" style={{ marginTop: 12 }}>
                      {mediaPreview.map((media, index) => (
                        <div key={index} className="track-media-item" style={{ position: 'relative' }}>
                          {media.preview ? (
                            <img src={media.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <VideoCameraIcon style={{ width: 30, height: 30, color: '#8B7355' }} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            <XMarkIcon style={{ width: 14, height: 14, color: '#C4503C' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="track-input"
                    rows="3"
                    placeholder="Any additional observations or notes..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="track-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="track-btn-primary">
                    Add Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && selectedEntry && (
        <div className="track-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="track-modal track-large-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="bld-serif" style={{ fontSize: '1.5rem' }}>Edit Site Update</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <form onSubmit={handleEditEntry}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Title *</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      required
                      className="track-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Date *</label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      required
                      className="track-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="track-input"
                    rows="3"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="track-input"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Progress %</label>
                    <input
                      type="number"
                      value={editFormData.progress}
                      onChange={(e) => setEditFormData({ ...editFormData, progress: e.target.value })}
                      min="0"
                      max="100"
                      className="track-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="track-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="track-btn-primary">
                    Update Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="track-modal-overlay" onClick={() => setShowMilestoneModal(false)}>
          <div className="track-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="bld-serif" style={{ fontSize: '1.5rem' }}>Add Milestone</h2>
              <button onClick={() => setShowMilestoneModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <form onSubmit={handleAddMilestone}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Milestone Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={milestoneData.title}
                    onChange={handleMilestoneChange}
                    required
                    className="track-input"
                    placeholder="e.g., Foundation Complete, Roofing Done"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea
                    name="description"
                    value={milestoneData.description}
                    onChange={handleMilestoneChange}
                    className="track-input"
                    rows="3"
                    placeholder="Describe this milestone..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Due Date *</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={milestoneData.dueDate}
                      onChange={handleMilestoneChange}
                      required
                      className="track-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Status</label>
                    <select
                      name="status"
                      value={milestoneData.status}
                      onChange={handleMilestoneChange}
                      className="track-input"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Progress %</label>
                  <input
                    type="number"
                    name="progress"
                    value={milestoneData.progress}
                    onChange={handleMilestoneChange}
                    min="0"
                    max="100"
                    className="track-input"
                  />
                </div>

                {milestoneData.status === 'completed' && (
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Completed Date</label>
                    <input
                      type="date"
                      name="completedDate"
                      value={milestoneData.completedDate}
                      onChange={handleMilestoneChange}
                      className="track-input"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowMilestoneModal(false)} className="track-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="track-btn-primary">
                    Add Milestone
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media View Modal */}
      {showMediaModal && selectedMedia && (
        <div className="track-modal-overlay" onClick={() => setShowMediaModal(false)}>
          <div className="track-modal track-large-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setShowMediaModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>
            
            {selectedMedia.type === 'image' ? (
              <img
                src={getMediaUrl(selectedMedia)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="padding:20px;text-align:center;color:#8B7355">Image failed to load</div>';
                }}
                alt="Media"
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            ) : (
              <video
                src={getMediaUrl(selectedMedia)}
                controls
                style={{ width: '100%', maxHeight: '70vh' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Delete Entry Confirmation Modal */}
      {showDeleteModal && selectedEntry && (
        <div className="track-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="track-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 className="bld-serif" style={{ fontSize: '1.3rem', marginBottom: 12 }}>Delete Update</h3>
            <p style={{ marginBottom: 20 }}>Are you sure you want to delete <strong>{selectedEntry.title}</strong>?</p>
            <p style={{ fontSize: '0.8rem', color: '#C4503C', marginBottom: 20 }}>This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} className="track-btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteEntry} className="track-btn-primary" style={{ background: '#C4503C' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Milestone Confirmation Modal */}
      {showDeleteMilestoneModal && selectedMilestone && (
        <div className="track-modal-overlay" onClick={() => setShowDeleteMilestoneModal(false)}>
          <div className="track-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 className="bld-serif" style={{ fontSize: '1.3rem', marginBottom: 12 }}>Delete Milestone</h3>
            <p style={{ marginBottom: 20 }}>Are you sure you want to delete <strong>{selectedMilestone.title}</strong>?</p>
            <p style={{ fontSize: '0.8rem', color: '#C4503C', marginBottom: 20 }}>This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteMilestoneModal(false)} className="track-btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteMilestone} className="track-btn-primary" style={{ background: '#C4503C' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}