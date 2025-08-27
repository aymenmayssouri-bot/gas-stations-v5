
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Gas Stations', href: '/stations', icon: '⛽' },
    { name: 'Reports', href: '/reports', icon: '📈' },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition duration-300 ease-in-out
        lg:static lg:inset-0 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="text-xl font-semibold text-gray-800">Gas Station Manager</div>
          <button 
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900
                ${pathname === item.href ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''}
              `}
              onClick={() => setOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}