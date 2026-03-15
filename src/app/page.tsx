import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  ArrowRight, 
  CalendarCheck, 
  Clock, 
  ShieldCheck, 
  Users, 
  Zap, 
  Search, 
  Layout, 
  CheckCircle2, 
  Globe, 
  Lock,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  UserPlus,
  MoreHorizontal,
  Bell,
  SearchIcon,
  Plus
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-slate-900 selection:bg-[#137dab]/20 selection:text-[#137dab]">
      {/* Navbar */}
      <nav className="px-6 lg:px-20 h-16 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#137dab]/10 rounded-lg">
            <Activity className="w-4 h-4 text-[#137dab]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <Link href="#" className="text-[13px] font-semibold text-slate-500 hover:text-[#137dab] transition-colors">Products</Link>
          <Link href="#" className="text-[13px] font-semibold text-slate-500 hover:text-[#137dab] transition-colors">Practitioners</Link>
          <Link href="#" className="text-[13px] font-semibold text-slate-500 hover:text-[#137dab] transition-colors">Pricing</Link>
          <Link href="#" className="text-[13px] font-semibold text-slate-500 hover:text-[#137dab] transition-colors">Resources</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-[13px] font-bold text-slate-600 hover:text-slate-900 h-9 px-4">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-[#137dab] text-white hover:bg-[#137dab]/90 font-bold px-5 h-9 rounded-lg text-[13px] shadow-sm transition-all hover:-translate-y-0.5">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative px-6 lg:px-20 pt-16 pb-24 max-w-7xl mx-auto grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#137dab]/5 text-[#137dab] rounded-full text-[12px] font-bold mb-6 border border-[#137dab]/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#137dab] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#137dab]"></span>
              </span>
              Modern Healthcare OS
            </div>
            <h1 className="text-4xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Smarter care,<br/>
              delivered <br/>
              <span className="text-[#137dab]">instantaneously.</span>
            </h1>
            <p className="text-[16px] text-slate-500 font-medium leading-relaxed mb-8 max-w-md">
              A seamless operating system for clinic check-ins, live queue tracking, and secure medical records. Perfect for modern clinics.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12">
              <input 
                type="email" 
                placeholder="Work email" 
                className="h-11 px-5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#137dab]/10 w-full sm:w-64 text-[14px]"
              />
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="bg-[#137dab] text-white hover:bg-[#137dab]/90 font-bold px-6 h-11 rounded-xl text-[14px] w-full shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-8 opacity-30 grayscale brightness-0 scale-90 origin-left">
               <div className="font-bold text-lg tracking-tight italic">Klarma.</div>
               <div className="font-bold text-lg tracking-tight lowercase">coinbase</div>
               <div className="font-bold text-lg tracking-tight uppercase">instacart</div>
            </div>
          </div>

          {/* High-Fidelity CSS App Mockup (Replacing Image) */}
          <div className="hidden lg:block relative p-4 animate-reveal">
             <div className="absolute inset-0 bg-[#137dab]/5 rounded-[3rem] blur-3xl opacity-30"></div>
             <div className="relative z-10 w-full aspect-[1.3/1] bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col font-sans group">
                {/* Mockup Sidebar */}
                <div className="flex h-full">
                   <div className="w-14 border-r border-slate-50 flex flex-col items-center py-5 gap-5 bg-slate-50/20">
                      <div className="w-7 h-7 rounded-lg bg-[#137dab] flex items-center justify-center text-white shadow-lg shadow-[#137dab]/20">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      {[Layout, Users, CalendarCheck, ShieldCheck].map((Icon, i) => (
                        <div key={i} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100/50">
                           <Icon className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      ))}
                   </div>
                   <div className="flex-1 flex flex-col">
                      <div className="h-12 border-b border-slate-50 flex items-center justify-between px-6">
                         <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-slate-50 border border-slate-100"></div>
                            <div className="w-5 h-5 rounded-lg bg-slate-50 border border-slate-100"></div>
                         </div>
                      </div>
                      <div className="p-6 space-y-5">
                         <div className="flex justify-between items-center">
                            <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
                            <div className="px-3 py-1 rounded-full bg-[#137dab]/5 text-[10px] font-bold text-[#137dab] border border-[#137dab]/10">Today</div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="h-20 rounded-xl bg-slate-50/50 border border-slate-100 p-4 space-y-3">
                               <div className="flex justify-between">
                                  <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                                  <TrendingUp className="w-3 h-3 text-[#137dab]" />
                               </div>
                               <div className="w-20 h-5 bg-[#137dab]/10 rounded-md"></div>
                            </div>
                            <div className="h-20 rounded-xl bg-slate-50/50 border border-slate-100 p-4 space-y-3">
                               <div className="flex justify-between">
                                  <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                                  <div className="w-3 h-3 rounded-full bg-emerald-500/20"></div>
                               </div>
                               <div className="w-20 h-5 bg-emerald-50 rounded-md"></div>
                            </div>
                         </div>
                         <div className="border border-slate-100 rounded-xl p-4 space-y-4 bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                               <div className="w-24 h-2 bg-slate-100 rounded-full"></div>
                               <MoreHorizontal className="w-4 h-4 text-slate-300" />
                            </div>
                            {[1,2].map(i => (
                              <div key={i} className="flex items-center justify-between group/row">
                                 <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100"></div>
                                    <div className="space-y-1.5">
                                       <div className="w-16 h-2 bg-slate-100 rounded-full group-hover/row:bg-slate-200 transition-colors"></div>
                                       <div className="w-10 h-1 bg-slate-50 rounded-full"></div>
                                    </div>
                                 </div>
                                 <div className="w-10 h-3 bg-emerald-50 text-[8px] font-bold text-emerald-600 rounded flex items-center justify-center">Active</div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
                {/* Floating Micro-UI Component */}
                <div className="absolute top-1/3 left-[60%] w-44 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 animate-reveal scale-90 group-hover:scale-95 transition-transform duration-700">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                      <span className="text-[11px] font-bold text-slate-700">Patient Arrived</span>
                   </div>
                   <div className="space-y-2">
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full w-2/3 bg-emerald-500"></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                         <span>Verification</span>
                         <span>98%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-50/50 py-24 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
             <div className="mb-16 text-center lg:text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#137dab] mb-3">Efficiency</p>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 max-w-lg leading-tight">Grows with your practice.</h2>
             </div>

             <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
                <div className="group space-y-4">
                   <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-[#137dab]/30 transition-colors">
                      <Zap className="w-5 h-5 text-[#137dab]" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">Fast Intake</h3>
                   <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                      Digital registration that cuts wait times by 40% from day one. Say goodbye to clipboards.
                   </p>
                </div>
                <div className="group space-y-4">
                   <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-[#137dab]/30 transition-colors">
                      <Users className="w-5 h-5 text-[#137dab]" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">Team Collaboration</h3>
                   <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                      Dedicated views for everyone. Smooth handoffs between receptionists and doctors.
                   </p>
                </div>
                <div className="group space-y-4">
                   <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-[#137dab]/30 transition-colors">
                      <ShieldCheck className="w-5 h-5 text-[#137dab]" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">HIPAA Secure</h3>
                   <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                      Enterprise-grade encryption and access logs to keep patient data private and secure.
                   </p>
                </div>
             </div>
          </div>
        </section>

        {/* Comparative Section - Abstract UI instead of Image/Icon */}
        <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <p className="text-[11px] font-bold text-[#137dab] uppercase tracking-widest mb-3">Social Proof</p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Proven by modern clinics.</h2>
           </div>

           <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-900 p-10 lg:p-12 rounded-3xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="text-5xl lg:text-6xl font-bold text-[#137dab] leading-none mb-4">12k+</h3>
                    <p className="text-lg font-bold text-white mb-3">Active Patients</p>
                    <p className="text-slate-400 text-sm font-medium max-w-[240px]">Managing over 500+ practices worldwide with 99.9% uptime.</p>
                 </div>
                 {/* Abstract CSS Art */}
                 <div className="absolute right-10 bottom-10 w-40 h-40 border-t-2 border-l-2 border-[#137dab]/20 rounded-tl-[3rem] group-hover:scale-110 transition-transform"></div>
                 <div className="absolute right-5 bottom-5 w-40 h-40 border-t-2 border-l-2 border-[#137dab]/10 rounded-tl-[4rem] group-hover:scale-125 transition-transform delay-75"></div>
              </div>

              <div className="bg-slate-50 p-10 lg:p-12 rounded-3xl border border-slate-100 flex flex-col justify-between">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">Instant Queue Transparency at any time.</h3>
                    <div className="flex items-center gap-3 py-4">
                       <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                          <Clock className="w-6 h-6 text-[#137dab]" />
                       </div>
                       <ArrowRight className="text-slate-300 w-6 h-6" />
                       <div className="w-12 h-12 rounded-xl bg-[#137dab] flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                       </div>
                    </div>
                 </div>
                 {/* CSS Progress Indicator */}
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 group-hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-center text-[12px] font-bold mb-1">
                       <span className="text-slate-400 uppercase tracking-wider">Estimated Wait</span>
                       <span className="text-emerald-600">~12 Mins</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#137dab] w-[65%] rounded-full"></div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Process Section */}
        <section className="bg-slate-950 text-white py-24 px-6 lg:px-20 relative overflow-hidden">
           <div className="max-w-7xl mx-auto">
              <div className="mb-16 text-center lg:text-left">
                 <p className="text-[11px] font-bold text-[#137dab] tracking-[0.3em] mb-3 uppercase">Workflow</p>
                 <h2 className="text-3xl lg:text-4xl font-bold tracking-tight max-w-xl leading-tight">
                   Modern clinic orchestration.
                 </h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                 {[
                   { id: 1, title: "Check-In", desc: "Patient scans QR. Arrival is logged automatically into the clinic dashboard." },
                   { id: 2, title: "Routing", desc: "Smart logic assigns patients to rooms and doctors based on availability." },
                   { id: 3, title: "Consultation", desc: "Doctors view history and log visit notes in a streamlined, tablet-friendly UI." }
                 ].map((item) => (
                   <div key={item.id} className="group p-6 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <span className="text-4xl font-black text-white/10 group-hover:text-[#137dab]/40 transition-colors mb-4 block leading-none">{item.id}</span>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">
                         {item.desc}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#137dab]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 lg:px-20 bg-white">
           <div className="max-w-7xl mx-auto flex flex-col items-center">
              <div className="text-center mb-16">
                 <p className="text-[11px] font-bold text-[#137dab] tracking-widest uppercase mb-3">Pricing</p>
                 <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">Simple, predictable plans.</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                 <div className="bg-slate-50/50 p-8 lg:p-10 rounded-[2rem] border border-slate-200/60 flex flex-col justify-between hover:bg-slate-50 transition-colors text-left">
                    <div>
                       <h3 className="text-xl font-bold mb-1">Solo</h3>
                       <p className="text-slate-500 text-sm font-medium mb-6">For independent practitioners.</p>
                       <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-bold text-slate-900">$29</span>
                          <span className="text-slate-400 text-sm font-medium">/mo</span>
                       </div>
                       <ul className="space-y-3 mb-8">
                          {["Unlimited bookings", "Patient history", "Queue tracking"].map((f) => (
                            <li key={f} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                               <CheckCircle2 className="w-4 h-4 text-[#137dab]" /> {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <Link href="/login">
                       <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-slate-200 hover:bg-white text-slate-700 text-sm">Start Trial</Button>
                    </Link>
                 </div>

                 <div className="bg-[#137dab] p-8 lg:p-10 rounded-[2rem] text-white flex flex-col justify-between shadow-xl shadow-[#137dab]/20 text-left">
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <h3 className="text-xl font-bold">Clinical</h3>
                          <span className="bg-white/20 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">MOST POPULAR</span>
                       </div>
                       <p className="text-white/70 text-sm font-medium mb-6">For multi-doctor clinics.</p>
                       <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-bold">$89</span>
                          <span className="text-white/50 text-sm font-medium">/mo</span>
                       </div>
                       <ul className="space-y-3 mb-8">
                          {["Everything in Solo", "Multi-doctor workspace", "Advanced Analytics", "24/7 Priority Support"].map((f) => (
                            <li key={f} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                               <CheckCircle2 className="w-4 h-4 text-white" /> {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <Link href="/login">
                       <Button className="w-full h-11 rounded-xl font-bold bg-white text-[#137dab] hover:bg-white/90 text-sm">Get Started</Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section - CSS illustration instead of patient_queue.png */}
        <section className="px-6 lg:px-20 py-20">
           <div className="max-w-5xl mx-auto bg-slate-950 rounded-[2.5rem] p-10 lg:p-16 text-center flex flex-col items-center relative overflow-hidden group">
              <div className="relative z-10 max-w-xl">
                 <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">Ready to level up your practice?</h2>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-8">
                   Join 500+ clinics worldwide who have transformed their patient experience with HealthDesk.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login">
                       <Button className="bg-[#137dab] text-white hover:bg-[#137dab]/90 font-bold px-8 h-12 rounded-xl text-sm w-full sm:w-auto shadow-lg shadow-[#137dab]/10">Start 14-day Trial</Button>
                    </Link>
                    <Link href="/login">
                       <Button variant="ghost" className="text-white hover:bg-white/5 font-bold px-8 h-12 rounded-xl text-sm border border-white/10 w-full sm:w-auto">
                         View Case Study
                       </Button>
                    </Link>
                 </div>
              </div>
              {/* Abstract CSS Interactive Background Element */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none flex items-center justify-center">
                 <div className="w-48 h-64 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 transform rotate-12 translate-x-12 translate-y-12 flex flex-col p-4 opacity-50 group-hover:rotate-6 group-hover:translate-y-8 transition-transform duration-700">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mb-4"></div>
                    <div className="space-y-4">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/10"></div>
                            <div className="w-20 h-1.5 bg-white/10 rounded-full"></div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-16 border-t border-slate-50 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#137dab]/10 rounded-lg">
                <Activity className="w-4 h-4 text-[#137dab]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">HealthDesk</span>
            </div>
            <p className="text-slate-400 text-[13px] font-medium leading-relaxed">
              Modern automation for the <br/> next-gen clinic.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "Security", "Roadmap"] },
            { title: "Company", links: ["About", "Careers", "Contact"] },
            { title: "Social", links: ["Twitter", "LinkedIn", "YouTube"] },
            { title: "Legal", links: ["Privacy", "Terms", "Cookies"] }
          ].map((col) => (
            <div key={col.title} className="space-y-4">
               <h5 className="font-bold text-slate-900 text-[12px] uppercase tracking-wider">{col.title}</h5>
               <ul className="space-y-3 text-[13px] font-semibold text-slate-500">
                  {col.links.map(l => <li key={l}><Link href="#" className="hover:text-[#137dab] transition-colors">{l}</Link></li>)}
               </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px] font-bold">
           <p>© 2026 HealthDesk Inc. Built for healthcare.</p>
           <div className="flex items-center gap-5">
              <Link href="#" className="hover:text-slate-900 transition-colors">Support</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Globe className="w-3.5 h-3.5" />
           </div>
        </div>
      </footer>
    </div>
  );
}

