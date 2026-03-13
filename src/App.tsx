import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

import LoginPage from "@/pages/LoginPage";
import Index from "@/pages/Index";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClients from "@/pages/admin/AdminClients";
import AdminUnits from "@/pages/admin/AdminUnits";
import AdminBills from "@/pages/admin/AdminBills";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminManagement from "@/pages/admin/AdminManagement";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminWhatsApp from "@/pages/admin/AdminWhatsApp";

import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientBills from "@/pages/client/ClientBills";
import ClientSettings from "@/pages/client/ClientSettings";

import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

function HomeRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="solcontrole-theme" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<HomeRedirect />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminClients /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/units" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminUnits /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/bills" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminBills /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminPayments /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminSettings /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/whatsapp" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminWhatsApp /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/management" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminManagement /></AppLayout></ProtectedRoute>} />

              {/* Client routes */}
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="client"><AppLayout><ClientDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/bills" element={<ProtectedRoute requiredRole="client"><AppLayout><ClientBills /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute requiredRole="client"><AppLayout><ClientSettings /></AppLayout></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;