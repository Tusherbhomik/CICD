import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from '@/lib/api-client';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Login and get response with user data (cookie is set automatically by browser)
    const response = await authApi.login(email, password, role);

    // Store user role for routing (only store role, not token)
    localStorage.setItem('userRole', response.user.role.toLowerCase());

    toast({
      title: "Login successful",
      description: "Redirecting you to your dashboard...",
    });

    // Route based on user role from the login response
    if (response.user.role.toLowerCase() === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  } catch (error: unknown) {
    // Type guard to safely access error.message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    toast({
      title: "Login failed",
      description: errorMessage,
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
  
  return (
    <div className="min-h-screen bg-[#f7fbff] flex flex-col">
      {/* Minimal header */}
      <header className="h-20 flex items-center justify-between px-8 border-b bg-white">
        <Link to="/" className="flex items-center gap-2">
          {/* You can replace the SVG below with your logo if you have one */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-medical-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8z" fill="currentColor"/><path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9"/></svg>
          <span className="text-2xl font-bold text-medical-primary">MedScribe</span>
        </Link>
      </header>
      {/* Login form content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Log in to access your account</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <Label htmlFor="role" className="block font-medium mb-2">
                  I am a:
                </Label>
                <RadioGroup 
                  id="role" 
                  value={role} 
                  onValueChange={setRole} 
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor">Doctor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient">Patient</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="mb-4">
                <Label htmlFor="email" className="block font-medium mb-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password" className="block font-medium">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-sm text-medical-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-medical-primary hover:bg-medical-secondary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-medical-primary hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
          
          {/* Admin Access Section */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#f7fbff] text-gray-500">or</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Are you an admin?</p>
              <Link 
                to="/admin/login" 
                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;