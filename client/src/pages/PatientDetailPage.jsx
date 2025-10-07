/**
 * PatientDetailPage Component
 * Detailed view of a patient with tabs for visits, prescriptions, files
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner, LoadingOverlay } from '../components/ui/Spinner';
import { usePatient } from '../api/hooks/usePatients';
import { usePrescriptions } from '../api/hooks/usePrescriptions';
import { useAppointments } from '../api/hooks/useAppointments';
import { formatDate, formatPhone } from '../utils/formatters';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: patientData, isLoading } = usePatient(id);
  const { data: prescriptionsData } = usePrescriptions({ patientId: id });
  const { data: appointmentsData } = useAppointments({ patientId: id });
  
  const patient = patientData?.patient;
  const prescriptions = prescriptionsData?.prescriptions || [];
  const appointments = appointmentsData?.appointments || [];
  
  if (isLoading) {
    return <LoadingOverlay message="Loading patient..." />;
  }
  
  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-clinical-700">Patient not found</h2>
      </div>
    );
  }
  
  const age = patient.dob ? calculateAge(patient.dob) : null;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patients')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </Button>
      </div>
      
      {/* Patient Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-clinical-900">{patient.name}</h1>
                  <p className="text-clinical-600 mt-1">
                    Patient ID: {patient.patientCodes?.[0]?.code || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {patient.abhaId && (
                    <Badge variant="success">ABHA Linked</Badge>
                  )}
                  <Button size="sm">Edit Patient</Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Age / DOB"
                  value={age ? `${age} years (${formatDate(patient.dob)})` : 'N/A'}
                />
                <InfoItem
                  icon={<Activity className="w-4 h-4" />}
                  label="Gender"
                  value={patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                />
                <InfoItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={formatPhone(patient.phone)}
                />
                {patient.email && (
                  <InfoItem
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={patient.email}
                  />
                )}
                {patient.bloodGroup && (
                  <InfoItem
                    icon={<Activity className="w-4 h-4" />}
                    label="Blood Group"
                    value={patient.bloodGroup}
                  />
                )}
                {patient.address && (
                  <InfoItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Address"
                    value={patient.address}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <div className="border-b border-clinical-200">
        <div className="flex gap-6">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'appointments'}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments ({appointments.length})
          </TabButton>
          <TabButton
            active={activeTab === 'prescriptions'}
            onClick={() => setActiveTab('prescriptions')}
          >
            Prescriptions ({prescriptions.length})
          </TabButton>
          <TabButton
            active={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
          >
            Files
          </TabButton>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.allergies && (
                    <div>
                      <div className="text-sm font-medium text-clinical-700">Allergies</div>
                      <div className="text-clinical-900">{patient.allergies}</div>
                    </div>
                  )}
                  {patient.emergencyContact && (
                    <div>
                      <div className="text-sm font-medium text-clinical-700">Emergency Contact</div>
                      <div className="text-clinical-900">{formatPhone(patient.emergencyContact)}</div>
                    </div>
                  )}
                  {patient.abhaId && (
                    <div>
                      <div className="text-sm font-medium text-clinical-700">ABHA ID</div>
                      <div className="text-clinical-900">{patient.abhaId}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Create Prescription
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <Card>
            <CardContent className="p-6">
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="p-4 border border-clinical-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{formatDate(apt.date)}</div>
                          <div className="text-sm text-clinical-600">{apt.time}</div>
                        </div>
                        <Badge>{apt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-clinical-600 py-8">No appointments yet</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'prescriptions' && (
          <Card>
            <CardContent className="p-6">
              {prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div key={rx._id} className="p-4 border border-clinical-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Prescription #{rx._id.slice(-6)}</div>
                          <div className="text-sm text-clinical-600">{formatDate(rx.createdAt)}</div>
                        </div>
                        <Button size="sm" onClick={() => navigate(`/prescriptions/${rx._id}`)}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-clinical-600 py-8">No prescriptions yet</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'files' && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-clinical-600 py-8">No files uploaded yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <div className="text-clinical-400 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-clinical-600">{label}</div>
        <div className="text-sm font-medium text-clinical-900">{value}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
        active
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-clinical-600 hover:text-clinical-900'
      }`}
    >
      {children}
    </button>
  );
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
