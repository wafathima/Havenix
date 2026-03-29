import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AdminContext);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-600">Loading...</div>
    </div>;
  }
  
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;