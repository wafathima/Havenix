import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../api/axios";
import {
  ArrowLeftIcon, XMarkIcon, DocumentArrowUpIcon,
  CurrencyDollarIcon, CalendarIcon, BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function EditExpense() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "materials",
    project: "",
    paymentMethod: "cash",
    paymentReference: "",
    vendor: "",
    status: "paid",
    taxAmount: "",
    taxRate: "",
    notes: "",
    tags: ""
  });

  const categories = [
    { value: "materials", label: "Materials" },
    { value: "labor", label: "Labor" },
    { value: "equipment", label: "Equipment" },
    { value: "permit", label: "Permits & Fees" },
    { value: "utility", label: "Utilities" },
    { value: "transport", label: "Transportation" },
    { value: "other", label: "Other" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "credit_card", label: "Credit Card" },
    { value: "other", label: "Other" }
  ];

  const statusOptions = [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" }
  ];

  useEffect(() => {
    fetchExpenseDetails();
    fetchProjects();
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      setFetchLoading(true);
      const { data } = await API.get(`/builder/expenses/${id}`);
      if (data.success) {
        const expense = data.expense;
        setFormData({
          title: expense.title || "",
          description: expense.description || "",
          amount: expense.amount || "",
          date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
          category: expense.category || "materials",
          project: expense.project?._id || "",
          paymentMethod: expense.paymentMethod || "cash",
          paymentReference: expense.paymentReference || "",
          vendor: expense.vendor || "",
          status: expense.status || "paid",
          taxAmount: expense.taxAmount || "",
          taxRate: expense.taxRate || "",
          notes: expense.notes || "",
          tags: expense.tags ? expense.tags.join(', ') : ""
        });
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
      toast.error("Failed to load expense details");
      navigate('/builder/dashboard?tab=expenses');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/builder/projects');
      if (data.projects) {
        setProjects(data.projects || []);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (receipt) {
        formDataToSend.append('receipt', receipt);
      }
      
      const response = await API.put(`/builder/expenses/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success("Expense updated successfully");
        navigate(`/builder/expense/${id}`);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error(error.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', padding: '40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ animation: 'pulse 1.4s ease infinite' }}>
            <div style={{ height: 40, background: '#EDE8DC', width: '60%', marginBottom: 20, borderRadius: 8 }} />
            <div style={{ height: 400, background: '#EDE8DC', borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", padding: '40px' }}>
      <style>{`
        .exp-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
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
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .exp-btn-primary:hover {
          background: #2C2A26;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .exp-btn-secondary {
          background: white;
          color: #1E1C18;
          border: 1px solid rgba(139,115,85,0.3);
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .exp-btn-secondary:hover {
          border-color: #8B7355;
          background: #F5F0E8;
        }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Link to={`/builder/expense/${id}`} className="exp-btn-secondary" style={{ padding: '8px 16px' }}>
            <ArrowLeftIcon style={{ width: 16, height: 16 }} />
            Back
          </Link>
          <h1 className="bld-serif" style={{ fontSize: '2rem', fontWeight: 300 }}>
            Edit <em style={{ color: '#8B7355' }}>Expense</em>
          </h1>
        </div>

        {/* Edit Form */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Title */}
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

              {/* Amount and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

              {/* Category and Project */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Project</label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className="exp-input"
                  >
                    <option value="">Select Project (Optional)</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method and Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

              {/* Vendor and Reference */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Reference</label>
                  <input
                    type="text"
                    name="paymentReference"
                    value={formData.paymentReference}
                    onChange={handleInputChange}
                    className="exp-input"
                    placeholder="Invoice or reference number"
                  />
                </div>
              </div>

              {/* Tax */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Tax Amount</label>
                  <input
                    type="number"
                    name="taxAmount"
                    value={formData.taxAmount}
                    onChange={handleInputChange}
                    className="exp-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className="exp-input"
                    placeholder="18"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="exp-input"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="exp-input"
                  rows="3"
                  placeholder="Internal notes..."
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="exp-input"
                  placeholder="material, urgent, approved"
                />
              </div>

              {/* Receipt Upload */}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#8B7355', display: 'block', marginBottom: 4 }}>Receipt</label>
                <div style={{ border: '1px dashed rgba(139,115,85,0.3)', borderRadius: 8, padding: 20, textAlign: 'center' }}>
                  {receiptPreview ? (
                    <div>
                      <img src={receiptPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, marginBottom: 8 }} />
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
                      <span style={{ fontSize: '0.8rem', color: '#8B7355' }}>Click to upload new receipt</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}>
                <Link to={`/builder/expense/${id}`} className="exp-btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="exp-btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Expense'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}