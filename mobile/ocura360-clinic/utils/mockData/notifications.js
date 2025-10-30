/**
 * Mock Notifications Data
 * 10+ notifications including invitations
 */

export const MOCK_NOTIFICATIONS = [
  {
    _id: 'n1',
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    message: 'You have an appointment with John Doe in 30 minutes',
    data: { appointmentId: 'apt1' },
    read: false,
    createdAt: '2024-03-20T08:30:00Z',
  },
  {
    _id: 'n2',
    type: 'staff_invitation',
    title: 'Staff Invitation',
    message: 'You have been invited to join Downtown Health Center as staff',
    data: { 
      clinicId: 'clinic2',
      clinicName: 'Downtown Health Center',
      role: 'staff',
      invitedBy: 'Dr. Sarah Smith',
    },
    read: false,
    createdAt: '2024-03-19T14:20:00Z',
  },
  {
    _id: 'n3',
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: 'Karen Walker cancelled their appointment scheduled for Mar 14',
    data: { appointmentId: 'apt16' },
    read: true,
    createdAt: '2024-03-14T09:00:00Z',
  },
  {
    _id: 'n4',
    type: 'new_appointment',
    title: 'New Appointment',
    message: 'New appointment booked: James Taylor on Mar 22 at 11:00 AM',
    data: { appointmentId: 'apt9' },
    read: true,
    createdAt: '2024-03-20T10:15:00Z',
  },
  {
    _id: 'n5',
    type: 'subscription_expiring',
    title: 'Subscription Expiring Soon',
    message: 'Your subscription for Downtown Health Center expires in 7 days',
    data: { clinicId: 'clinic2' },
    read: false,
    createdAt: '2024-03-13T09:00:00Z',
  },
  {
    _id: 'n6',
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    message: 'Upcoming appointment with Emily Davis tomorrow at 9:00 AM',
    data: { appointmentId: 'apt4' },
    read: true,
    createdAt: '2024-03-20T18:00:00Z',
  },
  {
    _id: 'n7',
    type: 'prescription_ready',
    title: 'Prescription Ready',
    message: 'Prescription for Jane Smith is ready for review',
    data: { prescriptionId: 'rx1' },
    read: true,
    createdAt: '2024-03-20T11:30:00Z',
  },
  {
    _id: 'n8',
    type: 'staff_invitation',
    title: 'Doctor Invitation',
    message: 'You have been invited to join Family Care Clinic as a doctor',
    data: { 
      clinicId: 'clinic3',
      clinicName: 'Family Care Clinic',
      role: 'doctor',
      invitedBy: 'Dr. Michael Davis',
    },
    read: false,
    createdAt: '2024-03-18T16:45:00Z',
  },
  {
    _id: 'n9',
    type: 'appointment_confirmed',
    title: 'Appointment Confirmed',
    message: 'Robert Wilson confirmed their appointment for Mar 21',
    data: { appointmentId: 'apt5' },
    read: true,
    createdAt: '2024-03-19T13:20:00Z',
  },
  {
    _id: 'n10',
    type: 'system',
    title: 'System Update',
    message: 'New features added: Enhanced prescription management',
    data: {},
    read: true,
    createdAt: '2024-03-15T08:00:00Z',
  },
];

/**
 * Get unread notifications count
 */
export const getUnreadCount = () => {
  return MOCK_NOTIFICATIONS.filter(n => !n.read).length;
};

/**
 * Get notifications by type
 */
export const getNotificationsByType = (type) => {
  return MOCK_NOTIFICATIONS.filter(n => n.type === type);
};

/**
 * Get pending invitations
 */
export const getPendingInvitations = () => {
  return MOCK_NOTIFICATIONS.filter(n => 
    n.type === 'staff_invitation' && !n.read
  );
};
