import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Settings, Save, ArrowLeft } from "lucide-react";
import { useInterview } from "../../contexts/InterviewContext";
import { useAuth } from "../../hooks/useAuth";

const CreateInterview = () => {
  const navigate = useNavigate();
  const { createInterview, loading } = useInterview();
  const { hasRole } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    candidateEmail: "",
    scheduledAt: "",
    duration: 60,
    settings: {
      enableFocusDetection: true,
      enableObjectDetection: true,
      enableAudioDetection: false,
      focusThreshold: 5000,
      absenceThreshold: 10000,
    },
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Redirect if not interviewer
  if (!hasRole("interviewer") && !hasRole("admin")) {
    navigate("/dashboard");
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]:
            type === "checkbox"
              ? checked
              : type === "number"
              ? parseInt(value)
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? parseInt(value)
            : value,
      }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Interview title is required";
    }

    if (!formData.candidateEmail.trim()) {
      newErrors.candidateEmail = "Candidate email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.candidateEmail)) {
      newErrors.candidateEmail = "Please enter a valid email address";
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "Interview date and time is required";
    } else {
      const scheduledDate = new Date(formData.scheduledAt);
      const now = new Date();
      if (scheduledDate <= now) {
        newErrors.scheduledAt = "Interview must be scheduled for a future date";
      }
    }

    if (
      !formData.duration ||
      formData.duration < 5 ||
      formData.duration > 180
    ) {
      newErrors.duration = "Duration must be between 5 and 180 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await createInterview(formData);

    if (result.success) {
      navigate("/interviews");
    } else {
      setErrors({ submit: result.error });
    }
  };

  // Generate default interview time (next hour)
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/interviews")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Interviews
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Schedule New Interview
        </h1>
        <p className="text-gray-600 mt-1">
          Create a new video interview session with AI monitoring
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Interview Details
            </h3>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Interview Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Frontend Developer Interview - John Doe"
                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="candidateEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Candidate Email *
              </label>
              <input
                type="email"
                id="candidateEmail"
                name="candidateEmail"
                value={formData.candidateEmail}
                onChange={handleChange}
                placeholder="candidate@example.com"
                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.candidateEmail ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.candidateEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.candidateEmail}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="scheduledAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={formData.scheduledAt || getDefaultDateTime()}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.scheduledAt ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.scheduledAt && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.scheduledAt}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration (minutes) *
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.duration ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Detection Settings */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              AI Detection Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="settings.enableFocusDetection"
                  checked={formData.settings.enableFocusDetection}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                />
                <span className="text-sm text-gray-700">Focus Detection</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="settings.enableObjectDetection"
                  checked={formData.settings.enableObjectDetection}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                />
                <span className="text-sm text-gray-700">Object Detection</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="settings.enableAudioDetection"
                  checked={formData.settings.enableAudioDetection}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                />
                <span className="text-sm text-gray-700">Audio Detection</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="focusThreshold"
                  className="block text-sm font-medium text-gray-700"
                >
                  Focus Threshold (seconds)
                </label>
                <select
                  id="focusThreshold"
                  name="settings.focusThreshold"
                  value={formData.settings.focusThreshold}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={3000}>3 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={15000}>15 seconds</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="absenceThreshold"
                  className="block text-sm font-medium text-gray-700"
                >
                  Absence Threshold (seconds)
                </label>
                <select
                  id="absenceThreshold"
                  name="settings.absenceThreshold"
                  value={formData.settings.absenceThreshold}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions or notes for this interview..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/interviews")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterview;
