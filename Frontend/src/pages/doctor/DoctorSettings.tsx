import MainLayout from "@/components/layout/MainLayout";
import { Bell, Lock, User, Calendar, Save, Clock, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from '@/url';

interface AppointmentSettings {
  id?: number;
  autoApprove: boolean;
  allowOverbooking: boolean;
  slotDurationMinutes: number;
  advanceBookingDays: number;
  bufferTimeMinutes: number;
}

interface DoctorProfileData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  birthDate?: string;
  gender?: string;
  profileImage?: string;
  institute?: string;
  licenseNumber?: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface AvailabilityTemplate {
  id?: number;
  name: string;
  templateType: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  daysOfWeek: string[];
  timeSlots: TimeSlot[];
  isActive: boolean;
  description?: string;
}

interface AvailabilityException {
  id?: number;
  date: string;
  exceptionType: 'UNAVAILABLE' | 'CUSTOM_HOURS';
  timeSlots?: TimeSlot[];
  reason?: string;
}

const DoctorSettings = () => {
  const [settings, setSettings] = useState<AppointmentSettings>({
    autoApprove: false,
    allowOverbooking: false,
    slotDurationMinutes: 30,
    advanceBookingDays: 30,
    bufferTimeMinutes: 5,
  });
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<DoctorProfileData | null>(null); // Renamed to doctorInfo

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AvailabilityTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<AvailabilityTemplate>({
    name: '',
    templateType: 'DAILY',
    daysOfWeek: [],
    timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
    isActive: true,
    description: ''
  });

  // Exception form state
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [editingException, setEditingException] = useState<AvailabilityException | null>(null);
  const [exceptionForm, setExceptionForm] = useState<AvailabilityException>({
    date: '',
    exceptionType: 'UNAVAILABLE',
    timeSlots: [],
    reason: ''
  });

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch doctor profile");
      }
      const data = await response.json();
      setDoctorInfo(data);
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchDoctorProfile();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const doctorId = 1; // TODO: Get actual doctorId from auth context or user profile
      const token = localStorage.getItem("authToken");

      const [settingsResponse, templatesResponse, exceptionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/appointment-settings/doctor/${doctorId}/or-create`, {
          method: "GET",
          credentials: "include"
        }),
        fetch(`${API_BASE_URL}/api/doctor-availability/templates`, {
          method: "GET",
          credentials: "include"
        }),
        fetch(`${API_BASE_URL}/api/doctor-availability/exceptions`, {
          method: "GET",
          credentials: "include"
        })
      ]);

      if (!settingsResponse.ok) throw new Error("Failed to load appointment settings");
      if (!templatesResponse.ok) throw new Error("Failed to load templates");
      if (!exceptionsResponse.ok) throw new Error("Failed to load exceptions");

      const settingsData = await settingsResponse.json();
      const templatesData = await templatesResponse.json();
      const exceptionsData = await exceptionsResponse.json();

      setSettings(settingsData);

      const transformedTemplates: AvailabilityTemplate[] = templatesData.map((apiTemplate: any) => {
        const dayMap: { [key: number]: string } = {
          1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY',
          6: 'SATURDAY', 7: 'SUNDAY',
        };

        let mappedDaysOfWeek: string[] = [];
        if (typeof apiTemplate.daysOfWeek === 'string') {
          mappedDaysOfWeek = apiTemplate.daysOfWeek
            .split(',')
            .filter(Boolean)
            .map(Number)
            .map((numDay: number) => dayMap[numDay] || '');
        } else if (Array.isArray(apiTemplate.daysOfWeek)) {
          mappedDaysOfWeek = apiTemplate.daysOfWeek.map((numDay: number) => dayMap[numDay] || '');
        }

        let templateTimeSlots: TimeSlot[] = [];
        if (apiTemplate.startTime && apiTemplate.endTime) {
          templateTimeSlots.push({
            startTime: apiTemplate.startTime.substring(0, 5),
            endTime: apiTemplate.endTime.substring(0, 5)
          });
        } else if (Array.isArray(apiTemplate.timeSlots)) {
          templateTimeSlots = apiTemplate.timeSlots.map((slot: any) => ({
            startTime: slot.startTime ? slot.startTime.substring(0, 5) : '00:00',
            endTime: slot.endTime ? slot.endTime.substring(0, 5) : '00:00'
          }));
        } else {
          templateTimeSlots.push({ startTime: '09:00', endTime: '17:00' });
        }

        return {
          id: apiTemplate.id,
          name: apiTemplate.templateName || '',
          templateType: apiTemplate.scheduleType || 'DAILY',
          daysOfWeek: mappedDaysOfWeek,
          timeSlots: templateTimeSlots,
          isActive: apiTemplate.isActive ?? true,
          description: apiTemplate.description || ''
        };
      });

      const transformedExceptions: AvailabilityException[] = exceptionsData.map((apiException: any) => {
        let timeSlots: TimeSlot[] = [];
        if (apiException.exceptionType === 'CUSTOM_HOURS' && apiException.startTime && apiException.endTime) {
          const formattedStartTime = apiException.startTime.substring(0, 5);
          const formattedEndTime = apiException.endTime.substring(0, 5);
          timeSlots.push({ startTime: formattedStartTime, endTime: formattedEndTime });
        }

        return {
          id: apiException.id,
          date: apiException.exceptionDate || '',
          exceptionType: apiException.exceptionType,
          timeSlots: timeSlots,
          reason: apiException.reason || ''
        };
      });

      setTemplates(transformedTemplates);
      setExceptions(transformedExceptions);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const doctorId = 1; // TODO: Get actual doctorId from auth context or user profile
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/appointment-settings/doctor/${doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update settings");
      }

      setSuccess("Settings updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const payload = {
        id: editingTemplate?.id,
        templateName: templateForm.name,
        scheduleType: templateForm.templateType,
        startTime: templateForm.timeSlots[0]?.startTime + ':00',
        endTime: templateForm.timeSlots[0]?.endTime + ':00',
        daysOfWeek: templateForm.daysOfWeek.map(day => daysOfWeek.indexOf(day) + 1),
        startDate: templateForm.startDate || null,
        endDate: templateForm.endDate || null,
        specificDates: templateForm.specificDates || null,
        isActive: templateForm.isActive,
        priority: templateForm.priority || 1
      };

      const response = await fetch(
        editingTemplate 
          ? `${API_BASE_URL}/api/doctor-availability/templates/${editingTemplate.id}` 
          : `${API_BASE_URL}/api/doctor-availability/templates`,
        {
          method: editingTemplate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save template");
      }

      setSuccess(editingTemplate ? "Template updated successfully" : "Template created successfully");
      setShowTemplateForm(false);
      setEditingTemplate(null);
      resetTemplateForm();
      fetchAllData();
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/doctor-availability/templates/${templateId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete template");
      }

      setSuccess("Template deleted successfully");
      fetchAllData();
    } catch (err: any) {
      setError(err.message || "Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveException = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      const payload = {
        id: editingException?.id,
        exceptionDate: exceptionForm.date,
        exceptionType: exceptionForm.exceptionType,
        startTime: exceptionForm.exceptionType === 'CUSTOM_HOURS' && exceptionForm.timeSlots && exceptionForm.timeSlots.length > 0
          ? exceptionForm.timeSlots[0].startTime + ':00'
          : null,
        endTime: exceptionForm.exceptionType === 'CUSTOM_HOURS' && exceptionForm.timeSlots && exceptionForm.timeSlots.length > 0
          ? exceptionForm.timeSlots[0].endTime + ':00'
          : null,
        reason: exceptionForm.reason
      };

      const response = await fetch(
        editingException
          ? `${API_BASE_URL}/api/doctor-availability/exceptions/${editingException.id}`
          : `${API_BASE_URL}/api/doctor-availability/exceptions`,
        {
          method: editingException ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save exception");
      }

      setSuccess(editingException ? "Exception updated successfully" : "Exception created successfully");
      setShowExceptionForm(false);
      setEditingException(null);
      resetExceptionForm();
      fetchAllData();
    } catch (err: any) {
      setError(err.message || "Failed to save exception");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteException = async (exceptionId: number) => {
    if (!confirm("Are you sure you want to delete this exception?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/doctor-availability/exceptions/${exceptionId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete exception");
      }

      setSuccess("Exception deleted successfully");
      fetchAllData();
    } catch (err: any) {
      setError(err.message || "Failed to delete exception");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSlots = async () => {
    if (!confirm("This will regenerate all your availability slots. Continue?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/doctor-availability/regenerate-slots`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to regenerate slots");
      }

      setSuccess("All slots regenerated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to regenerate slots");
    } finally {
      setLoading(false);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      templateType: 'DAILY',
      daysOfWeek: [],
      timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
      isActive: true,
      description: ''
    });
  };

  const resetExceptionForm = () => {
    setExceptionForm({
      date: '',
      exceptionType: 'UNAVAILABLE',
      timeSlots: [],
      reason: ''
    });
  };

  const addTimeSlot = (isTemplate: boolean = true) => {
    if (isTemplate) {
      setTemplateForm({
        ...templateForm,
        timeSlots: [...(templateForm.timeSlots||[]), { startTime: '09:00', endTime: '17:00' }]
      });
    } else {
      setExceptionForm({
        ...exceptionForm,
        timeSlots: [...(exceptionForm.timeSlots || []), { startTime: '09:00', endTime: '17:00' }]
      });
    }
  };

  const removeTimeSlot = (index: number, isTemplate: boolean = true) => {
    if (isTemplate) {
      setTemplateForm({
        ...templateForm,
        timeSlots: templateForm.timeSlots.filter((_, i) => i !== index)
      });
    } else {
      setExceptionForm({
        ...exceptionForm,
        timeSlots: exceptionForm.timeSlots?.filter((_, i) => i !== index) || []
      });
    }
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string, isTemplate: boolean = true) => {
    if (isTemplate) {
      const newSlots = [...templateForm.timeSlots];
      newSlots[index][field] = value;
      setTemplateForm({ ...templateForm, timeSlots: newSlots });
    } else {
      const newSlots = [...(exceptionForm.timeSlots || [])];
      newSlots[index][field] = value;
      setExceptionForm({ ...exceptionForm, timeSlots: newSlots });
    }
  };

  const handleDayToggle = (day: string) => {
    const newDays = templateForm.daysOfWeek.includes(day)
      ? templateForm.daysOfWeek.filter(d => d !== day)
      : [...templateForm.daysOfWeek, day];
    setTemplateForm({ ...templateForm, daysOfWeek: newDays });
  };

  const editTemplate = (template: AvailabilityTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      ...template,
      daysOfWeek: template.daysOfWeek || [],
      isActive: template.isActive ?? true
    });
    setShowTemplateForm(true);
  };

  const editException = (exception: AvailabilityException) => {
    setEditingException(exception);
    setExceptionForm(exception);
    setShowExceptionForm(true);
  };

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and availability</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'availability', label: 'Availability', icon: Calendar },
              { id: 'schedule', label: 'Schedule', icon: Clock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Lock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Profile Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue={doctorInfo && doctorInfo.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue={doctorInfo && doctorInfo.specialization}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute
                  </label>
                  <textarea
                    className="form-input min-h-[100px]"
                    defaultValue={doctorInfo && doctorInfo.institute}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Availability Templates</h2>
                      <p className="text-sm text-gray-600">Set your regular working hours</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTemplateForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Template
                  </button>
                </div>

                {templates.length > 0 ? (
                  <div className="space-y-4">
                    {(templates||[]).map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{template.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              template.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => editTemplate(template)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id!)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Type:</strong> {template.templateType}</p>
                          {template.templateType === 'WEEKLY' && (
                            <p><strong>Days:</strong> {template.daysOfWeek.join(', ')}</p>
                          )}
                          <p><strong>Time Slots:</strong> {(template.timeSlots||[]).map(slot => `${slot.startTime} - ${slot.endTime}`).join(', ')}</p>
                          {template.description && <p><strong>Description:</strong> {template.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No availability templates created yet</p>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Availability Exceptions</h2>
                      <p className="text-sm text-gray-600">Manage special dates and time changes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExceptionForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exception
                  </button>
                </div>

                {exceptions.length > 0 ? (
                  <div className="space-y-4">
                    {(exceptions || []).map((exception) => (
                      <div key={exception.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{exception.date}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              exception.exceptionType === 'UNAVAILABLE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {exception.exceptionType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => editException(exception)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteException(exception.id!)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {exception.exceptionType === 'CUSTOM_HOURS' && exception.timeSlots && (
                            <p><strong>Time Slots:</strong> {(exception.timeSlots || []).map(slot => `${slot.startTime} - ${slot.endTime}`).join(', ')}</p>
                          )}
                          {exception.reason && <p><strong>Reason:</strong> {exception.reason}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No availability exceptions created yet</p>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Regenerate All Slots</h3>
                    <p className="text-sm text-gray-600">Regenerate all availability slots based on your current templates and exceptions</p>
                  </div>
                  <button
                    onClick={handleRegenerateSlots}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Regenerating...' : 'Regenerate Slots'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Schedule Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot Duration (minutes)
                  </label>
                  <select
                    className="form-input"
                    value={settings.slotDurationMinutes}
                    onChange={(e) => setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })}
                    disabled={loading}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buffer Time (minutes)
                  </label>
                  <select
                    className="form-input"
                    value={settings.bufferTimeMinutes}
                    onChange={(e) => setSettings({ ...settings, bufferTimeMinutes: Number(e.target.value) })}
                    disabled={loading}
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Advance Booking Days
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.advanceBookingDays}
                    onChange={(e) => setSettings({ ...settings, advanceBookingDays: Number(e.target.value) })}
                    min={1}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={settings.autoApprove}
                    onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <label htmlFor="autoApprove" className="text-sm font-medium text-gray-700">
                    Auto-approve appointments
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowOverbooking"
                    checked={settings.allowOverbooking}
                    onChange={(e) => setSettings({ ...settings, allowOverbooking: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <label htmlFor="allowOverbooking" className="text-sm font-medium text-gray-700">
                    Allow overbooking
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Notification Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Get text messages for urgent updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Security Settings</h2>
              </div>
              <div className="制造-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input type="password" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input type="password" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input type="password" className="form-input" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            <Save className="w-5 h-5" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        {showTemplateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h3>
                <button
                  onClick={() => {
                    setShowTemplateForm(false);
                    setEditingTemplate(null);
                    resetTemplateForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={templateForm.name||""}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g., Regular Hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Type
                  </label>
                  <select
                    className="form-input"
                    value={templateForm.templateType}
                    onChange={(e) => setTemplateForm({ ...templateForm, templateType: e.target.value as 'DAILY' | 'WEEKLY' | 'CUSTOM' })}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                {templateForm.templateType === 'WEEKLY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {(daysOfWeek||[]).map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`p-2 text-sm rounded border ${
                            (templateForm.daysOfWeek||[]).includes(day)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {dayLabels[index]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slots
                  </label>
                  <div className="space-y-2">
                    {(templateForm.timeSlots||[]).map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="time"
                          className="form-input"
                          value={slot.startTime||""}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value, true)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          className="form-input"
                          value={slot.endTime||""}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value, true)}
                        />
                        {templateForm.timeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index, true)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTimeSlot(true)}
                      className="flex items-center gap-2 text-primary hover:text-primary-dark"
                    >
                      <Plus className="w-4 h-4" />
                      Add Time Slot
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    className="form-input"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    placeholder="Brief description of this template..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="templateActive"
                    checked={templateForm.isActive}
                    onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="templateActive" className="ml-2 text-sm text-gray-700">
                    Active Template
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplateForm(false);
                    setEditingTemplate(null);
                    resetTemplateForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="btn-primary"
                  disabled={loading || !templateForm.name}
                >
                  {loading ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showExceptionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingException ? 'Edit Exception' : 'Create Exception'}
                </h3>
                <button
                  onClick={() => {
                    setShowExceptionForm(false);
                    setEditingException(null);
                    resetExceptionForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={exceptionForm.date||""}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exception Type
                  </label>
                  <select
                    className="form-input"
                    value={exceptionForm.exceptionType}
                    onChange={(e) => setExceptionForm({ 
                      ...exceptionForm, 
                      exceptionType: e.target.value as 'UNAVAILABLE' | 'CUSTOM_HOURS',
                      timeSlots: e.target.value === 'UNAVAILABLE' ? [] : exceptionForm.timeSlots
                    })}
                  >
                    <option value="UNAVAILABLE">Unavailable</option>
                    <option value="CUSTOM_HOURS">Custom Hours</option>
                  </select>
                </div>

                {exceptionForm.exceptionType === 'CUSTOM_HOURS' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slots
                    </label>
                    <div className="space-y-2">
                      {(exceptionForm.timeSlots || []).map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="time"
                            className="form-input"
                            value={slot.startTime||""}
                            onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value, false)}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            className="form-input"
                            value={slot.endTime||""}
                            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value, false)}
                          />
                          {(exceptionForm.timeSlots || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index, false)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTimeSlot(false)}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark"
                      >
                        <Plus className="w-4 h-4" />
                        Add Time Slot
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (Optional)
                  </label>
                  <textarea
                    className="form-input"
                    value={exceptionForm.reason}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                    placeholder="Reason for this exception..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowExceptionForm(false);
                    setEditingException(null);
                    resetExceptionForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveException}
                  className="btn-primary"
                  disabled={loading || !exceptionForm.date}
                >
                  {loading ? 'Saving...' : editingException ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DoctorSettings;