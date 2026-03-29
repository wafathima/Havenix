import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../../api/axios";
import {
  ArrowLeftIcon, PencilIcon, TrashIcon, CurrencyDollarIcon,
  CalendarIcon, TagIcon, BuildingOfficeIcon, UserIcon,
  DocumentTextIcon, PhoneIcon, EnvelopeIcon, ClockIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon as ClockIconOutline,
  DocumentArrowUpIcon, PhotoIcon, DocumentIcon, MapPinIcon,
  CreditCardIcon, ReceiptPercentIcon, BanknotesIcon,
  ArrowDownTrayIcon, PrinterIcon, ShareIcon
} from "@heroicons/react/24/outline";
import { 
  FaFilePdf, FaImage, FaRegFilePdf, FaRegFileImage,
  FaRegFileAlt, FaRegClock, FaRegCheckCircle, FaRegTimesCircle
} from "react-icons/fa";
import { MdOutlinePayment, MdOutlineReceipt } from "react-icons/md";
import toast from "react-hot-toast";

export default function ExpenseDetails() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/builder/expenses/${id}`);
      if (data.success) {
        setExpense(data.expense);
        console.log("Expense data:", data.expense);
      }
    } catch (error) {
      console.error("Error fetching expense details:", error);
      toast.error("Failed to load expense details");
      navigate('/builder/dashboard?tab=expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await API.delete(`/builder/expenses/${id}`);
      if (response.data.success) {
        toast.success('Expense deleted successfully');
        navigate('/builder/dashboard?tab=expenses');
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (n) => {
    if (!n) return "₹0";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lac`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryDetails = (category) => {
    const categories = {
      materials: { label: 'Materials', color: '#4A90E2', bg: '#E3F2FD', icon: '🧱' },
      labor: { label: 'Labor', color: '#C4A97A', bg: '#FFF3E0', icon: '👷' },
      equipment: { label: 'Equipment', color: '#2E7D32', bg: '#E8F5E9', icon: '🔧' },
      permit: { label: 'Permits & Fees', color: '#C4503C', bg: '#FFEBEE', icon: '📄' },
      utility: { label: 'Utilities', color: '#8B7355', bg: '#F5F0E8', icon: '💡' },
      transport: { label: 'Transportation', color: '#9C27B0', bg: '#F3E5F5', icon: '🚚' },
      other: { label: 'Other', color: '#607D8B', bg: '#ECEFF1', icon: '📌' }
    };
    return categories[category] || categories.other;
  };

  const getStatusDetails = (status) => {
    const statuses = {
      paid: { label: 'Paid', color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircleIcon className="w-4 h-4" /> },
      pending: { label: 'Pending', color: '#C4A97A', bg: '#FFF3E0', icon: <ClockIconOutline className="w-4 h-4" /> },
      overdue: { label: 'Overdue', color: '#C4503C', bg: '#FFEBEE', icon: <XCircleIcon className="w-4 h-4" /> },
      cancelled: { label: 'Cancelled', color: '#9E9E9E', bg: '#F5F5F5', icon: <XCircleIcon className="w-4 h-4" /> }
    };
    return statuses[status] || statuses.pending;
  };

  const getPaymentMethodIcon = (method) => {
    const methods = {
      cash: <BanknotesIcon className="w-5 h-5" />,
      bank_transfer: <CreditCardIcon className="w-5 h-5" />,
      cheque: <ReceiptPercentIcon className="w-5 h-5" />,
      credit_card: <CreditCardIcon className="w-5 h-5" />,
      other: <MdOutlinePayment className="w-5 h-5" />
    };
    return methods[method] || methods.other;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (expense?.receipt) {
      window.open(expense.receipt, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', padding: '40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ animation: 'pulse 1.4s ease infinite' }}>
            <div style={{ height: 40, background: '#EDE8DC', width: '60%', marginBottom: 20, borderRadius: 8 }} />
            <div style={{ height: 200, background: '#EDE8DC', marginBottom: 20, borderRadius: 12 }} />
            <div style={{ height: 300, background: '#EDE8DC', borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!expense) return null;

  const category = getCategoryDetails(expense.category);
  const status = getStatusDetails(expense.status);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        .exp-detail-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(139,115,85,0.1);
          overflow: hidden;
        }

        .exp-detail-header {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(139,115,85,0.1);
          background: linear-gradient(to right, #F9F9F7, #FFFFFF);
        }

        .exp-detail-body {
          padding: 32px;
        }

        .exp-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .exp-info-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: #F9F9F7;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .exp-info-item:hover {
          background: #F5F0E8;
          transform: translateX(4px);
        }

        .exp-info-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B7355;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .exp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .exp-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #F5F0E8;
          border-radius: 30px;
          font-size: 0.75rem;
          color: #5D4A36;
        }

        .exp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1E1C18; color: white;
          border: none; padding: 10px 20px; border-radius: 30px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
        }
        .exp-btn-primary:hover { 
          background: #2C2A26; 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .exp-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #1E1C18;
          border: 1px solid rgba(139,115,85,0.3); padding: 10px 20px; border-radius: 30px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
        }
        .exp-btn-secondary:hover { 
          border-color: #8B7355; 
          background: #F5F0E8;
          transform: translateY(-2px);
        }

        .exp-btn-danger {
          background: #C4503C; color: white;
          border: none;
        }
        .exp-btn-danger:hover { background: #A33D2C; }

        .exp-receipt-preview {
          border: 2px dashed rgba(139,115,85,0.3);
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .exp-receipt-preview:hover {
          border-color: #8B7355;
          background: #F5F0E8;
        }

        .exp-tab-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(139,115,85,0.15);
          padding-bottom: 12px;
        }

        .exp-tab {
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #8B7355;
        }
        .exp-tab:hover {
          background: rgba(139,115,85,0.05);
        }
        .exp-tab.active {
          background: #8B7355;
          color: white;
        }

        .exp-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .exp-meta-item {
          padding: 16px;
          background: #F9F9F7;
          border-radius: 8px;
        }

        .exp-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(139,115,85,0.2), transparent);
          margin: 24px 0;
        }

        .exp-timeline {
          position: relative;
          padding-left: 24px;
        }
        .exp-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(139,115,85,0.2);
        }
        .exp-timeline-item {
          position: relative;
          padding-bottom: 20px;
        }
        .exp-timeline-item::before {
          content: '';
          position: absolute;
          left: -29px;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8B7355;
          border: 2px solid white;
        }

        @media print {
          .no-print { display: none; }
          body { background: white; }
        }

        @keyframes pulse {
          0%,100%{opacity:1}
          50%{opacity:0.4}
        }
      `}</style>

      {/* Header with Actions */}
      <div style={{ padding: '30px 40px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button
            onClick={() => navigate('/builder/dashboard?tab=expenses')}
            className="exp-btn-secondary no-print"
            style={{ padding: '8px 16px' }}
          >
            <ArrowLeftIcon style={{ width: 16, height: 16 }} />
            Back to Expenses
          </button>

          <div style={{ display: 'flex', gap: 12 }} className="no-print">
            <button onClick={handlePrint} className="exp-btn-secondary">
              <PrinterIcon style={{ width: 16, height: 16 }} />
              Print
            </button>
            <Link to={`/builder/edit-expense/${id}`} className="exp-btn-secondary">
              <PencilIcon style={{ width: 16, height: 16 }} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="exp-btn-primary exp-btn-danger"
            >
              <TrashIcon style={{ width: 16, height: 16 }} />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="exp-detail-card">
          <div className="exp-detail-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span className="exp-badge" style={{ background: category.bg, color: category.color }}>
                    <span style={{ marginRight: 4 }}>{category.icon}</span>
                    {category.label}
                  </span>
                  <span className="exp-badge" style={{ background: status.bg, color: status.color }}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
                <h1 className="bld-serif" style={{ fontSize: '2.5rem', fontWeight: 400, color: '#1E1C18', marginBottom: 8 }}>
                  {expense.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#8B7355' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarIcon style={{ width: 16, height: 16 }} />
                    {formatDate(expense.date)}
                  </span>
                  {expense.vendor && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UserIcon style={{ width: 16, height: 16 }} />
                      {expense.vendor}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="bld-sans" style={{ fontSize: '0.8rem', color: '#8B7355', marginBottom: 4 }}>Amount</div>
                <div className="bld-serif" style={{ fontSize: '3rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>
                  {formatCurrency(expense.amount)}
                </div>
                {expense.taxAmount > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#6B6355' }}>
                    incl. GST: {formatCurrency(expense.taxAmount)} ({expense.taxRate}%)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="exp-detail-body">
            {/* Tab Navigation */}
            <div className="exp-tab-bar no-print">
              <button 
                className={`exp-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`exp-tab ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                Payment Info
              </button>
              <button 
                className={`exp-tab ${activeTab === 'receipt' ? 'active' : ''}`}
                onClick={() => setActiveTab('receipt')}
              >
                Receipt
              </button>
              <button 
                className={`exp-tab ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div>
                {/* Description */}
                {expense.description && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Description</h3>
                    <p style={{ color: '#2C2A26', lineHeight: 1.6 }}>{expense.description}</p>
                  </div>
                )}

                {/* Project Info */}
                {expense.project && (
                  <Link to={`/builder/project/${expense.project._id}`} style={{ textDecoration: 'none' }}>
                    <div className="exp-info-item" style={{ marginBottom: 24 }}>
                      <div className="exp-info-icon">
                        <BuildingOfficeIcon style={{ width: 24, height: 24 }} />
                      </div>
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 2 }}>Related Project</div>
                        <div className="bld-sans" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1E1C18' }}>
                          {expense.project.name}
                        </div>
                        {expense.project.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <MapPinIcon style={{ width: 14, height: 14, color: '#8B7355' }} />
                            <span style={{ fontSize: '0.8rem', color: '#6B6355' }}>{expense.project.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

                {/* Additional Details Grid */}
                <div className="exp-meta-grid">
                  {expense.paymentReference && (
                    <div className="exp-meta-item">
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 4 }}>Reference</div>
                      <div style={{ fontWeight: 500 }}>{expense.paymentReference}</div>
                    </div>
                  )}
                  
                  {expense.tags && expense.tags.length > 0 && (
                    <div className="exp-meta-item">
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 4 }}>Tags</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {expense.tags.map((tag, i) => (
                          <span key={i} className="exp-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="exp-meta-item">
                    <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 4 }}>Created By</div>
                    <div>{expense.createdBy?.name || user?.name || '—'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8B7355', marginTop: 2 }}>
                      {formatDate(expense.createdAt)}
                    </div>
                  </div>

                  {expense.approvedBy && (
                    <div className="exp-meta-item">
                      <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355', marginBottom: 4 }}>Approved By</div>
                      <div>{expense.approvedBy.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8B7355', marginTop: 2 }}>
                        {formatDate(expense.approvedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info Tab */}
            {activeTab === 'payment' && (
              <div>
                <div className="exp-info-grid">
                  <div className="exp-info-item">
                    <div className="exp-info-icon">
                      {getPaymentMethodIcon(expense.paymentMethod)}
                    </div>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 2 }}>Payment Method</div>
                      <div className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600 }}>
                        {expense.paymentMethod?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '—'}
                      </div>
                    </div>
                  </div>

                  <div className="exp-info-item">
                    <div className="exp-info-icon">
                      <ReceiptPercentIcon style={{ width: 24, height: 24 }} />
                    </div>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 2 }}>Payment Status</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="exp-badge" style={{ background: status.bg, color: status.color }}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expense.paymentReference && (
                    <div className="exp-info-item">
                      <div className="exp-info-icon">
                        <DocumentTextIcon style={{ width: 24, height: 24 }} />
                      </div>
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 2 }}>Reference Number</div>
                        <div className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600 }}>{expense.paymentReference}</div>
                      </div>
                    </div>
                  )}

                  {expense.vendor && (
                    <div className="exp-info-item">
                      <div className="exp-info-icon">
                        <UserIcon style={{ width: 24, height: 24 }} />
                      </div>
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 2 }}>Vendor/Supplier</div>
                        <div className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600 }}>{expense.vendor}</div>
                      </div>
                    </div>
                  )}
                </div>

                {expense.isRecurring && (
                  <div style={{ marginTop: 24, padding: 16, background: '#F9F9F7', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <ClockIconOutline style={{ width: 20, height: 20, color: '#8B7355' }} />
                      <span style={{ fontWeight: 600 }}>Recurring Expense</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#2C2A26' }}>
                      This expense recurs {expense.recurringFrequency}. 
                      {expense.recurringEndDate && ` Ends on ${formatDate(expense.recurringEndDate)}`}
                    </p>
                  </div>
                )}
              </div>
            )}            

            {/* Receipt Tab */}
{activeTab === 'receipt' && (
  <div>
    {expense.receipt ? (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Receipt / Invoice</h3>
          
        </div>
        
        {/* Construct the full image URL */}
        {(() => {
          const baseURL = 'http://localhost:5050';
          const receiptUrl = expense.receipt.startsWith('http') 
            ? expense.receipt 
            : `${baseURL}${expense.receipt}`;
          
          console.log("Receipt URL:", receiptUrl); 
          
          return expense.receipt.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <div 
              className="exp-receipt-preview"
              onClick={() => setShowReceiptModal(true)}
            >
              <img 
                src={receiptUrl} 
                alt="Receipt" 
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
                onError={(e) => {
                  console.error("Failed to load image:", receiptUrl);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            </div>
          ) : (
            <div className="exp-receipt-preview">
              <FaFilePdf style={{ width: 64, height: 64, color: '#C4503C', marginBottom: 16 }} />
              <p style={{ marginBottom: 16 }}>PDF Receipt / Invoice</p>
              <a 
                href={receiptUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="exp-btn-primary"
                style={{ display: 'inline-flex' }}
              >
                <DocumentArrowUpIcon style={{ width: 16, height: 16 }} />
                Open PDF
              </a>
            </div>
          );
        })()}
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <DocumentIcon style={{ width: 60, height: 60, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
        <p style={{ color: '#8B7355' }}>No receipt uploaded</p>
      </div>
    )}
  </div>
)}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                {expense.notes ? (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Additional Notes</h3>
                    <div style={{ 
                      background: '#F9F9F7', 
                      padding: 24, 
                      borderRadius: 12,
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8
                    }}>
                      {expense.notes}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <DocumentTextIcon style={{ width: 60, height: 60, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
                    <p style={{ color: '#8B7355' }}>No notes added</p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="exp-divider" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Activity Timeline</h3>
              <div className="exp-timeline">
                <div className="exp-timeline-item">
                  <div style={{ fontSize: '0.8rem', color: '#8B7355', marginBottom: 4 }}>Created</div>
                  <div style={{ fontWeight: 500 }}>{formatDate(expense.createdAt)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6355' }}>by {expense.createdBy?.name || user?.name}</div>
                </div>
                
                {expense.updatedAt !== expense.createdAt && (
                  <div className="exp-timeline-item">
                    <div style={{ fontSize: '0.8rem', color: '#8B7355', marginBottom: 4 }}>Last Updated</div>
                    <div style={{ fontWeight: 500 }}>{formatDate(expense.updatedAt)}</div>
                  </div>
                )}

                {expense.status === 'paid' && expense.paidAt && (
                  <div className="exp-timeline-item">
                    <div style={{ fontSize: '0.8rem', color: '#8B7355', marginBottom: 4 }}>Payment Completed</div>
                    <div style={{ fontWeight: 500 }}>{formatDate(expense.paidAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Fullscreen Modal */}
      {showReceiptModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            cursor: 'pointer'
          }}
          onClick={() => setShowReceiptModal(false)}
        >
          <img 
            src={expense.receipt} 
            alt="Receipt full view" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal-overlay no-print" 
          onClick={() => setShowDeleteModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 16,
              maxWidth: 400,
              width: '100%',
              padding: 32,
              animation: 'slideUp 0.3s ease'
            }}
          >
            <h3 className="bld-serif" style={{ fontSize: '1.5rem', marginBottom: 16 }}>
              Delete <em style={{ color: '#C4503C' }}>Expense</em>
            </h3>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to delete <strong>{expense.title}</strong>?
            </p>
            <p style={{ fontSize: '0.8rem', color: '#C4503C', marginBottom: 24 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="exp-btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="exp-btn-primary exp-btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}