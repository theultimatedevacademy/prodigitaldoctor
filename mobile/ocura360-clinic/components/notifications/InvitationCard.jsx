import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Building2, User, Calendar, CheckCircle, XCircle } from 'lucide-react-native';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAcceptInvitation, useRejectInvitation } from '../../api/hooks/useClinics';

export function InvitationCard({ invitation }) {
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();

  const handleAccept = () => {
    Alert.alert(
      'Accept Invitation',
      `Accept invitation to join ${invitation.clinic?.name} as ${invitation.role === 'doctor' ? 'Doctor' : 'Staff Member'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await acceptMutation.mutateAsync(invitation._id);
              Alert.alert(
                'Success',
                'Invitation accepted! You now have access to the clinic.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error?.message || 'Failed to accept invitation',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Invitation',
      `Are you sure you want to reject the invitation from ${invitation.clinic?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync(invitation._id);
              Alert.alert(
                'Invitation Rejected',
                'You have rejected the invitation.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error?.message || 'Failed to reject invitation',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const isLoading = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Header */}
        <View className="flex-row items-start mb-4">
          <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-3">
            <Building2 size={24} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {invitation.clinic?.name || 'Unknown Clinic'}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-gray-600">
                Invited as{' '}
              </Text>
              <Badge variant={invitation.role === 'doctor' ? 'primary' : 'default'} size="sm">
                {invitation.role === 'doctor' ? 'Doctor' : 'Staff'}
              </Badge>
            </View>
          </View>
        </View>

        {/* Clinic Details */}
        <View className="space-y-2 mb-4">
          {invitation.clinic?.address && (
            <View className="flex-row items-start">
              <Building2 size={16} color="#6B7280" className="mr-2 mt-0.5" />
              <Text className="text-sm text-gray-600 flex-1">
                {typeof invitation.clinic.address === 'string' 
                  ? invitation.clinic.address 
                  : `${invitation.clinic.address.street || ''}, ${invitation.clinic.address.city || ''}`}
              </Text>
            </View>
          )}
          
          {invitation.clinic?.owner && (
            <View className="flex-row items-center">
              <User size={16} color="#6B7280" className="mr-2" />
              <Text className="text-sm text-gray-600">
                Invited by: <Text className="font-medium">{invitation.clinic.owner.name}</Text>
              </Text>
            </View>
          )}

          {invitation.invitedAt && (
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" className="mr-2" />
              <Text className="text-sm text-gray-600">
                {new Date(invitation.invitedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            onPress={handleAccept}
            disabled={isLoading}
            loading={acceptMutation.isPending}
            className="flex-1"
          >
            <CheckCircle size={16} color="#fff" />
            <Text className="ml-2 text-white font-semibold">Accept</Text>
          </Button>
          <Button
            variant="outline"
            onPress={handleReject}
            disabled={isLoading}
            loading={rejectMutation.isPending}
            className="flex-1 border-red-600"
          >
            <XCircle size={16} color="#DC2626" />
            <Text className="ml-2 text-red-600 font-semibold">Reject</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}
