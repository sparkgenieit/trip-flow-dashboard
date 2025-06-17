
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DriversPage from "@/components/drivers/DriversPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="vehicles" element={<div>Vehicles Page (Coming Soon)</div>} />
              <Route path="vendors" element={<div>Vendors Page (Coming Soon)</div>} />
              <Route path="bookings" element={<div>Bookings Page (Coming Soon)</div>} />
              <Route path="trips" element={<div>Trips Page (Coming Soon)</div>} />
              <Route path="invoices" element={<div>Invoices Page (Coming Soon)</div>} />
              <Route path="feedback" element={<div>Feedback Page (Coming Soon)</div>} />
              <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
