import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, CalendarCheck, Clock, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
          <Link href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex font-medium">Log in</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 px-6 lg:px-14 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              <span className="flex w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
              Smart Queue Management
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Modernizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Patient Flow</span> <br className="hidden md:block" /> for Clinics.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed">
              HealthDesk is an intelligent appointment and physical check-in system. Ensure zero waiting room chaos with live FCFS queues and smart no-show handling.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 text-white rounded-full transition-all">
                  Book an Appointment
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full">
                  Clinic Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white px-6 lg:px-14 border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Why choose HealthDesk?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Designed to make hospital and clinic visits seamless for both patients and healthcare providers.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Live FCFS Queues</h3>
                <p className="text-slate-600 leading-relaxed">
                  Booking a slot is just step one. Physical check-in via QR code places patients in a truly fair, live first-come-first-serve queue.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                  <CalendarCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart No-Show Handling</h3>
                <p className="text-slate-600 leading-relaxed">
                  Automatic reminders via SMS/WhatsApp. If a patient doesn't arrive by the deadline, their slot automatically frees up for walk-ins.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Priority Slots</h3>
                <p className="text-slate-600 leading-relaxed">
                  Designated emergency and priority slots every hour to handle urgent cases without disrupting the regular flow.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold tracking-tight text-white">HealthDesk</span>
          </div>
          <p className="text-sm">© 2026 HealthDesk Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
