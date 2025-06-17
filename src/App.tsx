
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
import VehiclesPage from "@/components/vehicles/VehiclesPage";
import VendorsPage from "@/components/vendors/VendorsPage";
import BookingsPage from "@/components/bookings/BookingsPage";
import TripsPage from "@/components/trips/TripsPage";
import InvoicesPage from "@/components/invoices/InvoicesPage";
import FeedbackPage from "@/components/feedback/FeedbackPage";
import ReportsPage from "@/components/reports/ReportsPage";

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
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="trips" element={<TripsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
