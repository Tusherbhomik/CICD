import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from '@/lib/api-client';
import { Heart, CheckCircle, Shield } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'PATIENT', birthDate: '', gender: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!formData.name || !formData.email || !formData.password || !formData.birthDate || !formData.gender) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authApi.register({
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, role: formData.role, birthDate: formData.birthDate, gender: formData.gender,
      });
      localStorage.setItem('userRole', response.role.toLowerCase());
      toast({ title: "Account created!", description: "Welcome to HealthSync!" });
      if (response.role.toLowerCase() === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ title: "Registration failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-950 via-teal-900 to-teal-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">HealthSync</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Join the Future<br />
              <span className="text-emerald-300">of Healthcare</span>
            </h2>
            <p className="text-emerald-100/70 text-lg">
              Create your account and experience seamless digital healthcare management.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "Free account creation — no credit card needed",
              "Secure & private health data storage",
              "Instant access to digital prescriptions",
              "Real-time appointment scheduling",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-100/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-emerald-300/60">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-300 hover:text-white font-medium underline">
            Sign in here
          </Link>
        </div>
      </div>

      {/* Right Panel — Sign Up Form */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
        {/* Mobile header */}
        <header className="lg:hidden h-16 flex items-center px-6 bg-white border-b border-slate-200 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-medical-primary">HealthSync</span>
          </Link>
        </header>

        <main className="flex-1 flex items-start justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg py-4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Create Your Account</h1>
              <p className="text-slate-500">Join HealthSync to manage your healthcare digitally</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">I am joining as:</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange('role', value)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: "PATIENT", label: "Patient",  icon: "🏥" },
                      { value: "DOCTOR",  label: "Doctor",   icon: "👨‍⚕️" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={`role-${opt.value}`}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.role === opt.value
                            ? "border-medical-primary bg-blue-50 text-medical-primary"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <RadioGroupItem value={opt.value} id={`role-${opt.value}`} className="sr-only" />
                        <span className="text-xl">{opt.icon}</span>
                        <span className="font-medium text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* 2-col grid for some fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange}
                      placeholder="Your full name" required className="h-10 border-slate-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                      placeholder="you@example.com" required className="h-10 border-slate-200" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+880..." className="h-10 border-slate-200" />
                  </div>
                  <div>
                    <Label htmlFor="birthDate" className="text-sm font-medium text-slate-700 mb-1.5 block">Birth Date *</Label>
                    <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange}
                      required className="h-10 border-slate-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-slate-700 mb-1.5 block">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 mb-1.5 block">Password *</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange}
                      placeholder="Min. 8 characters" required className="h-10 border-slate-200" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 mb-1.5 block">Confirm Password *</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword}
                      onChange={handleChange} placeholder="Repeat password" required className="h-10 border-slate-200" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-medical-primary to-medical-secondary hover:from-medical-secondary hover:to-medical-primary text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-medical-primary hover:underline font-medium">Sign in</Link>
              </div>
            </div>

            {/* Admin link */}
            <div className="mt-5 flex justify-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <Shield className="w-3 h-3" />
                Admin Portal Access
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignUp;
