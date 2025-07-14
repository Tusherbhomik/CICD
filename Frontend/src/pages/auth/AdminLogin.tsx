import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';
import { API_BASE_URL } from '../../url';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [needsRootAdminSetup, setNeedsRootAdminSetup] = useState(false);

  const redirectToAppropriateView = useCallback((adminData: {
    status: string;
  }) => {
    if (adminData.status === 'PENDING_APPROVAL') {
      navigate('/admin/pending-approval');
    } else if (adminData.status === 'SUSPENDED') {
      navigate('/admin/suspended');
    } else {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const checkSystemSetup = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/root-exists`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to check root admin');
      const rootExists = await response.json();
      setNeedsRootAdminSetup(!rootExists);
    } catch (error) {
      toast({
        title: 'System Check Failed',
        description: 'Unable to verify system setup.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingSetup(false);
    }
  }, [toast]);

  useEffect(() => {
    // Clear any existing admin data on component mount
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminJwtToken'); // Also clear JWT token
    
    const adminData = JSON.parse(localStorage.getItem('adminData') || 'null');
    if (adminData) {
      toast({ title: 'Already Logged In', description: `Welcome back, ${adminData.name}!` });
      redirectToAppropriateView(adminData);
      return;
    }
    checkSystemSetup();
  }, [toast, redirectToAppropriateView, checkSystemSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      console.log('🔄 Attempting admin login for:', email);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      console.log('📥 Login response status:', response.status);
      
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // ✅ CRITICAL: Save JWT token from response
      const jwtToken = data.token;
      if (!jwtToken) {
        console.warn('⚠️ No JWT token in login response');
        throw new Error('Login response missing authentication token');
      }

      console.log('✅ Login successful:', {
        adminId: data.admin.id,
        adminLevel: data.admin.adminLevel,
        hasToken: !!jwtToken
      });

      // Create admin data object with JWT token included
      const adminData = {
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email,
        adminLevel: data.admin.adminLevel,
        status: data.admin.status,
        canManageAdmins: data.admin.canManageAdmins,
        lastLogin: data.admin.lastLogin,
        loginTime: data.loginTime,
        token: jwtToken, // ✅ Add JWT token to admin data
      };

      // ✅ CRITICAL: Save both admin data and JWT token to localStorage
      localStorage.setItem('adminData', JSON.stringify(adminData));
      localStorage.setItem('adminJwtToken', jwtToken);

      console.log('💾 Saved to localStorage:', {
        adminData: localStorage.getItem('adminData') ? 'Saved' : 'Failed',
        jwtToken: localStorage.getItem('adminJwtToken') ? 'Saved' : 'Failed'
      });

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.admin.name}! Redirecting...`,
      });
      
      setTimeout(() => redirectToAppropriateView(adminData), 1000);
      
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      
      let title = 'Login Failed';
      let description = 'An unexpected error occurred';
      let clearPassword = true;

      if (error instanceof Error) {
        description = error.message;

        if (error.message.includes('locked')) {
          title = 'Account Locked';
          description = 'Account locked due to multiple failed attempts. Try again in 2 hours.';
        } else if (error.message.includes('not active') || error.message.includes('inactive')) {
          title = 'Account Inactive';
          description = 'Your account is not active. Contact your administrator.';
        } else if (error.message.includes('pending approval')) {
          title = 'Account Pending Approval';
          description = 'Your account is pending approval. Please wait or contact support.';
        } else if (error.message.includes('suspended')) {
          title = 'Account Suspended';
          description = 'Your account is suspended. Contact your administrator.';
        } else if (error.message.includes('Invalid email or password')) {
          title = 'Invalid Credentials';
          description = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          title = 'Connection Error';
          description = 'Unable to connect to the server. Check your internet.';
          clearPassword = false;
        }
      }

      toast({ title, description, variant: 'destructive' });
      if (clearPassword) setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking system setup...</p>
        </div>
      </div>
    );
  }

  if (needsRootAdminSetup) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">System Setup Required</h1>
            <p className="text-gray-600 mb-6">No administrators found. Set up the first ROOT_ADMIN account.</p>
            <Button onClick={() => navigate('/admin/setup')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Set Up Root Administrator
            </Button>
            <div className="mt-4">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to main site</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] flex flex-col">
      <header className="h-20 flex items-center justify-between px-8 border-b bg-white">
        <Link to="/" className="flex items-center gap-2">
          <svg className="h-8 w-8 text-medical-primary" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" />
            <path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9" />
          </svg>
          <span className="text-2xl font-bold text-medical-primary">MedScribe</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-medical-primary hover:underline">User Login</Link>
          <Link to="/help" className="text-gray-500 hover:text-gray-700">Help</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Administrator Access</h1>
            <p className="text-gray-600 mt-2">Secure login for authorized personnel</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="mb-4">
                <Label htmlFor="email" className="block font-medium mb-2">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="block font-medium">Password</Label>
                  <Link to="/admin/forgot-password" className="text-sm text-medical-primary hover:underline">Forgot password?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">Keep me signed in for 30 days</Label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-sm">
                Don't have an admin account?{' '}
                <Link to="/admin/signup" className="text-medical-primary hover:underline font-medium">Request admin access</Link>
              </p>
              <p className="text-gray-600 text-sm">
                Need user access?{' '}
                <Link to="/login" className="text-gray-500 hover:underline">Go to user login</Link>
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a restricted access area. All login attempts are monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;