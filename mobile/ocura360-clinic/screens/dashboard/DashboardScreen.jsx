import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Users, FileText, TrendingUp, Plus, RefreshCw, BarChart3, UserX, Pill } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/formatters';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useMe } from '../../api/hooks/useAuth';
import { useAppointments } from '../../api/hooks/useAppointments';
import { usePatients } from '../../api/hooks/usePatients';
import { usePrescriptions } from '../../api/hooks/usePrescriptions';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { selectedClinic, selectedClinicId, userClinicRole } = useClinicContext();
  const { data: user } = useMe();
  const [refreshing, setRefreshing] = React.useState(false);

  // Get today's date (memoized - only calculate once)
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  
  // Get current month date range (memoized - only calculate once)
  const { monthStart, monthEnd } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return {
      monthStart: formatDate(firstDay),
      monthEnd: formatDate(lastDay)
    };
  }, []);

  // Fetch today's appointments
  const { data: appointmentsData, isLoading: loadingAppointments, refetch: refetchAppointments } = useAppointments(
    {
      clinicId: selectedClinicId,
      date: today,
    },
    {
      enabled: !!selectedClinicId,
    }
  );
  
  // Fetch month appointments for stats
  const { data: monthAppointmentsData, refetch: refetchMonthAppointments } = useAppointments(
    {
      clinicId: selectedClinicId,
      startDate: monthStart,
      endDate: monthEnd,
      limit: 1000,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  // Fetch patients
  const { data: patientsData, refetch: refetchPatients } = usePatients({
    clinicId: selectedClinicId,
  });

  // Fetch prescriptions
  const { data: prescriptionsData, refetch: refetchPrescriptions } = usePrescriptions(
    {
      clinicId: selectedClinicId,
      startDate: monthStart,
      endDate: monthEnd,
      limit: 1000,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  const todaysAppointments = appointmentsData?.appointments || [];
  const monthAppointments = monthAppointmentsData?.appointments || [];
  const monthPrescriptions = prescriptionsData?.data || [];
  
  // Debug: Log patients data
  React.useEffect(() => {
    console.log('=== PATIENTS DATA DEBUG ===');
    console.log('Full patientsData:', JSON.stringify(patientsData, null, 2));
    console.log('patientsData?.pagination:', patientsData?.pagination);
    console.log('patientsData?.pagination?.total:', patientsData?.pagination?.total);
    console.log('patientsData?.patients length:', patientsData?.patients?.length);
    console.log('=========================');
  }, [patientsData]);
  
  // Debug: Log patient growth calculation
  React.useEffect(() => {
    console.log('=== PATIENT GROWTH DEBUG ===');
    console.log('monthAppointments length:', monthAppointments.length);
    console.log('monthAppointments:', monthAppointments.map(apt => ({
      id: apt._id,
      patient: apt.patient?.name,
      visitType: apt.visitType,
      date: apt.date
    })));
    const firstVisits = monthAppointments.filter(apt => apt.visitType === 'first_visit');
    console.log('First visits this month:', firstVisits.length);
    console.log('First visit appointments:', firstVisits.map(apt => ({
      patient: apt.patient?.name,
      date: apt.date
    })));
    console.log('Patient Growth value:', patientGrowth);
    console.log('============================');
  }, [monthAppointments, patientGrowth]);
  
  // Calculate stats (memoized - only recalculate when data changes)
  const patientGrowth = useMemo(() => {
    const newPatientsThisMonth = monthAppointments.filter(apt => apt.visitType === 'first_visit').length;
    return newPatientsThisMonth;
  }, [monthAppointments]);
  
  const followUpRate = useMemo(() => {
    if (monthAppointments.length === 0) return 0;
    const followUps = monthAppointments.filter(apt => apt.visitType === 'follow_up').length;
    return Math.round((followUps / monthAppointments.length) * 100);
  }, [monthAppointments]);
  
  const avgAppointmentsPerDay = useMemo(() => {
    if (monthAppointments.length === 0) return 0;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysPassed = Math.ceil((today - firstDayOfMonth) / (1000 * 60 * 60 * 24)) + 1;
    return (monthAppointments.length / daysPassed).toFixed(1);
  }, [monthAppointments]);
  
  const cancelledRate = useMemo(() => {
    if (monthAppointments.length === 0) return 0;
    const cancelled = monthAppointments.filter(apt => apt.status === 'cancelled').length;
    return Math.round((cancelled / monthAppointments.length) * 100);
  }, [monthAppointments]);
  
  const avgMedications = useMemo(() => {
    if (monthPrescriptions.length === 0) return 0;
    const totalMeds = monthPrescriptions.reduce((sum, rx) => sum + (rx.meds?.length || 0), 0);
    return (totalMeds / monthPrescriptions.length).toFixed(1);
  }, [monthPrescriptions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchAppointments(),
      refetchMonthAppointments(),
      refetchPatients(),
      refetchPrescriptions(),
    ]);
    setRefreshing(false);
  }, [refetchAppointments, refetchMonthAppointments, refetchPatients, refetchPrescriptions]);

  return (
    <ScreenWrapper>
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {selectedClinic?.name || 'Clinic'}
        </Text>
      </View>
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Stats Cards */}
        <View className="p-4">
          {loadingAppointments ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-600 mt-2">Loading analytics...</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap -mx-2">
              {/* Today's Appointments */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Calendar size={20} color="#2563EB" />
                      <Text className="text-2xl font-bold text-blue-600">
                        {todaysAppointments.length}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Today's Appointments</Text>
                    <Text className="text-xs text-gray-500 mt-1">{monthAppointments.length} this month</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Total Patients */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Users size={20} color="#16A34A" />
                      <Text className="text-2xl font-bold text-green-600">
                        {patientsData?.pagination?.total || 0}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Total Patients</Text>
                    <Text className="text-xs text-gray-500 mt-1">+{patientGrowth} new this month</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Prescriptions (Month) */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <FileText size={20} color="#9333EA" />
                      <Text className="text-2xl font-bold text-purple-600">
                        {monthPrescriptions.length}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Prescriptions</Text>
                    <Text className="text-xs text-gray-500 mt-1">This month</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Patient Growth */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <TrendingUp size={20} color="#EA580C" />
                      <Text className="text-2xl font-bold text-orange-600">
                        +{patientGrowth}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Patient Growth</Text>
                    <Text className="text-xs text-gray-500 mt-1">New patients</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Follow-up Rate */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-teal-50 border-teal-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <RefreshCw size={20} color="#0D9488" />
                      <Text className="text-2xl font-bold text-teal-600">
                        {followUpRate}%
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Follow-up Rate</Text>
                    <Text className="text-xs text-gray-500 mt-1">Returning patients</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Avg Appointments/Day */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <BarChart3 size={20} color="#4F46E5" />
                      <Text className="text-2xl font-bold text-indigo-600">
                        {avgAppointmentsPerDay}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Avg Appointments/Day</Text>
                    <Text className="text-xs text-gray-500 mt-1">This month</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Cancelled Rate */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-rose-50 border-rose-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <UserX size={20} color="#E11D48" />
                      <Text className="text-2xl font-bold text-rose-600">
                        {cancelledRate}%
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Cancelled Rate</Text>
                    <Text className="text-xs text-gray-500 mt-1">Cancelled appointments</Text>
                  </CardContent>
                </Card>
              </View>

              {/* Avg Meds/Prescription */}
              <View className="w-1/2 px-2 mb-4">
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Pill size={20} color="#D97706" />
                      <Text className="text-2xl font-bold text-amber-600">
                        {avgMedications}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600">Avg Meds/Prescription</Text>
                    <Text className="text-xs text-gray-500 mt-1">Per prescription</Text>
                  </CardContent>
                </Card>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <View>
                {/* New Appointment - Full Width */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AppointmentsTab', { 
                    screen: 'NewAppointment' 
                  })}
                  style={{ backgroundColor: '#2563EB' }}
                  className="rounded-lg p-3 flex-row items-center justify-center mb-3"
                >
                  <Plus size={20} color="#fff" />
                  <Text className="text-white text-sm font-semibold ml-2">
                    New Appointment
                  </Text>
                </TouchableOpacity>
                
                {/* Second Row - Two Buttons */}
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PrescriptionsTab', {
                      screen: 'PrescriptionsList'
                    })}
                    style={{ backgroundColor: '#9333EA', width: '48%' }}
                    className="rounded-lg p-3 items-center justify-center"
                  >
                    <FileText size={20} color="#fff" />
                    <Text className="text-white text-xs font-semibold mt-1 text-center">
                      Today's Prescriptions
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigation.navigate('MedicationsTab')}
                    style={{ backgroundColor: '#16A34A', width: '48%' }}
                    className="rounded-lg p-3 items-center justify-center"
                  >
                    <Pill size={20} color="#fff" />
                    <Text className="text-white text-xs font-semibold mt-1 text-center">
                      Medications Search
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('AppointmentsTab', {
                  screen: 'AppointmentsList'
                })}>
                  <Text className="text-blue-600 text-sm font-semibold">View All</Text>
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {todaysAppointments.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">
                  No appointments scheduled for today
                </Text>
              ) : (
                todaysAppointments.slice(0, 5).map((appointment) => {
                  // Get patient code for current clinic
                  const patientCode = appointment.patient?.patientCodes?.find(
                    (pc) => pc.clinic?._id === selectedClinicId || pc.clinic === selectedClinicId
                  )?.code || 'N/A';
                  
                  return (
                    <TouchableOpacity
                      key={appointment._id}
                      onPress={() => navigation.navigate('AppointmentsTab', {
                        screen: 'AppointmentDetail',
                        params: { id: appointment._id }
                      })}
                      className="border-b border-gray-100 py-3 last:border-b-0"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                          <Text className="text-base font-semibold text-gray-900">
                            {appointment.patient?.name || 'Unknown Patient'}
                          </Text>
                          <Text className="text-sm text-gray-600 mt-0.5">
                            {patientCode} • {appointment.visitType === 'first_visit' ? 'First Visit' : 'Follow-up'}
                          </Text>
                        </View>
                        <Badge
                          variant={
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'confirmed' ? 'primary' :
                            appointment.status === 'cancelled' ? 'danger' : 'warning'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
