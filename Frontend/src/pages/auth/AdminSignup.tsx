import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const AdminSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminLevel: 'ADMIN'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (passwordStrength < 3) return "Password is too weak. Include uppercase, lowercase, numbers, and special characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/admin/signup', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone.trim() || undefined,
          adminLevel: formData.adminLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (data.requiresApproval) {
        toast({
          title: "Account Created Successfully!",
          description: `Your ${formData.adminLevel.toLowerCase().replace('_', ' ')} account has been created and is pending approval from a Root Administrator.`,
        });
        setTimeout(() => {
          navigate('/admin/pending-approval', {
            state: {
              email: data.admin.email,
              name: data.admin.name,
              adminLevel: data.admin.adminLevel,
            },
          });
        }, 2000);
      } else {
        toast({
          title: "Account Created!",
          description: `Your ${formData.adminLevel.toLowerCase().replace('_', ' ')} account has been created successfully.`,
        });
        setTimeout(() => {
          navigate('/admin/login', {
            state: {
              message: "Account created successfully! You can now log in.",
              email: data.admin.email,
            },
          });
        }, 2000);
      }

      console.log('Admin signup successful:', {
        adminId: data.admin.id,
        adminLevel: data.admin.adminLevel,
        status: data.admin.status,
        requiresApproval: data.requiresApproval,
      });
    } catch (error) {
      console.error('Admin signup error:', error);
      // Type guard to check if error is an instance of Error
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      let toastTitle = "Signup Failed";
      let toastDescription = errorMessage;

      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        toastTitle = "Email Already Registered";
        toastDescription = "This email address is already registered. Please use a different email or try logging in.";
      } else if (errorMessage.includes('password') && errorMessage.includes('match')) {
        toastTitle = "Password Mismatch";
        toastDescription = "Password and confirm password do not match.";
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        toastTitle = "Invalid Input";
        toastDescription = "Please check your input and try again.";
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        toastTitle = "Connection Error";
        toastDescription = "Unable to connect to the server. Please check your internet connection and try again.";
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#f7fbff] flex flex-col">
      <header className="h-20 flex items-center justify-between px-8 border-b bg-white">
        <Link to="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-medical-primary">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8z" fill="currentColor" />
            <path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9" />
          </svg>
          <span className="text-2xl font-bold text-medical-primary">MedScribe</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="text-medical-primary hover:underline">
            Admin Login
          </Link>
          <Link to="/login" className="text-gray-500 hover:text-gray-700">
            User Login
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Registration</h1>
            <p className="text-gray-600 mt-2">Request administrator access</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Approval Required</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Your administrator account will need approval from a Root Administrator before you can access the admin panel.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="mb-4">
                <Label htmlFor="name" className="block font-medium mb-2">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                  autoComplete="name"
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="email" className="block font-medium mb-2">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  autoComplete="username"
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="phone" className="block font-medium mb-2">
                  Phone Number <span className="text-gray-500">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                  autoComplete="tel"
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="adminLevel" className="block font-medium mb-2">
                  Administrator Type *
                </Label>
                <select
                  id="adminLevel"
                  name="adminLevel"
                  value={formData.adminLevel}
                  onChange={(e) => handleInputChange('adminLevel', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="ADMIN">Regular Administrator</option>
                  <option value="SUPPORT_ADMIN">Support Administrator</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.adminLevel === 'ADMIN'
                    ? 'Full administrative access to system management'
                    : 'Customer support and user assistance functions'}
                </p>
              </div>

              <div className="mb-4">
                <Label htmlFor="password" className="block font-medium mb-2">
                  Password *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a secure password"
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <Label htmlFor="confirmPassword" className="block font-medium mb-2">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  className="w-full"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Request Admin Access"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an admin account?{" "}
                <Link to="/admin/login" className="text-medical-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Your account will be created with "Pending Approval" status</li>
                  <li>• A Root Administrator will review and approve your request</li>
                  <li>• You'll receive email notification when approved</li>
                  <li>• Once approved, you can log in with your credentials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSignup;