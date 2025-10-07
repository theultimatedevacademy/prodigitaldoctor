/**
 * Test Users Data
 * Contains 5 test users with different roles for development and testing
 */

const testUsers = [
  {
    clerkId: "user_patient_test_001",
    roles: ["patient"],
    name: "John Patient",
    email: "patient@test.com",
    phone: "+91-9876543210",
    profilePhotoUrl: null,
  },
  {
    clerkId: "user_staff_test_002",
    roles: ["assistant"],
    name: "Sarah Assistant",
    email: "assistant@test.com",
    phone: "+91-9876543211",
    profilePhotoUrl: null,
  },
  {
    clerkId: "user_doctor_test_003",
    roles: ["doctor"],
    name: "Dr. Rajesh Kumar",
    email: "doctor@test.com",
    phone: "+91-9876543212",
    profilePhotoUrl: null,
    qualifications: "MBBS, MD (Medicine)",
    specializations: ["General Medicine", "Internal Medicine"],
    hprId: "HPR-DOC-12345678",
  },
  {
    clerkId: "user_doctor_owner_test_004",
    roles: ["doctor", "clinic_owner"],
    name: "Dr. Priya Sharma",
    email: "doctor.owner@test.com",
    phone: "+91-9876543213",
    profilePhotoUrl: null,
    qualifications: "MBBS, MS (Surgery), FACS",
    specializations: ["General Surgery", "Laparoscopic Surgery"],
    hprId: "HPR-DOC-87654321",
  },
  {
    clerkId: "user_admin_test_005",
    roles: ["admin"],
    name: "Admin User",
    email: "admin@test.com",
    phone: "+91-9876543214",
    profilePhotoUrl: null,
  },
];

export default testUsers;