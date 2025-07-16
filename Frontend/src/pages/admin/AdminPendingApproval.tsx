import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { API_BASE_URL } from '../../url';

const AdminPendingApproval = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { name, email, adminLevel } = location.state || {};

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/status?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to check status');
        if (data.status === 'ACTIVE') {
          toast({
            title: 'Account Approved!',
            description: 'Your account has been approved. You can now log in.',
          });
          setTimeout(() => navigate('/admin/login'), 1500);
        }
      } catch (error: unknown) { // Changed from 'error: any' to 'error: Error'
        console.error('Status check failed:', error);
        
      }
    };

    if (email) {
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [email, navigate, toast]);

  return (
    <div className="min-h-screen bg-[#f7fbff] flex flex-col">
      <header className="h-20 flex items-center justify-between px-8 border-b bg-white">
        <Link to="/" className="flex items-center gap-2">
          <svg className="h-8 w-8 text-medical-primary" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8z" fill="currentColor"/>
            <path d="M13 7h-2v6h6v-2h-4z" fill="#0ea5e9"/>
          </svg>
          <span className="text-2xl font-bold text-medical-primary">MedScribe</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="text-medical-primary hover:underline">Admin Login</Link>
          <Link to="/login" className="text-gray-500 hover:text-gray-700">User Login</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Approval</h1>
            <p className="text-gray-600 mt-2">Your administrator account is under review</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Thank you, {name || 'Administrator'}, for registering as a{' '}
                {adminLevel ? adminLevel.toLowerCase().replace('_', ' ') : 'administrator'}.
              </p>
              <p className="text-gray-600 mb-6">
                Your account ({email || 'your email'}) is pending approval by a Root Administrator. You will receive an email notification once your account is approved.
              </p>
              <Button
                onClick={() => navigate('/admin/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Login
              </Button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">What to expect</h3>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>Your account status is checked every 30 seconds</li>
                  <li>You’ll be redirected to login upon approval</li>
                  <li>Contact support if approval takes too long</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPendingApproval;