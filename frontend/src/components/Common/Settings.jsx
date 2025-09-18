import React, { useState } from "react";
import { Save, User, Bell, Shield, Camera, Mic } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || "",
      email: user?.email || "",
      notifications: true,
    },
    detection: {
      focusThreshold: 5000,
      absenceThreshold: 10000,
      enableFaceDetection: true,
      enableObjectDetection: true,
      enableAudioDetection: false,
    },
    video: {
      resolution: "720p",
      frameRate: 30,
      enableMicrophone: true,
      enableCamera: true,
    },
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "detection", name: "Detection", icon: Shield },
    { id: "video", name: "Video", icon: Camera },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  const handleSave = () => {
    // Save settings logic
    console.log("Saving settings:", settings);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Settings
            </h3>
          </div>
          <div className="px-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value },
                    }))
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value },
                    }))
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {activeTab === "detection" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Focus Threshold (ms)
                  </label>
                  <input
                    type="number"
                    value={settings.detection.focusThreshold}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        detection: {
                          ...prev.detection,
                          focusThreshold: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Absence Threshold (ms)
                  </label>
                  <input
                    type="number"
                    value={settings.detection.absenceThreshold}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        detection: {
                          ...prev.detection,
                          absenceThreshold: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.detection.enableFaceDetection}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        detection: {
                          ...prev.detection,
                          enableFaceDetection: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable Face Detection
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.detection.enableObjectDetection}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        detection: {
                          ...prev.detection,
                          enableObjectDetection: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable Object Detection
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.detection.enableAudioDetection}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        detection: {
                          ...prev.detection,
                          enableAudioDetection: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable Audio Detection
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
