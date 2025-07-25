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
import CorporateDashboard from "@/components/corporate/CorporateDashboard";

// ✅ NEW ROLE-BASED VEHICLE PAGES
import AdminVehiclesPage from "@/pages/admin/VehiclesPage";
import VendorVehiclesPage from "@/pages/vendor/VehiclesPage";
import DriverVehiclesPage from "@/pages/driver/VehiclesPage";
import ViewBooking from "@/components/bookings/ViewBooking";
import TrackTripPage from '@/pages/trips/TrackTripPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* ✅ ADMIN DASHBOARD ROUTES */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/view" element={<ViewBooking />} />
              <Route path="trips" element={<TripsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="corporate/*" element={<CorporateDashboard />} />

            </Route>
              {/* ✅ Standalone full-screen route for tracking */}
              <Route path="/trips/track" element={<TrackTripPage />} />
              
            {/* ✅ NEW: ROLE-SPECIFIC VEHICLE PAGES */}
            <Route
              path="/admin/vehicles"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminVehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/vehicles"
              element={
                <ProtectedRoute requireVendor={true}>
                  <VendorVehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/vehicles"
              element={
                <ProtectedRoute requireDriver={true}>
                  <DriverVehiclesPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
