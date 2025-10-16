/**
 * MainLayout Component
 * Main application layout with header, sidebar, and content area
 */

import { Outlet, useLocation } from "react-router";
import { Link } from "react-router";
import { UserButton } from "@clerk/clerk-react";
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
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { ClinicSelector } from "../features/clinics/ClinicSelector";
import { useAuth } from "../hooks/useAuth";

/**
 * MainLayout component
 * Provides consistent layout for authenticated pages
 */
export function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDoctor, isClinicOwner, user } = useAuth();

  // Show clinic selector ONLY for clinic_owner role
  const canManageClinics = isClinicOwner();

  // Check if a nav item is active
  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Clinic Owner navigation (includes clinic management)
  const clinicOwnerNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Building2, label: "Clinics", path: "/clinics" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: FileText, label: "Prescriptions", path: "/prescriptions" },
    { icon: Pill, label: "Medications", path: "/meds" },
  ];

  // Doctor navigation (no clinic management)
  const doctorNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: FileText, label: "Prescriptions", path: "/prescriptions" },
    { icon: Pill, label: "Medications", path: "/meds" },
  ];

  // Patient navigation
  const patientNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "My Appointments", path: "/appointments" },
    { icon: FileText, label: "My Prescriptions", path: "/prescriptions" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  // Determine which nav items to show
  const navItems = isClinicOwner()
    ? clinicOwnerNavItems
    : isDoctor()
      ? doctorNavItems
      : patientNavItems;

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
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                Ocura360
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {canManageClinics && <ClinicSelector />}

            {/* Notification Icon Placeholder (Phase 2) */}
            <button
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Notifications (Coming soon)"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {/* Badge for notification count - will be dynamic in Phase 2 */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-white border-r border-gray-200 
            transform transition-all duration-200 ease-in-out z-30
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
            w-64
          `}
        >
          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 shadow-sm"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <nav className="p-4 space-y-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      active
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }
                    ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}
                  `}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <item.icon
                    className={`w-5 h-5 ${active ? "text-blue-600" : ""} flex-shrink-0`}
                  />
                  <span
                    className={`font-medium ${sidebarCollapsed ? "lg:hidden" : ""}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
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
