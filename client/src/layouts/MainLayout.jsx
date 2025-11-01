/**
 * MainLayout Component
 * Main application layout with header, sidebar, and content area
 */

import { Outlet, useLocation } from "react-router";
import logo from "../assets/logo.svg";
import { Link } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Building2,
  Pill,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserCog,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { ClinicSelector } from "../features/clinics/ClinicSelector";
import { NotificationBell } from "../components/notifications/NotificationBell";
import { SubscriptionBanner } from "../components/subscription/SubscriptionBanner";
import { useAuth } from "../hooks/useAuth";
import { useClinicContext } from "../contexts/ClinicContext";
import { getFilteredNavItems } from "../utils/roleConfig";

/**
 * MainLayout component
 * Provides consistent layout for authenticated pages
 */
// Icon mapping for nav items
const iconMap = {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Pill,
  BarChart3,
  UserCog,
  Settings,
};

export function MainLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { userClinicRole, isLoading: isClinicLoading } = useClinicContext();

  // Check if a nav item is active
  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Get filtered nav items based on user's role in current clinic
  // Handle loading state - show basic nav items during load
  const navItemsConfig = isClinicLoading
    ? []
    : getFilteredNavItems(userClinicRole);

  // Map icons to nav items
  const navItems = navItemsConfig.map((item) => ({
    ...item,
    icon: iconMap[item.icon] || LayoutDashboard,
    label: item.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Subscription Banner */}
      <SubscriptionBanner />

      {/* Top Header */}
      <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-40">
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

            {/* Logo - Hidden on mobile */}
            <Link to="/dashboard" className="hidden sm:flex items-center gap-2">
              <img src={logo} alt="Ocura360" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Clinic Selector - Show for all users with clinics */}
            <ClinicSelector />

            {/* Notification Bell */}
            <NotificationBell />

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Collapse Toggle Button (Desktop only) - Outside sidebar for proper z-index */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`hidden lg:flex fixed top-[81px] w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 shadow-sm z-40 transition-all duration-200 ${
            sidebarCollapsed ? "left-[68px]" : "left-[244px]"
          }`}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Sidebar */}
        <aside
          className={`no-print
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-white border-r border-gray-200 
            transform transition-all duration-200 ease-in-out z-30 overflow-y-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
            w-64
          `}
        >
          <nav className="p-4 pt-6 space-y-1" aria-label="Main navigation">
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main id="main-content" className="flex-1 p-6 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
