import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Car,
  Building2,
  Calendar,
  MapPin,
  FileText,
  MessageSquare,
  BarChart3,
  Book,
  Shield,
  KeyRound,
  IdCard,
} from 'lucide-react';

type SidebarProps = {
  collapsed?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const { isAdmin, isVendor, isDriver, isRider } = useAuth();

  // Common items
  const commonItems = [{ name: 'Dashboard', href: '/dashboard', icon: Home }];

  const adminItems = [
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Car },
    { name: 'Vehicle Types', href: '/dashboard/vehicle-types', icon: Car },
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
    { name: 'Vehicle Types', href: '/dashboard/vehicle-types', icon: Car },
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

  const riderItems = [
    { name: 'My Trips', href: '/dashboard/trips', icon: MapPin },
    { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
  ];

  const accountGroup = {
    name: 'My Account',
    items: [
      { name: 'Profile', href: '/dashboard/profile', icon: IdCard },
      { name: 'Change Password', href: '/dashboard/change-password', icon: KeyRound },
      { name: 'Address Book', href: '/dashboard/address-book', icon: Book },
    ],
  };

  // Merge according to role
  let navigation = [...commonItems];
  if (isAdmin) navigation = [...navigation, ...adminItems];
  else if (isVendor) navigation = [...vendorItems];
  else if (isDriver) navigation = [...driverItems];
  else if (isRider) navigation = [...riderItems];

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 h-screen sticky top-0 flex-shrink-0 transition-all duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-gray-200',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600" />
          {!collapsed && <span className="text-lg font-semibold">doTrip</span>}
        </div>
      </div>

      {/* Nav */}
      <nav className="py-3">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              title={item.name}
              className={cn(
                'group relative flex items-center rounded-md px-3 py-2 mx-2 my-1 text-sm font-medium hover:bg-gray-100 focus:outline-none',
                isActive ? 'text-blue-600 bg-blue-50 hover:bg-blue-50' : 'text-gray-700',
                collapsed ? 'justify-center' : ''
              )}
            >
              <Icon className={cn('h-5 w-5 flex-none', collapsed ? '' : 'mr-3')} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        {/* Account group */}
        <div className="mt-3">
          <div
            className={cn(
              'px-3 text-xs font-semibold uppercase tracking-wide text-gray-500',
              collapsed ? 'sr-only' : ''
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              {accountGroup.name}
            </span>
          </div>
          <div className={cn('mt-1 space-y-1', collapsed ? '' : 'ml-1')}>
            {accountGroup.items.map((sub) => {
              const isActive = location.pathname === sub.href;
              const Icon = sub.icon;
              return (
                <Link
                  key={sub.name}
                  to={sub.href}
                  title={sub.name}
                  className={cn(
                    'group relative flex items-center rounded-md px-3 py-2 mx-2 text-sm hover:bg-gray-100',
                    isActive ? 'text-blue-600 bg-blue-50 hover:bg-blue-50' : 'text-gray-700',
                    collapsed ? 'justify-center' : ''
                  )}
                >
                  <Icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
                  {!collapsed && <span className="truncate">{sub.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
