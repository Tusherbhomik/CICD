import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';
import { API_BASE_URL } from '../../url';

const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') setPasswordStrength(validatePassword(value));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!email.trim()) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (passwordStrength < 3) return 'Password is too weak. Include uppercase, lowercase, numbers, and special characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError, variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone.trim() || undefined,
          adminLevel: 'ROOT_ADMIN',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Setup failed');

      const adminData = {
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email,
        adminLevel: data.admin.adminLevel,
        status: data.admin.status,
        canManageAdmins: true,
        lastLogin: null,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('adminData', JSON.stringify(adminData));

      toast({
        title: 'Setup Complete!',
        description: `Root Administrator account created successfully. Welcome, ${data.admin.name}!`,
      });
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (error: unknown) {
      let title = 'Setup Failed';
      let description = 'An unexpected error occurred';

      if (error instanceof Error) {
        description = error.message;

        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          title = 'Email Already Registered';
          description = 'This email is already registered. Use a different email or log in.';
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          title = 'Invalid Input';
          description = 'Please check your input and try again.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          title = 'Connection Error';
          description = 'Unable to connect to the server. Check your internet.';
        }
      }

      toast({ title, description, variant: 'destructive' });
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const getPasswordRequirements = () => {
    const { password } = formData;
    return [
      { text: 'At least 8 characters', met: password.length >= 8 },
      { text: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'Lowercase letter', met: /[a-z]/.test(password) },
      { text: 'Number', met: /[0-9]/.test(password) },
      { text: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] flex flex-col">
      <header className="h-20 flex items-center justify-between px-8 border-b bg-white">
        <Link to="/" className="flex items-center gap-2">
          <svg className="h-8 w-8 text-medical-primary" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8z" fill="currentColor" />
            <path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9" />
          </svg>
          <span className="text-2xl font-bold text-medical-primary">MedScribe</span>
        </Link>
        <div className="text-sm text-gray-500">System Setup</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">System Setup</h1>
            <p className="text-gray-600 mt-2">Create your Root Administrator account</p>
            <p className="text-sm text-gray-500 mt-1">Step 1 of 1 - Initial Configuration</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Welcome to MedScribe</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You're setting up the first administrator account with full system access.
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="mb-4">
                <Label htmlFor="name" className="block font-medium mb-2">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="email" className="block font-medium mb-2">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="phone" className="block font-medium mb-2">Phone Number <span className="text-gray-500">(optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="password" className="block font-medium mb-2">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a secure password"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs space-y-1">
                      {getPasswordRequirements().map((req, index) => (
                        <div key={index} className={`flex items-center ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {req.met ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                          {req.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <Label htmlFor="confirmPassword" className="block font-medium mb-2">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Passwords do not match
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting Up...
                  </div>
                ) : (
                  'Create Root Administrator'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/admin/login" className="text-medical-primary hover:underline font-medium">Sign in here</Link>
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-amber-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-amber-800">Important</h3>
                <p className="text-sm text-amber-700 mt-1">
                  This account will have full system access. Keep your credentials secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSetup;