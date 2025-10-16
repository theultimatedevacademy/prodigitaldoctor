/**
 * VitalsForm Component
 * Form for recording patient vitals
 */

import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Activity, Heart, Thermometer, Wind } from 'lucide-react';

const VitalsForm = ({ appointmentId, existingVitals, onSave, onCancel }) => {
  const [vitals, setVitals] = useState({
    height: existingVitals?.height || '',
    weight: existingVitals?.weight || '',
    temperature: existingVitals?.temperature || '',
    bloodPressureSystolic: existingVitals?.bloodPressureSystolic || '',
    bloodPressureDiastolic: existingVitals?.bloodPressureDiastolic || '',
    pulse: existingVitals?.pulse || '',
    spo2: existingVitals?.spo2 || '',
    bloodSugar: existingVitals?.bloodSugar || '',
    notes: existingVitals?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(vitals);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4 inline mr-2" />
            Height (cm)
          </label>
          <Input
            type="number"
            name="height"
            value={vitals.height}
            onChange={handleChange}
            placeholder="e.g., 170"
            step="0.1"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4 inline mr-2" />
            Weight (kg)
          </label>
          <Input
            type="number"
            name="weight"
            value={vitals.weight}
            onChange={handleChange}
            placeholder="e.g., 70"
            step="0.1"
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Thermometer className="w-4 h-4 inline mr-2" />
            Temperature (°F)
          </label>
          <Input
            type="number"
            name="temperature"
            value={vitals.temperature}
            onChange={handleChange}
            placeholder="e.g., 98.6"
            step="0.1"
          />
        </div>

        {/* Blood Pressure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-2" />
            Blood Pressure (mmHg)
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              name="bloodPressureSystolic"
              value={vitals.bloodPressureSystolic}
              onChange={handleChange}
              placeholder="Systolic"
            />
            <span className="text-gray-500">/</span>
            <Input
              type="number"
              name="bloodPressureDiastolic"
              value={vitals.bloodPressureDiastolic}
              onChange={handleChange}
              placeholder="Diastolic"
            />
          </div>
        </div>

        {/* Pulse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-2" />
            Pulse (bpm)
          </label>
          <Input
            type="number"
            name="pulse"
            value={vitals.pulse}
            onChange={handleChange}
            placeholder="e.g., 72"
          />
        </div>

        {/* SpO2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Wind className="w-4 h-4 inline mr-2" />
            SpO2 (%)
          </label>
          <Input
            type="number"
            name="spo2"
            value={vitals.spo2}
            onChange={handleChange}
            placeholder="e.g., 98"
            max="100"
          />
        </div>

        {/* Blood Sugar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Sugar (mg/dL) - Optional
          </label>
          <Input
            type="number"
            name="bloodSugar"
            value={vitals.bloodSugar}
            onChange={handleChange}
            placeholder="e.g., 100"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={vitals.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional observations..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} className="flex-1">
          Save Vitals
        </Button>
      </div>
    </form>
  );
};

export default VitalsForm;
