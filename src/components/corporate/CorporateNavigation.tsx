
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, Car, Calendar, CheckSquare, CalendarDays, Home } from 'lucide-react';

const tabs = [
  { name: 'Dashboard', href: '/dashboard/corporate', icon: Home },
  { name: 'Employees', href: '/dashboard/corporate/employees', icon: Users },
  { name: 'Vehicle Preferences', href: '/dashboard/corporate/vehicle-preferences', icon: Car },
  { name: 'Request Booking', href: '/dashboard/corporate/request-booking', icon: Calendar },
  { name: 'Booking Approval', href: '/dashboard/corporate/booking-approval', icon: CheckSquare },
  { name: 'Calendar View', href: '/dashboard/corporate/calendar', icon: CalendarDays },
];

const CorporateNavigation = () => {
  const location = useLocation();

  return (
    <nav className="flex space-x-8 px-6 py-4">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.href;
        return (
          <Link
            key={tab.name}
            to={tab.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default CorporateNavigation;
