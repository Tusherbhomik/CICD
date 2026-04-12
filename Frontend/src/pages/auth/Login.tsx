import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from '@/lib/api-client';
import { Heart, Stethoscope, Shield, Activity } from 'lucide-react';

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
      const response = await authApi.login(email, password, role);
      localStorage.setItem('userRole', response.user.role.toLowerCase());
      toast({ title: "Login successful", description: "Redirecting to your dashboard..." });
      if (response.user.role.toLowerCase() === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ title: "Login failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-blue-900 to-medical-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-medical-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">HealthSync</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Healthcare Made<br />
              <span className="text-blue-300">Digital & Simple</span>
            </h2>
            <p className="text-blue-200/80 text-lg leading-relaxed">
              Connect with doctors, manage prescriptions, and track your health journey — all in one secure platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Stethoscope, text: "Digital prescriptions with full medicine details" },
              { icon: Activity, text: "Real-time appointment booking & tracking" },
              { icon: Shield, text: "HIPAA-inspired secure health data management" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-blue-300" />
                </div>
                <span className="text-blue-100/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "500+", label: "Doctors" },
            { value: "10K+", label: "Patients" },
            { value: "50K+", label: "Prescriptions" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-blue-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Mobile header */}
        <header className="lg:hidden h-16 flex items-center px-6 bg-white border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-medical-primary">HealthSync</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
              <p className="text-slate-500">Sign in to your account to continue</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role selection */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">I am a:</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={setRole}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: "patient", label: "Patient", icon: "🏥" },
                      { value: "doctor",  label: "Doctor",  icon: "👨‍⚕️" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          role === opt.value
                            ? "border-medical-primary bg-blue-50 text-medical-primary"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                        <span className="text-xl">{opt.icon}</span>
                        <span className="font-medium text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 border-slate-200 focus:border-medical-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <Link to="/forgot-password" className="text-xs text-medical-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 border-slate-200 focus:border-medical-primary"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-medical-primary to-medical-secondary hover:from-medical-secondary hover:to-medical-primary text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-medical-primary hover:underline font-medium">
                    Create one
                  </Link>
                </p>
              </div>
            </div>

            {/* Admin Access */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-50 text-slate-400">Administrative Access</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
