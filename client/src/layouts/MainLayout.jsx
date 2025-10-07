/**
 * MainLayout Component
 * Main application layout with header, sidebar, and content area
 */

import { Outlet } from 'react-router';
import { Link } from 'react-router';
import { UserButton } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Building2,
  Pill,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ClinicSelector } from '../features/clinics/ClinicSelector';
import { useAuth } from '../hooks/useAuth';

/**
 * MainLayout component
 * Provides consistent layout for authenticated pages
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDoctor } = useAuth();
  
  const doctorNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: FileText, label: 'Prescriptions', path: '/prescriptions' },
    { icon: Pill, label: 'Medications', path: '/meds' },
    { icon: Building2, label: 'Clinics', path: '/clinics' },
  ];
  
  const patientNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'My Appointments', path: '/appointments' },
    { icon: FileText, label: 'My Prescriptions', path: '/prescriptions' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];
  
  const navItems = isDoctor() ? doctorNavItems : patientNavItems;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                ProDigital Doctor
              </span>
            </Link>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            {isDoctor() && <ClinicSelector />}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-200 ease-in-out z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <main id="main-content" className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
