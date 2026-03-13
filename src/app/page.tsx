import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, CalendarCheck, Clock, ShieldCheck, Users, Zap, Search, Layout } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <header className="px-6 lg:px-20 h-24 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-1 bg-black rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-zinc-900">Doctors</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-[13px] font-bold text-black hover:text-zinc-600 transition-colors">Home</Link>
          <Link href="#" className="text-[13px] font-bold text-black hover:text-zinc-600 transition-colors">Doctors</Link>
          <Link href="#" className="text-[13px] font-bold text-black hover:text-zinc-600 transition-colors">Appointments</Link>
          <Link href="#" className="text-[13px] font-bold text-black hover:text-zinc-600 transition-colors">Hospitals</Link>
          <Link href="#" className="text-[13px] font-bold text-black hover:text-zinc-600 transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-[13px] font-bold text-black hover:bg-zinc-50">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-black text-white hover:bg-zinc-800 font-bold px-6 h-11 rounded-xl text-[13px] transition-all active:scale-95 shadow-sm">
              Get Appointment
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-20 pt-20 pb-0 max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl lg:text-[3.2rem] font-bold tracking-tight text-black leading-[1.15] mb-6 max-w-4xl">
            Book smarter. Skip the waiting room.<br/>
            Your doctor, scheduled instantly.
          </h1>

          <p className="max-w-2xl text-[14px] text-zinc-500 font-medium leading-relaxed mb-8">
            Find verified doctors, book time slots, and manage appointments in seconnds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <Link href="/login">
              <Button className="bg-black text-white hover:bg-zinc-800 font-bold px-10 h-14 rounded-lg text-md shadow-sm">
                Book Appointment
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-zinc-200 border text-black hover:bg-zinc-50 font-bold px-10 h-14 rounded-lg text-md">
                Find Doctors
              </Button>
            </Link>
          </div>

          {/* Hero Illustrations - Background removed versions */}
          <div className="w-full flex items-end justify-between px-4 mt-2 overflow-hidden">
             <div className="w-[42%]">
                <img 
                  src="/6 copy.png" 
                  alt="Doctor Illustration" 
                  className="w-full h-auto object-contain animate-reveal" 
                />
             </div>
             <div className="w-[42%]">
                <img 
                  src="/7 copy.png" 
                  alt="Patient Illustration" 
                  className="w-full h-auto object-contain animate-reveal" 
                  style={{ animationDelay: '150ms' }}
                />
             </div>
          </div>
        </section>

        {/* Toolkit Section */}
        <section className="bg-zinc-50/30 border-t border-zinc-100 py-32 px-6 lg:px-20">
           <div className="max-w-6xl mx-auto">
              <div className="inline-block px-4 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
                 The Toolkit
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-black mb-20 max-w-xl leading-[1.1]">
                 Tools that move as fast as you do.
              </h2>

              <div className="grid md:grid-cols-3 gap-16">
                 <div className="space-y-6 group">
                    <div className="w-12 h-12 rounded-2xl border-2 border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all">
                       <Zap className="w-5 h-5 text-black group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Instant Check-in</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                       Patients arrive, scan, and join the queue in 2 seconds. No more spreadsheets or manual entries.
                    </p>
                 </div>
                 <div className="space-y-6 group">
                    <div className="w-12 h-12 rounded-2xl border-2 border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all">
                       <Layout className="w-5 h-5 text-black group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Queue Transparency</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                       Patients track their position live on their phones. Reduces anxiety and receptionist overhead.
                    </p>
                 </div>
                 <div className="space-y-6 group">
                    <div className="w-12 h-12 rounded-2xl border-2 border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all">
                       <Search className="w-5 h-5 text-black group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Smart Discovery</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                       Easily find and book slots that fit your schedule. Real-time availability at your fingertips.
                    </p>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-20 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-black rounded">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-black">HealthDesk</span>
          </div>
          <div className="flex gap-10 text-sm font-bold text-zinc-400">
             <Link href="#" className="hover:text-black">Privacy</Link>
             <Link href="#" className="hover:text-black">Terms</Link>
             <Link href="#" className="hover:text-black">Feedback</Link>
          </div>
          <p className="text-xs font-bold text-zinc-300">© 2026 HealthDesk Inc.</p>
        </div>
      </footer>
    </div>
  );
}
