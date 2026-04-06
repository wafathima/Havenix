import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { Toaster } from "react-hot-toast";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Home from "./pages/Public/Home";
import Purpose from "./pages/Public/Purpose";
import Properties from "./pages/Public/Properties";
import PropertyDetails from "./pages/Public/PropertyDetails";
import Settings from "./pages/user/Settings";


// Auth Pages 
import BuyerLogin from "./pages/auth/buyer/BuyerLogin";
import BuyerRegister from "./pages/auth/buyer/BuyerRegister";
import SellerLogin from "./pages/auth/seller/SellerLogin";
import SellerRegister from "./pages/auth/seller/SellerRegister";
import BuilderLogin from "./pages/auth/builder/BuilderLogin";
import BuilderRegister from "./pages/auth/builder/BuilderRegister";

// User Pages
import Profile from "./pages/user/Profile";
import Contact from "./pages/user/Contact";
import BuyerDashboard from "./pages/user/buyer/BuyerDashboard";
import SellerDashboard from "./pages/user/seller/SellerDashboard";
import BuilderDashboard from "./pages/user/builder/BuilderDashboard";
import EditProperty from "./pages/user/builder/EditProperty";
import AddProject from "./pages/user/builder/AddProject";
import ProjectDetails from "./pages/user/builder/ProjectDetails";
import ExpenseDetails from "./pages/user/builder/ExpenseDetails";
import EditExpense from "./pages/user/builder/EditExpense";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/user/Notifications"; 
import { SocketProvider } from "./context/SocketContext"; 
import AddProperty from "./pages/user/builder/AddProperty";
import EditPurchasedProperty from "./pages/user/seller/EditPurchasedProperty";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ManageUsers from "./pages/admin/ManageUsers"; 
import UserDetails from './pages/admin/UserDetails';
import ManageProperties from './pages/admin/ManageProperties';
import AdminPropertyDetails from "./pages/admin/AdminPropertyDetails";
import ManageProjects from "./pages/admin/ManageProjects";
import AdminProjectDetails from "./pages/admin/AdminProjectDetails";

function App() {

  return (
    <BrowserRouter>
      <AdminProvider>
        <AuthProvider>
           <SocketProvider>
          <Toaster position="top-right" />

          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>

            
            {/* Role-Specific Login Pages */}
            <Route path="/login/buyer" element={<BuyerLogin />} />
            <Route path="/login/seller" element={<SellerLogin />} />
            <Route path="/login/builder" element={<BuilderLogin />} />

            
            {/* Role-Specific Register Pages */}
            <Route path="/register/buyer" element={<BuyerRegister />} />
            <Route path="/register/seller" element={<SellerRegister />} />
            <Route path="/register/builder" element={<BuilderRegister />} />
            
            <Route path="/purpose" element={<Purpose />} />

            {/* ================= ADMIN ROUTES ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />

                 <Route path="/admin/login" element={<AdminLogin />} />

                 <Route
                 path="/admin"
                 element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                  }
                 >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="users/:userId" element={<UserDetails />} />
                  <Route path="properties" element={<ManageProperties />} />
                  <Route path="properties/:propertyId" element={<AdminPropertyDetails />} />
                  <Route path="projects" element={<ManageProjects />} />
                  <Route path="projects/:projectId" element={<AdminProjectDetails />} />

                  </Route>

            {/* Protected Routes - Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Profile />} />
            </Route>

            {/* Properties*/}
            <Route
              path="/properties"
              element={
                  <MainLayout />
              }
            >
              <Route index element={<Properties />} />
            </Route>

             <Route
              path="/property/:id"
              element={
                  <MainLayout />
              }
            >
              <Route index element={<PropertyDetails />} />
            </Route>

            {/* Contact Page */}
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Contact />} />
            </Route>

            {/* BUYER Dashboard */}
            <Route
              path="/buyer"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BuyerDashboard />} />
              <Route path="dashboard" element={<BuyerDashboard />} />
            </Route>

            {/* SELLER Dashboard */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute requiredRole="seller">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SellerDashboard />} />
              <Route path="dashboard" element={<SellerDashboard />} />
            </Route>

            <Route path="/seller/edit-purchased-property/:id" element={<EditPurchasedProperty />} />


            <Route
             path="/builder/add-project" 
             element={
                <ProtectedRoute requiredRole="builder">
                   <MainLayout />
                </ProtectedRoute>
              }>

            <Route index element={<AddProject />} />
            </Route>

              <Route 
              path="/builder" 
              element={
                   <ProtectedRoute requiredRole="builder">
                     <MainLayout />
                   </ProtectedRoute>
               }>
            <Route index element={<BuilderDashboard />} />
             <Route path="dashboard" element={<BuilderDashboard />} />
              </Route>
              <Route path="/builder/expense/:id" element={<ExpenseDetails />} />
                <Route path="/builder/edit-expense/:id" element={<EditExpense />} />
                
            {/* Notifications Page */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Notifications />} />
            </Route>


            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout />
                 </ProtectedRoute>
              }
            >
              <Route index element={<Settings />} />
            </Route>

            <Route path="/builder/project/:id" element={<ProjectDetails />} />

  <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

<Route
  path="/builder/add-property"
  element={
    <ProtectedRoute requiredRole="builder">
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AddProperty />} />
</Route>

<Route 
  path="/builder/edit-property/:id" 
  element={
    <ProtectedRoute requiredRole="builder">
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<EditProperty />} />
</Route>
          </Routes>
          </SocketProvider>
        </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
