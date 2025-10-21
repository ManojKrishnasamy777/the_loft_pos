import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Film, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
              <Film className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
              <span className="text-base sm:text-xl font-bold text-white hidden xs:inline">The Loft POS</span>
            </Link>

            <div className="hidden md:flex space-x-2 lg:space-x-6">
              {navLinks.map((link) => (
                hasPermission(link.permission.resource, link.permission.action) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-gray-300 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                {user?.name}
              </span>
              <span className="bg-amber-600 text-white px-2 py-1 rounded-full text-xs">
                {user?.role.name}
              </span>
            </div>
            <button
              onClick={logout}
              className="hidden sm:flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                hasPermission(link.permission.resource, link.permission.action) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
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

              {/* Mobile user info and logout */}
              <div className="border-t border-gray-700 mt-2 pt-2 space-y-2">
                <div className="px-3 py-2 text-gray-300 text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.role.name}</div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}