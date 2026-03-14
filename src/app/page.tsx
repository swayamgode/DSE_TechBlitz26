import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, CalendarCheck, Clock, ShieldCheck, Users, Zap, Search, Layout } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-800 selection:bg-[#137dab]/30 selection:text-[#137dab] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#137dab]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Navbar */}
      <header className="px-6 lg:px-20 h-24 flex items-center justify-between sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-[#137dab]/10 rounded-xl transition-all">
            <Activity className="w-6 h-6 text-[#137dab]" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">HealthDesk</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-[13px] font-bold text-slate-900 hover:text-[#137dab] transition-colors">Home</Link>
          <Link href="#" className="text-[13px] font-bold text-slate-500 hover:text-[#137dab] transition-colors">Doctors</Link>
          <Link href="#" className="text-[13px] font-bold text-slate-500 hover:text-[#137dab] transition-colors">Appointments</Link>
          <Link href="#" className="text-[13px] font-bold text-slate-500 hover:text-[#137dab] transition-colors">Hospitals</Link>
          <Link href="#" className="text-[13px] font-bold text-slate-500 hover:text-[#137dab] transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-[13px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-[#137dab] text-white hover:bg-[#137dab]/90 font-bold px-6 h-11 rounded-xl text-[13px] transition-all shadow-[0_8px_20px_rgba(19,125,171,0.2)] hover:shadow-[0_10px_25px_rgba(19,125,171,0.3)] hover:-translate-y-0.5 active:translate-y-0">
              Get Appointment
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 z-10 relative">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-20 pt-24 pb-0 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-block px-4 py-1.5 bg-[#137dab]/10 backdrop-blur-md text-[#137dab] rounded-full text-[11px] font-black tracking-widest mb-8 border border-[#137dab]/20">
            ✨ NEXT-GEN HEALTHCARE EXPERIENCES
          </div>
          <h1 className="text-4xl lg:text-[4.5rem] font-black tracking-tight text-slate-900 leading-[1.05] mb-8 max-w-4xl drop-shadow-sm">
            Book smarter.<br/>
            Skip the waiting room.
          </h1>

          <p className="max-w-2xl text-[16px] text-slate-600 font-medium leading-relaxed mb-10 text-lg">
            Find verified doctors, book priority time slots, and manage appointments in seconds with our state-of-the-art medical platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-20 animate-reveal">
            <Link href="/login">
              <Button className="bg-[#137dab] text-white hover:bg-[#137dab]/90 font-bold px-10 h-14 rounded-2xl text-md shadow-[0_10px_30px_rgba(19,125,171,0.25)] hover:shadow-[0_15px_40px_rgba(19,125,171,0.35)] transition-all hover:-translate-y-1">
                Book Appointment
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-bold px-10 h-14 rounded-2xl text-md transition-all shadow-sm">
                Find Doctors
              </Button>
            </Link>
          </div>

          {/* Hero Illustrations */}
          <div className="w-full flex items-end justify-between px-4 mt-2 overflow-hidden opacity-90">
             <div className="w-[42%] drop-shadow-xl">
                <img 
                  src="/6 copy.png" 
                  alt="Doctor Illustration" 
                  className="w-full h-auto object-contain animate-reveal mix-blend-multiply" 
                />
             </div>
             <div className="w-[42%] drop-shadow-xl">
                <img 
                  src="/7 copy.png" 
                  alt="Patient Illustration" 
                  className="w-full h-auto object-contain animate-reveal mix-blend-multiply" 
                  style={{ animationDelay: '150ms' }}
                />
             </div>
          </div>
        </section>

        {/* Toolkit Section */}
        <section className="relative bg-white border-t border-slate-200 py-32 px-6 lg:px-20 mt-10 shadow-sm">
           <div className="max-w-6xl mx-auto">
              <div className="inline-block px-4 py-1.5 bg-[#137dab] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
                 The Toolkit
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mb-20 max-w-xl leading-[1.1]">
                 Tools that move as fast as you do.
              </h2>

              <div className="grid md:grid-cols-3 gap-10">
                 <div className="space-y-6 group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:border-[#137dab]/30 hover:bg-white transition-all duration-300 hover:-translate-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#137dab]/10 flex items-center justify-center group-hover:bg-[#137dab] group-hover:scale-110 transition-all duration-300">
                       <Zap className="w-6 h-6 text-[#137dab] group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Instant Check-in</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                       Patients arrive, scan, and join the queue in 2 seconds. No more spreadsheets or manual entries.
                    </p>
                 </div>
                 <div className="space-y-6 group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:border-[#137dab]/30 hover:bg-white transition-all duration-300 hover:-translate-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#137dab]/10 flex items-center justify-center group-hover:bg-[#137dab] group-hover:scale-110 transition-all duration-300">
                       <Layout className="w-6 h-6 text-[#137dab] group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Queue Transparency</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                       Patients track their position live on their phones. Reduces anxiety and receptionist overhead.
                    </p>
                 </div>
                 <div className="space-y-6 group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:border-[#137dab]/30 hover:bg-white transition-all duration-300 hover:-translate-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#137dab]/10 flex items-center justify-center group-hover:bg-[#137dab] group-hover:scale-110 transition-all duration-300">
                       <Search className="w-6 h-6 text-[#137dab] group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Smart Discovery</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                       Easily find and book slots that fit your schedule. Real-time availability at your fingertips.
                    </p>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-16 border-t border-slate-200 bg-white z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#137dab]/10 rounded-lg">
              <Activity className="w-5 h-5 text-[#137dab]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">HealthDesk</span>
          </div>
          <div className="flex gap-10 text-sm font-bold text-slate-500">
             <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Feedback</Link>
          </div>
          <p className="text-xs font-bold text-slate-400">© 2026 HealthDesk Inc.</p>
        </div>
      </footer>
    </div>
  );
}
