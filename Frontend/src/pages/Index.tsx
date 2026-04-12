import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Heart, Stethoscope, FileText, Calendar, Shield,
  ArrowRight, Activity, Users, Clock, Star,
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center shadow-md">
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
              HealthSync
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-medical-primary">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-gradient-to-r from-medical-primary to-medical-secondary hover:opacity-90 text-white shadow-md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-medical-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-blue-300 text-sm mb-8 backdrop-blur">
                <Activity className="w-3.5 h-3.5" />
                Trusted by 500+ Healthcare Professionals
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Modern Healthcare
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">
                  Management Platform
                </span>
              </h1>
              <p className="text-lg text-blue-100/70 leading-relaxed mb-8 max-w-lg">
                Connect doctors and patients seamlessly. Write digital prescriptions, book appointments,
                and manage healthcare records — all in one secure platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-medical-primary to-blue-400 hover:opacity-90 text-white font-semibold shadow-xl shadow-blue-500/25 px-8">
                    Start Free Today
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-white/5 backdrop-blur px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users,       label: "Active Doctors",    value: "500+",  color: "from-blue-500 to-indigo-500" },
                { icon: Activity,    label: "Patients Served",   value: "10K+",  color: "from-emerald-500 to-teal-500" },
                { icon: FileText,    label: "Prescriptions",     value: "50K+",  color: "from-purple-500 to-pink-500" },
                { icon: Star,        label: "Satisfaction Rate",  value: "98%",   color: "from-amber-500 to-orange-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-blue-200/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              HealthSync brings together doctors and patients with a comprehensive set of tools for modern healthcare management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Stethoscope,
                title: "For Doctors",
                desc: "Create digital prescriptions, manage patient records, schedule appointments, and track patient history with ease.",
                gradient: "from-indigo-500 to-blue-500",
                bg: "bg-indigo-50",
              },
              {
                icon: Heart,
                title: "For Patients",
                desc: "Access all your prescriptions, book appointments with top doctors, receive reminders, and track your health journey.",
                gradient: "from-emerald-500 to-teal-500",
                bg: "bg-emerald-50",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your medical data is encrypted and protected. Only authorized healthcare providers and you can access your information.",
                gradient: "from-purple-500 to-pink-500",
                bg: "bg-purple-50",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-500">Get started in just a few simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Users,    title: "Create Account", desc: "Sign up as a doctor or patient in under 2 minutes" },
              { step: "02", icon: Calendar, title: "Book Appointment", desc: "Search doctors and book your preferred time slot" },
              { step: "03", icon: Clock,    title: "Meet Your Doctor", desc: "Attend in-person, video, or phone consultations" },
              { step: "04", icon: FileText, title: "Get Prescription", desc: "Receive digital prescriptions with full instructions" },
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-medical-primary/30 to-transparent" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-2xl shadow-lg mb-4">
                  <step.icon className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {step.step.slice(1)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-950 via-blue-900 to-medical-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your healthcare experience?
          </h2>
          <p className="text-xl text-blue-200/70 mb-10">
            Join thousands of doctors and patients already using HealthSync for better healthcare management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-medical-primary hover:bg-blue-50 font-semibold shadow-xl px-8">
                Create Free Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">HealthSync</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 HealthSync. Built as a capstone project for digital healthcare management.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/admin/login" className="hover:text-slate-300 transition-colors">Admin</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
