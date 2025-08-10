import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, LogOut, User, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

type HeaderProps = {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, signOut } = useAuth();

  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : undefined;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isVendor = role === 'VENDOR';

  const getInitials = (email: string) => (email?.substring(0, 2) || 'U').toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        {/* Collapse / expand button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mr-3 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        {isVendor && <h1 className="text-xl font-semibold text-gray-900">Vendor Dashboard</h1>}
        {isAdmin && <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>}
        {!isAdmin && !isVendor && <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.email || '')}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex items-center gap-2">
              <User className="h-4 w-4" /> {user?.email || 'User'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
