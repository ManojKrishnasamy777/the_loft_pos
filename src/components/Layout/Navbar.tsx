import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Film } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', permission: { resource: 'dashboard', action: 'read' } },
    { path: '/pos', label: 'POS', permission: { resource: 'pos', action: 'read' } },
    { path: '/orders', label: 'Orders', permission: { resource: 'orders', action: 'read' } },
    { path: '/menu', label: 'Menu', permission: { resource: 'menu', action: 'read' } },
    { path: '/customers', label: 'Customers', permission: { resource: 'customers', action: 'read' } },
    { path: '/reports', label: 'Reports', permission: { resource: 'reports', action: 'read' } },
    { path: '/settings', label: 'Settings', permission: { resource: 'settings', action: 'read' } },
  ];

  const { hasPermission } = useAuth();

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-amber-400" />
              <span className="text-xl font-bold text-white">The Loft POS</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                hasPermission(link.permission.resource, link.permission.action) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm">
              Welcome, {user?.name}
            </span>
            <span className="bg-amber-600 text-white px-2 py-1 rounded-full text-xs">
              {user?.role.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              hasPermission(link.permission.resource, link.permission.action) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}