
'use client';

import { User } from 'firebase/auth';
import  Button  from '@/components/ui/Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => Promise<void>;
  onMenuClick: () => void;
}

export default function Navbar({ user, onLogout, onMenuClick }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button 
            className="lg:hidden mr-4"
            onClick={onMenuClick}
          >
            ☰
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{user?.email}</span>
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}