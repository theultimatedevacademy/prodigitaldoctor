import { Link } from 'react-router';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { ClinicSelector } from "../features/clinics/ClinicSelector";
import { Building2, Users, Calendar, FileText, BarChart3 } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              ProDigitalDoctor
            </h1>
          </Link>

          {/* Center - Navigation (only when signed in) */}
          <SignedIn>
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink to="/dashboard" icon={<BarChart3 className="w-4 h-4" />}>
                Dashboard
              </NavLink>
              <NavLink to="/patients" icon={<Users className="w-4 h-4" />}>
                Patients
              </NavLink>
              <NavLink to="/appointments" icon={<Calendar className="w-4 h-4" />}>
                Appointments
              </NavLink>
              <NavLink to="/prescriptions" icon={<FileText className="w-4 h-4" />}>
                Prescriptions
              </NavLink>
              <NavLink to="/clinics" icon={<Building2 className="w-4 h-4" />}>
                Clinics
              </NavLink>
            </nav>
          </SignedIn>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors hidden sm:block">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <ClinicSelector />
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

function NavLink({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

export default Header;
