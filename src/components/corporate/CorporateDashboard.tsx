
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CorporateNavigation from './CorporateNavigation';
import CorporateDashboardHome from './CorporateDashboardHome';
import EmployeeManagement from './EmployeeManagement';
import VehiclePreferences from './VehiclePreferences';
import RequestBooking from './RequestBooking';
import BookingApproval from './BookingApproval';
import CalendarView from './CalendarView';
import AgreementForm from './AgreementForm';

const CorporateDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <CorporateNavigation />
      </div>
      
      <Routes>
        <Route index element={<CorporateDashboardHome />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="vehicle-preferences" element={<VehiclePreferences />} />
        <Route path="request-booking" element={<RequestBooking />} />
        <Route path="booking-approval" element={<BookingApproval />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="agreements" element={<AgreementForm />} />
      </Routes>
    </div>
  );
};

export default CorporateDashboard;
