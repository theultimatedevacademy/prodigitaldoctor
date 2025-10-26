/**
 * Role-based navigation and permission configuration
 */

export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'LayoutDashboard',
  },
  {
    name: 'Appointments',
    path: '/appointments',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'Calendar',
  },
  {
    name: 'Patients',
    path: '/patients',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'Users',
  },
  {
    name: 'Prescriptions',
    path: '/prescriptions',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'FileText',
  },
  {
    name: 'Medications',
    path: '/meds',
    roles: ['clinic_owner', 'doctor'], // Staff cannot access
    icon: 'Pill',
  },
  {
    name: 'Staff Management',
    path: '/staff',
    roles: ['clinic_owner'], // Only owners
    icon: 'UserCog',
  },
  {
    name: 'Clinic Settings',
    path: '/clinics/settings',
    roles: ['clinic_owner'], // Only owners
    icon: 'Settings',
  },
  // TODO: Create Analytics page
  // {
  //   name: 'Analytics',
  //   path: '/analytics',
  //   roles: ['clinic_owner'], // Only owners
  //   icon: 'BarChart3',
  // },
];

/**
 * Check if user role has access to a specific nav item
 * @param {string} userRole - User's role in current clinic
 * @param {object} navItem - Navigation item to check
 * @returns {boolean} True if user has access
 */
export function hasNavAccess(userRole, navItem) {
  if (!userRole || !navItem.roles) return false;
  return navItem.roles.includes(userRole);
}

/**
 * Filter nav items based on user role
 * @param {string} userRole - User's role in current clinic
 * @returns {array} Filtered nav items
 */
export function getFilteredNavItems(userRole) {
  if (!userRole) return [];
  return NAV_ITEMS.filter((item) => hasNavAccess(userRole, item));
}

/**
 * Permission checks
 */
export const PERMISSIONS = {
  canCreatePrescription: (role) => ['clinic_owner', 'doctor'].includes(role),
  canEditPrescription: (role) => ['clinic_owner', 'doctor'].includes(role),
  canViewAllAppointments: (role) => ['clinic_owner', 'staff'].includes(role),
  canEditAllAppointments: (role) => ['clinic_owner', 'staff'].includes(role),
  canViewAllPatients: (role) => ['clinic_owner', 'staff'].includes(role),
  canEditAllPatients: (role) => ['clinic_owner', 'staff'].includes(role),
  canAccessMedications: (role) => ['clinic_owner', 'doctor'].includes(role),
  canManageStaff: (role) => role === 'clinic_owner',
  canManageClinic: (role) => role === 'clinic_owner',
  canViewAnalytics: (role) => role === 'clinic_owner',
};
