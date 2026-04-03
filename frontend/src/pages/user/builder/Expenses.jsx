import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import ProjectList from "../../../components/builder/ProjectList";
import {
  CurrencyDollarIcon, PlusIcon, PencilIcon, TrashIcon,
  CalendarIcon, BuildingOfficeIcon, XMarkIcon, 
  MagnifyingGlassIcon, FunnelIcon, DocumentArrowUpIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function Expenses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState({ projects: true, expenses: true });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    count: 0,
    avgAmount: 0,
    categoryBreakdown: []
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "materials",
    paymentMethod: "cash",
    paymentReference: "",
    vendor: "",
    status: "paid",
    taxAmount: "",
    taxRate: "",
    notes: "",
    tags: ""
  });
  
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    startDate: "",
    endDate: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: "materials", label: "Materials", color: "#4A90E2" },
    { value: "labor", label: "Labor", color: "#C4A97A" },
    { value: "equipment", label: "Equipment", color: "#2E7D32" },
    { value: "permit", label: "Permits & Fees", color: "#C4503C" },
    { value: "utility", label: "Utilities", color: "#8B7355" },
    { value: "transport", label: "Transportation", color: "#9C27B0" },
    { value: "other", label: "Other", color: "#607D8B" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "credit_card", label: "Credit Card" },
    { value: "other", label: "Other" }
  ];

  const statusOptions = [
    { value: "paid", label: "Paid", color: "#2E7D32" },
    { value: "pending", label: "Pending", color: "#C4A97A" },
    { value: "overdue", label: "Overdue", color: "#C4503C" },
    { value: "cancelled", label: "Cancelled", color: "#9E9E9E" }
  ];

  useEffect(() => {
    if (selectedProject) {
      fetchExpenses();
    }
  }, [selectedProject, filters]);

  const fetchExpenses = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(p => ({ ...p, expenses: true }));
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('projectId', selectedProject._id);
      
      const { data } = await API.get(`/builder/expenses?${params.toString()}`);
      
      if (data.success) {
        setExpenses(data.expenses || []);
        setStats({
          totalAmount: data.stats?.totalAmount || 0,
          count: data.stats?.count || 0,
          avgAmount: data.stats?.avgAmount || 0,
          categoryBreakdown: data.categoryBreakdown || []
        });
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(p => ({ ...p, expenses: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      category: "materials",
      paymentMethod: "cash",
      paymentReference: "",
      vendor: "",
      status: "paid",
      taxAmount: "",
      taxRate: "",
      notes: "",
      tags: ""
    });
    setReceipt(null);
    setReceiptPreview(null);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    try {
      setLoading(p => ({ ...p, expenses: true }));
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('project', selectedProject._id);
      
      if (receipt) {
        formDataToSend.append('receipt', receipt);
      }
      
      const response = await API.post('/builder/expenses', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success("Expense added successfully");
        setShowAddModal(false);
        resetForm();
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(p => ({ ...p, expenses: false }));
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(p => ({ ...p, expenses: true }));
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (receipt) {
        formDataToSend.append('receipt', receipt);
      }
      
      const response = await API.put(`/builder/expenses/${selectedExpense._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success("Expense updated successfully");
        setShowEditModal(false);
        resetForm();
        setSelectedExpense(null);
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error(error.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(p => ({ ...p, expenses: false }));
    }
  };

  const handleDeleteExpense = async () => {
    try {
      setLoading(p => ({ ...p, expenses: true }));
      const response = await API.delete(`/builder/expenses/${selectedExpense._id}`);
      
      if (response.data.success) {
        toast.success("Expense deleted successfully");
        setShowDeleteModal(false);
        setSelectedExpense(null);
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error.response?.data?.message || "Failed to delete expense");
    } finally {
      setLoading(p => ({ ...p, expenses: false }));
    }
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      title: expense.title || "",
      description: expense.description || "",
      amount: expense.amount || "",
      date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      category: expense.category || "materials",
      paymentMethod: expense.paymentMethod || "cash",
      paymentReference: expense.paymentReference || "",
      vendor: expense.vendor || "",
      status: expense.status || "paid",
      taxAmount: expense.taxAmount || "",
      taxRate: expense.taxRate || "",
      notes: expense.notes || "",
      tags: expense.tags ? expense.tags.join(', ') : ""
    });
    setShowEditModal(true);
  };

  const formatCurrency = (n) => {
    if (!n) return "₹0";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lac`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || "#8B7355";
  };

  const getStatusColor = (status) => {
    const stat = statusOptions.find(s => s.value === status);
    return stat?.color || "#8B7355";
  };

  const getStatusLabel = (status) => {
    const stat = statusOptions.find(s => s.value === status);
    return stat?.label || status;
  };

  const filteredExpenses = expenses.filter(expense => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      expense.title?.toLowerCase().includes(searchLower) ||
      expense.vendor?.toLowerCase().includes(searchLower) ||
      expense.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", padding: '40px' }}>
      <style>{`
        .exp-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(139,115,85,0.1);
        }
        .exp-stat-card {
          background: linear-gradient(135deg, #fff 0%, #F5F0E8 100%);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(139,115,85,0.15);
        }
        .exp-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .exp-input:focus {
          outline: none;
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        .exp-btn-primary {
          background: #1E1C18;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .exp-btn-primary:hover {
          background: #2C2A26;
          transform: translateY(-2px);
        }
        .exp-btn-secondary {
          background: white;
          color: #1E1C18;
          border: 1px solid rgba(139,115,85,0.3);
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .exp-btn-secondary:hover {
          border-color: #8B7355;
          background: #F5F0E8;
        }
        .expense-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          border: 1px solid rgba(139,115,85,0.1);
          border-radius: 8px;
          margin-bottom: 8px;
        }
        .expense-row:hover {
          border-color: rgba(139,115,85,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .category-badge {
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .modal-overlay {
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
        .modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
        }
        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 30px;
          font-size: 0.8rem;
          cursor: pointer;
        }
      `}</style>


       <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
            Financial Management
          </div>
          <h1 className="bld-serif" style={{ fontSize: '2.5rem', fontWeight: 300, color: '#1E1C18' }}>
            Expense <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Tracking</em>
          </h1>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 32 }}>
          {/* Left Column - Projects List */}
          <div className="exp-card" style={{ padding: '20px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Your Projects</h3>
            <ProjectList 
              onSelectProject={setSelectedProject}
              selectedProjectId={selectedProject?._id}
            />
          </div>

          {/* Right Column - Project Expenses */}
          <div>
            {selectedProject ? (
              <>
                {/* Project Header */}
                <div className="exp-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 4 }}>{selectedProject.name}</h2>
                      <div style={{ display: 'flex', gap: 16, color: '#8B7355', fontSize: '0.8rem' }}>
                        <span>Budget: {formatCurrency(selectedProject.budget || 0)}</span>
                        <span>Total Spent: {formatCurrency(stats.totalAmount)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowAddModal(true)} 
                      className="exp-btn-primary"
                    >
                      <PlusIcon style={{ width: 18, height: 18 }} />
                      Add Expense
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                  <div className="exp-stat-card">
                    <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>Total Expenses</div>
                    <div className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 500 }}>{formatCurrency(stats.totalAmount)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6355' }}>{stats.count} transactions</div>
                  </div>
                  <div className="exp-stat-card">
                    <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>Average Expense</div>
                    <div className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 500 }}>{formatCurrency(stats.avgAmount)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6355' }}>per transaction</div>
                  </div>
                  <div className="exp-stat-card">
                    <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>Categories</div>
                    <div className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 500 }}>{stats.categoryBreakdown.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6355' }}>active categories</div>
                  </div>
                  <div className="exp-stat-card">
                    <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>Pending Payments</div>
                    <div className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 500, color: '#C4A97A' }}>
                      {expenses.filter(e => e.status === 'pending').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6355' }}>awaiting payment</div>
                  </div>
                </div>

                {/* Category Breakdown */}
                {stats.categoryBreakdown.length > 0 && (
                  <div className="exp-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Category Breakdown</h3>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {stats.categoryBreakdown.map(cat => {
                        const category = categories.find(c => c.value === cat._id);
                        return (
                          <div key={cat._id} style={{ flex: 1, minWidth: 120 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.8rem', color: '#8B7355' }}>{category?.label || cat._id}</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatCurrency(cat.total)}</span>
                            </div>
                            <div className="bld-progress-bar" style={{ height: 4, background: '#F5F0E8', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${(cat.total / stats.totalAmount * 100)}%`, height: '100%', background: category?.color || '#8B7355' }} />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#A89880', marginTop: 4 }}>{cat.count} items</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search and Filters */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative', maxWidth: 300 }}>
                      <MagnifyingGlassIcon style={{ width: 18, height: 18, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B7355' }} />
                      <input
                        type="text"
                        placeholder="Search expenses..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid rgba(139,115,85,0.2)', borderRadius: 30 }}
                      />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="filter-tag">
                      <FunnelIcon style={{ width: 14, height: 14 }} />
                      Filters
                    </button>
                  </div>

                  {showFilters && (
                    <div style={{ marginTop: 16, padding: 20, background: 'white', borderRadius: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="exp-input">
                          <option value="">All Categories</option>
                          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="exp-input">
                          <option value="">All Status</option>
                          {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="exp-input" />
                          <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="exp-input" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                        <button onClick={() => setFilters({ category: "", status: "", startDate: "", endDate: "", search: "" })} className="exp-btn-secondary">Clear</button>
                        <button onClick={() => fetchExpenses()} className="exp-btn-primary">Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expenses List */}
                <div className="exp-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Expense History</h3>
                    <span style={{ fontSize: '0.8rem', color: '#8B7355' }}>{filteredExpenses.length} entries</span>
                  </div>

                  {loading.expenses ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
                    </div>
                  ) : filteredExpenses.length > 0 ? (
                    filteredExpenses.map(expense => (
                      <div key={expense._id} className="expense-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: `${getCategoryColor(expense.category)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CurrencyDollarIcon style={{ width: 20, height: 20, color: getCategoryColor(expense.category) }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{expense.title}</div>
                            <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: '#8B7355' }}>
                              <span>{formatDate(expense.date)}</span>
                              {expense.vendor && <span>{expense.vendor}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{formatCurrency(expense.amount)}</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <span className="category-badge" style={{ background: `${getCategoryColor(expense.category)}15`, color: getCategoryColor(expense.category) }}>
                                {categories.find(c => c.value === expense.category)?.label}
                              </span>
                              <span style={{ color: getStatusColor(expense.status) }}>{getStatusLabel(expense.status)}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => openEditModal(expense)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}>
                              <PencilIcon style={{ width: 16, height: 16 }} />
                            </button>
                            <button onClick={() => { setSelectedExpense(expense); setShowDeleteModal(true); }} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#C4503C' }}>
                              <TrashIcon style={{ width: 16, height: 16 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <CurrencyDollarIcon style={{ width: 60, height: 60, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
                      <p style={{ color: '#8B7355' }}>No expenses found for this project</p>
                      <button onClick={() => setShowAddModal(true)} className="exp-btn-primary" style={{ marginTop: 16 }}>
                        <PlusIcon style={{ width: 16, height: 16 }} />
                        Add Your First Expense
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="exp-card" style={{ textAlign: 'center', padding: '60px 0' }}>
                <BuildingOfficeIcon style={{ width: 80, height: 80, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Select a Project</h3>
                <p style={{ color: '#8B7355' }}>Choose a project from the left to view its expenses</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="bld-serif" style={{ fontSize: '1.5rem' }}>Add New Expense</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="exp-input"
                    placeholder="e.g., Cement purchase, Labor payment"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      className="exp-input"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="exp-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="exp-input"
                    >
                      {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="exp-input"
                    >
                      {paymentMethods.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="exp-input"
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Vendor</label>
                    <input
                      type="text"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleInputChange}
                      className="exp-input"
                      placeholder="Supplier or vendor name"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="exp-input"
                    rows="2"
                    placeholder="Additional details..."
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Receipt</label>
                  <div style={{ border: '1px dashed rgba(139,115,85,0.3)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                    {receiptPreview ? (
                      <div>
                        <img src={receiptPreview} alt="Receipt preview" style={{ maxWidth: '100%', maxHeight: 150, marginBottom: 8 }} />
                        <button
                          type="button"
                          onClick={() => {
                            setReceipt(null);
                            setReceiptPreview(null);
                          }}
                          className="exp-btn-secondary"
                          style={{ padding: '4px 12px' }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer' }}>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptUpload}
                          style={{ display: 'none' }}
                        />
                        <DocumentArrowUpIcon style={{ width: 40, height: 40, color: '#8B7355', margin: '0 auto 8px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#8B7355' }}>Click to upload receipt</span>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="exp-input"
                    rows="2"
                    placeholder="Internal notes..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="exp-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="exp-btn-primary">
                    Add Expense
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && selectedExpense && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="bld-serif" style={{ fontSize: '1.5rem' }}>Edit Expense</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <form onSubmit={handleEditExpense}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="exp-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      className="exp-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="exp-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="exp-input"
                    >
                      {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="exp-input"
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="exp-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="exp-btn-primary">
                    Update Expense
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedExpense && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 className="bld-serif" style={{ fontSize: '1.3rem', marginBottom: 12 }}>Delete Expense</h3>
            <p style={{ marginBottom: 20 }}>Are you sure you want to delete <strong>{selectedExpense?.title}</strong>?</p>
            <p style={{ fontSize: '0.8rem', color: '#C4503C', marginBottom: 20 }}>This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} className="exp-btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteExpense} className="exp-btn-primary" style={{ background: '#C4503C' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}