/**
 * PatientDetailPage Component
 * Detailed view of a patient with tabs for visits, prescriptions, files
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Activity, FileText, Stethoscope, Edit2, Clock, AlertCircle } from 'lucide-react';
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
  
  const { data: patient, isLoading, error: patientError } = usePatient(id);
  const { data: prescriptionsData } = usePrescriptions({ patientId: id });
  const { data: appointmentsData } = useAppointments({ patient: id });
  
  const prescriptions = prescriptionsData?.prescriptions || [];
  const allAppointments = appointmentsData?.appointments || [];
  
  // Debug logging for data fetching
  console.log('✅ Patient Detail Page - Data Loaded:', {
    patientId: id,
    patientName: patient?.name,
    patientLoaded: !!patient,
    totalAppointments: allAppointments.length,
    totalPrescriptions: prescriptions.length,
    completedAppointments: allAppointments.filter(a => a.status === 'completed').length,
    appointmentPatients: [...new Set(allAppointments.map(a => a.patient?._id || a.patient))],
    prescriptionPatients: [...new Set(prescriptions.map(p => p.patient?._id || p.patient))]
  });
  
  // Filter appointments: only completed and cancelled for past visits
  const pastAppointments = useMemo(() => {
    return allAppointments.filter(apt => 
      apt.status === 'completed' || apt.status === 'cancelled'
    ).sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
  }, [allAppointments]);
  
  // Get last completed visit
  const lastCompletedVisit = useMemo(() => {
    const completed = allAppointments
      .filter(apt => apt.status === 'completed')
      .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))[0];
    
    if (completed) {
      console.log('📋 Last Completed Visit:', {
        appointmentId: completed._id,
        startAt: completed.startAt,
        diagnosis: completed.clinicalNotes?.diagnosis,
        prescriptionRefs: completed.prescriptions,
        prescriptionRefsType: completed.prescriptions?.map(p => typeof p)
      });
    }
    
    return completed;
  }, [allAppointments]);
  
  // Total completed visits count
  const totalVisits = useMemo(() => {
    return allAppointments.filter(apt => apt.status === 'completed').length;
  }, [allAppointments]);
  
  // Prescriptions from completed appointments only
  const completedPrescriptions = useMemo(() => {
    const completedAppointmentIds = allAppointments
      .filter(apt => apt.status === 'completed')
      .map(apt => apt._id?.toString?.() || String(apt._id));
    
    const filtered = prescriptions.filter(rx => {
      if (!rx.appointment) return false;
      
      // Handle both populated and unpopulated appointment references
      let rxAppointmentId;
      if (typeof rx.appointment === 'object' && rx.appointment._id) {
        rxAppointmentId = rx.appointment._id.toString?.() || String(rx.appointment._id);
      } else {
        rxAppointmentId = rx.appointment.toString?.() || String(rx.appointment);
      }
      
      const isMatch = completedAppointmentIds.includes(rxAppointmentId);
      return isMatch;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Debug logging
    console.log('✅ Prescriptions Filtering:', {
      totalPrescriptions: prescriptions.length,
      completedAppointmentsCount: completedAppointmentIds.length,
      filteredPrescriptionsCount: filtered.length,
      completedAppointmentIds: completedAppointmentIds.slice(0, 3),
      matchingPrescriptions: filtered.map(p => ({
        id: p._id,
        aptId: typeof p.appointment === 'object' ? p.appointment?._id : p.appointment
      }))
    });
    
    return filtered;
  }, [prescriptions, allAppointments]);
  
  // Get files from completed appointments (vitals files)
  const appointmentFiles = useMemo(() => {
    return allAppointments
      .filter(apt => apt.status === 'completed' && apt.vitals)
      .map(apt => ({
        appointmentId: apt._id,
        date: apt.startAt,
        vitals: apt.vitals
      }));
  }, [allAppointments]);
  
  if (isLoading) {
    return <LoadingOverlay message="Loading patient..." />;
  }
  
  if (patientError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Patient</h2>
        <p className="text-gray-600 mt-2">{patientError.message || 'Failed to load patient data'}</p>
        <Button onClick={() => navigate('/patients')} className="mt-4">
          Back to Patients
        </Button>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Patient not found</h2>
        <p className="text-gray-600 mt-2">The patient with ID {id} could not be found.</p>
        <Button onClick={() => navigate('/patients')} className="mt-4">
          Back to Patients
        </Button>
      </div>
    );
  }
  
  const age = patient.age;
  
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
      
      {/* Patient Info - Modern Design without Card */}
      <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-lg">
        <div className="flex items-start gap-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="w-12 h-12 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold text-slate-800 mb-2">{patient.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    ID: <span className="font-medium text-slate-700">{patient.patientCodes?.[0]?.code || 'N/A'}</span>
                  </span>
                  {(patient.abhaId || patient.abhaNumber) && (
                    <Badge variant="success" className="text-xs">ABHA Linked</Badge>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate(`/patients/${id}/edit`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Patient
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <InfoItem
                icon={<Calendar className="w-4 h-4 text-indigo-500" />}
                label="Age"
                value={age ? `${age} years` : 'N/A'}
              />
              <InfoItem
                icon={<Activity className="w-4 h-4 text-indigo-500" />}
                label="Gender"
                value={patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
              />
              <InfoItem
                icon={<Phone className="w-4 h-4 text-indigo-500" />}
                label="Phone"
                value={formatPhone(patient.phone)}
              />
              {patient.email && (
                <InfoItem
                  icon={<Mail className="w-4 h-4 text-indigo-500" />}
                  label="Email"
                  value={patient.email}
                />
              )}
              {patient.bloodGroup && (
                <InfoItem
                  icon={<Activity className="w-4 h-4 text-indigo-500" />}
                  label="Blood Group"
                  value={patient.bloodGroup}
                />
              )}
              {patient.addresses && patient.addresses.length > 0 && (
                <InfoItem
                  icon={<MapPin className="w-4 h-4 text-indigo-500" />}
                  label="Address"
                  value={formatAddress(patient.addresses[0])}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs - Modern Design */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 bg-slate-50 p-1 rounded-lg inline-flex">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Medical Info
          </TabButton>
          <TabButton
            active={activeTab === 'appointments'}
            onClick={() => setActiveTab('appointments')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Past Visits ({pastAppointments.length})
          </TabButton>
          <TabButton
            active={activeTab === 'prescriptions'}
            onClick={() => setActiveTab('prescriptions')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Prescriptions ({completedPrescriptions.length})
          </TabButton>
          <TabButton
            active={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Files
          </TabButton>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Visit Summary */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-lg font-semibold text-slate-800">Visit Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-indigo-600 mb-1">Total Visits</div>
                      <div className="text-2xl font-bold text-indigo-700">{totalVisits}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                  
                  {lastCompletedVisit ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                        <div>
                          <div className="text-xs font-medium text-slate-500">Last Visit</div>
                          <div className="text-sm font-semibold text-slate-700">
                            {formatDate(lastCompletedVisit.startAt)}
                          </div>
                        </div>
                      </div>
                      
                      {lastCompletedVisit.clinicalNotes?.diagnosis && (
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                            <div className="text-xs font-medium text-slate-500">Last Diagnosis</div>
                            <div className="text-sm text-slate-700">
                              {lastCompletedVisit.clinicalNotes.diagnosis}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {lastCompletedVisit.prescriptions && lastCompletedVisit.prescriptions.length > 0 && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-slate-400 mt-1" />
                          <div className="w-full">
                            <div className="text-xs font-medium text-slate-500 mb-2">Last Medications</div>
                            <div className="space-y-1">
                              {(() => {
                                const rxId = lastCompletedVisit.prescriptions[0];
                                const rxIdString = typeof rxId === 'object' && rxId._id 
                                  ? (rxId._id.toString?.() || String(rxId._id))
                                  : (rxId?.toString?.() || String(rxId));
                                
                                console.log('💊 Matching Last Medications:', {
                                  appointmentPrescriptionRef: rxId,
                                  rxIdString,
                                  availablePrescriptions: prescriptions.map(p => ({
                                    id: p._id,
                                    idString: p._id?.toString?.() || String(p._id),
                                    medsCount: p.meds?.length
                                  })),
                                  matches: prescriptions.some(p => 
                                    (p._id?.toString?.() || String(p._id)) === rxIdString
                                  )
                                });
                                
                                const prescription = prescriptions.find(p => {
                                  const pIdString = p._id?.toString?.() || String(p._id);
                                  return pIdString === rxIdString;
                                });
                                
                                if (!prescription || !prescription.meds) {
                                  console.log('⚠️ No prescription found or no meds:', {
                                    prescriptionFound: !!prescription,
                                    hasMeds: !!prescription?.meds
                                  });
                                  return (
                                    <div className="text-xs text-slate-500">No medications recorded</div>
                                  );
                                }
                                
                                return (
                                  <div className="space-y-1">
                                    {prescription.meds.slice(0, 3).map((med, medIdx) => (
                                      <div key={medIdx} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                        {med.medication?.brandName || med.medication?.genericName || med.medication?.name || 'Medication'}
                                      </div>
                                    ))}
                                    {prescription.meds.length > 3 && (
                                      <div className="text-xs text-slate-500 px-2">
                                        +{prescription.meds.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">
                      No completed visits yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Patient Information */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-lg font-semibold text-slate-800">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {patient.allergies && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-xs font-medium text-red-700 mb-1">Allergies</div>
                      <div className="text-sm text-red-900">{patient.allergies}</div>
                    </div>
                  )}
                  {patient.emergencyContact && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1">Emergency Contact</div>
                      <div className="text-sm font-semibold text-slate-700">{formatPhone(patient.emergencyContact)}</div>
                    </div>
                  )}
                  {(patient.abhaId || patient.abhaNumber) && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1">ABHA ID</div>
                      <div className="text-sm font-semibold text-slate-700">{patient.abhaId || patient.abhaNumber}</div>
                    </div>
                  )}
                  {!patient.allergies && !patient.emergencyContact && !(patient.abhaId || patient.abhaNumber) && (
                    <p className="text-slate-500 text-sm text-center py-4">No additional information recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-semibold text-slate-800">Past Visits History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map((apt) => (
                    <div key={apt._id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{formatDate(apt.startAt)}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(apt.startAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {apt.status}
                        </Badge>
                      </div>
                      
                      {apt.clinicalNotes?.diagnosis && (
                        <div className="mt-2 pt-3 border-t border-slate-100">
                          <div className="text-xs font-medium text-slate-500 mb-1">Diagnosis</div>
                          <div className="text-sm text-slate-700">{apt.clinicalNotes.diagnosis}</div>
                        </div>
                      )}
                      
                      {apt.visitType && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            apt.visitType === 'first_visit' 
                              ? 'bg-purple-100 text-purple-700 border-purple-200' 
                              : 'bg-teal-100 text-teal-700 border-teal-200'
                          }`}>
                            {apt.visitType === 'first_visit' ? 'First Visit' : 'Follow Up'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No past visits recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'prescriptions' && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-semibold text-slate-800">Prescription History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {completedPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {completedPrescriptions.map((rx) => (
                    <div key={rx._id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 mb-1">
                              Prescription #{rx._id.slice(-6)}
                            </div>
                            <div className="text-xs text-slate-500 mb-2">
                              {formatDate(rx.createdAt)}
                            </div>
                            {rx.meds && rx.meds.length > 0 && (
                              <div className="space-y-1">
                                {rx.meds.slice(0, 2).map((med, idx) => (
                                  <div key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                    {med.medication?.brandName || med.medication?.genericName || med.medication?.name || 'Medication'} 
                                    {med.dosage && ` - ${med.dosage}`}
                                    {med.frequency && ` ${med.frequency}`}
                                  </div>
                                ))}
                                {rx.meds.length > 2 && (
                                  <div className="text-xs text-slate-500">
                                    +{rx.meds.length - 2} more medication(s)
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/prescriptions/${rx._id}`)}
                          className="ml-3"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No prescriptions from completed visits</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'files' && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-semibold text-slate-800">Patient Files</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {appointmentFiles.length > 0 ? (
                <div className="space-y-3">
                  {appointmentFiles.map((file) => (
                    <div key={file.appointmentId} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 mb-1">
                            Vitals Record
                          </div>
                          <div className="text-xs text-slate-500 mb-2">
                            Visit on {formatDate(file.date)}
                          </div>
                          {file.vitals && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {file.vitals.height && (
                                <div className="bg-slate-50 px-2 py-1 rounded">
                                  <span className="text-slate-500">Height:</span>{' '}
                                  <span className="text-slate-700 font-medium">{file.vitals.height} cm</span>
                                </div>
                              )}
                              {file.vitals.weight && (
                                <div className="bg-slate-50 px-2 py-1 rounded">
                                  <span className="text-slate-500">Weight:</span>{' '}
                                  <span className="text-slate-700 font-medium">{file.vitals.weight} kg</span>
                                </div>
                              )}
                              {file.vitals.bloodPressureSystolic && file.vitals.bloodPressureDiastolic && (
                                <div className="bg-slate-50 px-2 py-1 rounded">
                                  <span className="text-slate-500">BP:</span>{' '}
                                  <span className="text-slate-700 font-medium">
                                    {file.vitals.bloodPressureSystolic}/{file.vitals.bloodPressureDiastolic} mmHg
                                  </span>
                                </div>
                              )}
                              {file.vitals.pulse && (
                                <div className="bg-slate-50 px-2 py-1 rounded">
                                  <span className="text-slate-500">Pulse:</span>{' '}
                                  <span className="text-slate-700 font-medium">{file.vitals.pulse} bpm</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No files uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition-all flex items-center ${
        active
          ? 'bg-white text-indigo-600 shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
      }`}
    >
      {children}
    </button>
  );
}


function formatAddress(address) {
  if (!address) return 'N/A';
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pin
  ].filter(Boolean);
  return parts.join(', ') || 'N/A';
}
