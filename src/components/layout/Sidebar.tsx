import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

import {
  Car,
  Users,
  Building2,
  Calendar,
  MapPin,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Home
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isVendor, isDriver } = useAuth();

  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
  ];

  const adminItems = [
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
    { name: 'Vendors', href: '/dashboard/vendors', icon: Building2 },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Trips', href: '/dashboard/trips', icon: MapPin },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Corporate', href: '/dashboard/corporate', icon: Building2 },
  ];

  const vendorItems = [
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Trips', href: '/dashboard/trips', icon: MapPin },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
    { name: 'Earnings', href: '/dashboard/earnings', icon: BarChart3 },
  ];

  const driverItems = [
    { name: 'My Vehicle', href: '/dashboard/vehicles', icon: Car },
    { name: 'My Trips', href: '/dashboard/trips', icon: MapPin },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
    { name: 'Earnings', href: '/dashboard/earnings', icon: BarChart3 },
  ];

  let navigation = [...commonItems];
  if (isAdmin) navigation = [...navigation, ...adminItems];
  else if (isVendor) navigation = [...navigation, ...vendorItems];
  else if (isDriver) navigation = [...navigation, ...driverItems];

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <Car className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">TripFlow</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
