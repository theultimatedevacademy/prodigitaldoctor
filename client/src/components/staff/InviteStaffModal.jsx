/**
 * InviteStaffModal - Modal to invite staff members to clinic
 */

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { post } from "../../api/apiClient";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export function InviteStaffModal({ clinicId, onClose }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("doctor");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await post(`/clinics/${clinicId}/invite`, { email, role });

      toast.success("Invitation sent successfully!");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      queryClient.invalidateQueries({ queryKey: ["clinic", clinicId] });

      onClose();
    } catch (error) {
      console.error("Error inviting staff:", error);

      // Check if user not found (404 error or error message contains "not found")
      const isUserNotFound =
        error.status === 404 ||
        error.data?.error?.includes("not found") ||
        error.message?.includes("not found on platform");

      if (isUserNotFound) {
        toast.warning(
          "User not found! The email address may be incorrect, or the user has not signed up on the platform yet. Please verify the email or ask them to create an account first.",
          { autoClose: 6000 }
        );
      } else if (error.data?.error === "Cannot invite clinic owner as staff") {
        toast.error("Cannot invite the clinic owner as a staff member.");
      } else if (
        error.data?.error === "User already invited or is a staff member"
      ) {
        toast.error(
          "This user has already been invited or is already a staff member."
        );
      } else {
        toast.error(
          error.data?.error || error.message || "Failed to send invitation"
        );
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Invite Staff Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="doctor@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              User must already have an account on the platform
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === "doctor"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Doctor</div>
                  <div className="text-xs text-gray-600">
                    Can manage patients, create prescriptions, view own
                    appointments
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={role === "staff"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Staff</div>
                  <div className="text-xs text-gray-600">
                    Can manage appointments, view patients, cannot create
                    prescriptions
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
