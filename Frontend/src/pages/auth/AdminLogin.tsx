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
      navigate('/admin/');
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking system setup...</p>
        </div>
      </div>
    );
  }

  if (needsRootAdminSetup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">System Setup Required</h1>
            <p className="text-slate-400 mb-6">No administrators found. Set up the first ROOT_ADMIN account to get started.</p>
            <Button onClick={() => navigate('/admin/setup')} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              Set Up Root Administrator
            </Button>
            <div className="mt-4">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back to main site</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-red-950 via-rose-900 to-red-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-red-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">HealthSync Admin</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Restricted Access</h2>
          <p className="text-red-200/70 leading-relaxed">
            This portal is exclusively for authorized HealthSync administrators. All access attempts are logged and monitored.
          </p>
        </div>
        <div className="relative z-10 text-xs text-red-300/40">
          All login attempts are monitored and recorded for security purposes.
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">HealthSync Admin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Administrator Login</h1>
            <p className="text-slate-400">Authorized personnel only</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-300 mb-1.5 block">
                  Email Address
                </Label>
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@healthsync.com"
                  required disabled={isSubmitting}
                  className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300">Password</Label>
                  <Link to="/admin/forgot-password" className="text-xs text-red-400 hover:text-red-300">Forgot?</Link>
                </div>
                <Input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required disabled={isSubmitting}
                  className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="rememberMe" type="checkbox" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500"
                />
                <Label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer">
                  Keep me signed in for 30 days
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Authenticating...
                  </div>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 space-y-2 text-center text-sm">
              <p className="text-slate-500">
                Need admin access?{' '}
                <Link to="/admin/signup" className="text-red-400 hover:text-red-300 font-medium">Request here</Link>
              </p>
              <p className="text-slate-600">
                <Link to="/login" className="hover:text-slate-400 transition-colors">← Back to user login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;