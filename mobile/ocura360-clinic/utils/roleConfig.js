/**
 * Role-based navigation and permission configuration
 */

export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: 'Dashboard',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'LayoutDashboard',
  },
  {
    name: 'Appointments',
    path: 'Appointments',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'Calendar',
  },
  {
    name: 'Patients',
    path: 'Patients',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'Users',
  },
  {
    name: 'Prescriptions',
    path: 'Prescriptions',
    roles: ['clinic_owner', 'doctor', 'staff'],
    icon: 'FileText',
  },
  {
    name: 'Medications',
    path: 'Medications',
    roles: ['clinic_owner', 'doctor'], // Staff cannot access
    icon: 'Pill',
  },
  {
    name: 'Staff',
    path: 'Staff',
    roles: ['clinic_owner'], // Only owners
    icon: 'UserCog',
  },
  {
    name: 'Settings',
    path: 'Settings',
    roles: ['clinic_owner'], // Only owners
    icon: 'Settings',
  },
];

/**
 * Check if user role has access to a specific nav item
 */
export function hasNavAccess(userRole, navItem) {
  if (!userRole || !navItem.roles) return false;
  return navItem.roles.includes(userRole);
}

/**
 * Filter nav items based on user role
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
