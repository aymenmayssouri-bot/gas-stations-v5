// src/components/layout/Navbar.tsx
'use client';

import { User } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { useApiUsage } from '@/hooks/useApiUsage';

interface NavbarProps {
  user: User | null;
  onLogout: () => Promise<void>;
  onMenuClick: () => void;
}

export default function Navbar({ user, onLogout, onMenuClick }: NavbarProps) {
  const { usage, loading } = useApiUsage();

  const getUsageColor = (percentage: number) => {
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-4"
            onClick={onMenuClick}
          >
            ☰
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">Direction Régionale de Marrakech</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* API Usage Display */}
          <div className="flex flex-col items-end space-y-1">
            <span className="text-gray-600 text-sm">{user?.email}</span>
            
            {!loading && usage && (
              <div className="flex flex-col text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Maps:</span>
                  <span className={`font-semibold ${getUsageColor(usage.maps.percentage)}`}>
                    {usage.maps.remaining.toLocaleString()} / {usage.maps.limit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Distance:</span> {/* Or change to "Routes:" */}
                  <span className={`font-semibold ${getUsageColor(usage.routes.percentage)}`}>
                    {usage.routes.remaining.toLocaleString()} / {usage.routes.limit.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}