/**
 * ClinicDetailPage Component
 * View and edit clinic details, manage staff, view analytics
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { 
  Building2, Edit2, Users, Mail, Phone, MapPin, 
  Clock, UserPlus, Trash2, BarChart3, ArrowLeft 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Modal, ConfirmationModal } from '../components/ui/Modal';
import { useClinic, useUpdateClinic, useRemoveStaff } from '../api/hooks/useClinics';
import { toast } from 'react-toastify';

const ClinicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: clinic, isLoading } = useClinic(id);
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();
  const { mutate: removeStaff, isPending: isRemoving } = useRemoveStaff();

  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [formData, setFormData] = useState({});

  // Initialize form data when clinic loads
  useState(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || '',
        address: clinic.address || { line1: '', line2: '', city: '', state: '', pin: '' },
        contact: clinic.contact || { phone: '', email: '' },
      });
    }
  }, [clinic]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Clinic not found</p>
            <Link to="/clinics">
              <Button variant="outline" className="mt-4">
                Back to Clinics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    updateClinic(
      { clinicId: id, data: formData },
      {
        onSuccess: () => {
          toast.success('Clinic updated successfully');
          setIsEditing(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update clinic');
        },
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/clinics')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clinics
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              {clinic.name}
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {clinic.address?.line1}, {clinic.address?.city}
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} loading={isUpdating}>
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <TabButton
            active={activeTab === 'details'}
            onClick={() => setActiveTab('details')}
            icon={<Building2 className="w-4 h-4" />}
          >
            Details
          </TabButton>
          <TabButton
            active={activeTab === 'staff'}
            onClick={() => setActiveTab('staff')}
            icon={<Users className="w-4 h-4" />}
          >
            Staff ({clinic.staff?.length || 0})
          </TabButton>
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Analytics
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <DetailsTab
          clinic={clinic}
          formData={formData}
          isEditing={isEditing}
          onChange={handleChange}
        />
      )}

      {activeTab === 'staff' && (
        <StaffTab
          clinic={clinic}
          onInvite={() => setShowInviteModal(true)}
          onRemove={(member) => {
            setStaffToRemove(member);
            setShowRemoveConfirm(true);
          }}
        />
      )}

      {activeTab === 'analytics' && <AnalyticsTab clinicId={id} />}

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <InviteStaffModal
          clinicId={id}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Remove Staff Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setStaffToRemove(null);
        }}
        onConfirm={() => {
          if (!staffToRemove) return;
          removeStaff(
            {
              clinicId: id,
              staffUserId: staffToRemove.user._id,
            },
            {
              onSuccess: () => {
                toast.success('Staff member removed successfully');
                setShowRemoveConfirm(false);
                setStaffToRemove(null);
              },
              onError: (error) => {
                toast.error(error.data?.error || error.message || 'Failed to remove staff member');
              },
            }
          );
        }}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToRemove?.user?.name} from your clinic? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
};

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600 font-medium'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function DetailsTab({ clinic, formData, isEditing, onChange }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Clinic Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                />
                <Input
                  label="Phone"
                  name="contact.phone"
                  value={formData.contact?.phone || ''}
                  onChange={onChange}
                />
                <Input
                  label="Email"
                  name="contact.email"
                  value={formData.contact?.email || ''}
                  onChange={onChange}
                />
              </>
            ) : (
              <>
                <InfoRow icon={<Building2 />} label="Name" value={clinic.name} />
                <InfoRow icon={<Phone />} label="Phone" value={clinic.contact?.phone} />
                <InfoRow icon={<Mail />} label="Email" value={clinic.contact?.email} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Address Line 1"
                name="address.line1"
                value={formData.address?.line1 || ''}
                onChange={onChange}
              />
              <Input
                label="Address Line 2"
                name="address.line2"
                value={formData.address?.line2 || ''}
                onChange={onChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="address.city"
                  value={formData.address?.city || ''}
                  onChange={onChange}
                />
                <Input
                  label="State"
                  name="address.state"
                  value={formData.address?.state || ''}
                  onChange={onChange}
                />
              </div>
              <Input
                label="PIN Code"
                name="address.pin"
                value={formData.address?.pin || ''}
                onChange={onChange}
              />
            </div>
          ) : (
            <div className="text-gray-700">
              <p>{clinic.address?.line1}</p>
              {clinic.address?.line2 && <p>{clinic.address.line2}</p>}
              <p>
                {clinic.address?.city}, {clinic.address?.state} - {clinic.address?.pin}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StaffTab({ clinic, onInvite, onRemove }) {
  const staff = clinic.staff || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Members</CardTitle>
          <Button onClick={onInvite}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">No staff members yet</p>
            <Button onClick={onInvite} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Your First Staff Member
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.user?._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {member.user?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">{member.user?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{member.role}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemove(member)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ clinicId }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Patients" value="0" icon={<Users />} />
      <StatCard label="Appointments" value="0" icon={<Clock />} />
      <StatCard label="Prescriptions" value="0" icon={<Building2 />} />
      <StatCard label="Staff" value="0" icon={<Users />} />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-gray-900">{value || 'Not set'}</p>
      </div>
    </div>
  );
}

function InviteStaffModal({ clinicId, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('assistant');

  const handleInvite = () => {
    // TODO: Implement invite API call
    toast.info('Invite functionality coming soon!');
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Invite Staff Member">
      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="staff@example.com"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="assistant">Assistant</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleInvite} className="flex-1">
          <Mail className="w-4 h-4 mr-2" />
          Send Invite
        </Button>
      </div>
    </Modal>
  );
}

export default ClinicDetailPage;
