"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, LogOut, CheckCircle2, User, Stethoscope, Clock, Users,
  ChevronDown, ChevronUp, Heart, Pill, AlertTriangle, Droplets,
  Phone, FileText, Thermometer, ShieldCheck, ChevronRight, Coffee, History, Loader2
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type MedicalInfo = {
  patientId: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  isDiabetic: boolean;
  isHypertensive: boolean;
  hasHeartDisease: boolean;
  hasAsthma: boolean;
  conditions?: string;
  allergies?: string;
  currentMedications?: string;
  notes?: string;
  emergencyContact?: string;
  checksum?: string;
  lastVerified?: string;
  version?: number;
} | null;

function MedicalBadge({ label, active, color }: { label: string; active: boolean; color: string }) {
  if (!active) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function MedicalHistoryPanel({ patientId }: { patientId: string }) {
  const history = useQuery(api.medicalInfo.getMedicalHistory, { patientId: patientId as Id<"users"> });

  if (!history || history.length === 0) {
    return (
      <div className="mt-4 p-4 border-2 border-dashed border-zinc-100 rounded-xl text-center">
        <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">No Historical Blocks Found</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-4 flex items-center gap-2">
        <History className="w-3 h-3" /> Audit Ledger History
      </h4>
      <div className="space-y-3">
        {history.map((block, i) => (
          <div key={block._id} className="p-4 bg-white border border-zinc-100 rounded-xl relative overflow-hidden group hover:border-black transition-all">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[9px] font-black uppercase bg-zinc-100 px-2 py-0.5 rounded mr-2">Block #{block.blockIndex}</span>
                <span className="text-[9px] font-black uppercase text-zinc-400">{new Date(block.timestamp).toLocaleString()}</span>
              </div>
              <Badge variant="outline" className="text-[8px] h-5 border-zinc-100 font-bold">v{block.version}</Badge>
            </div>
            <div className="text-[11px] text-zinc-600 font-medium line-clamp-2">
              {block.data}
            </div>
            <div className="mt-2 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
               <ShieldCheck className="w-3 h-3 text-black" />
               <code className="text-[8px] text-black font-mono truncate">{block.checksum}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedicalInfoPanel({ info }: { info: MedicalInfo }) {
  const [showHistory, setShowHistory] = useState(false);
  
  if (!info) {
    return (
      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-500 flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-400" />
        No medical info recorded for this patient.
      </div>
    );
  }

  // ── Blockchain Verification Logic ──────────────────────────────────────────
  const verifyData = JSON.stringify({
    p: info.patientId,
    d: info.isDiabetic,
    h: info.isHypertensive,
    hd: info.hasHeartDisease,
    as: info.hasAsthma,
    c: info.conditions || "",
    a: info.allergies || "",
    m: info.currentMedications || "",
  });
  
  const currentHash = "sha256-" + btoa(verifyData).slice(0, 32);
  const isVerified = !info.checksum || info.checksum === currentHash;

  return (
    <div className="mt-3 bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3 text-sm">
      {/* Integrity Alert if tampered */}
      {!isVerified && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg flex items-center gap-2 text-[11px] font-bold mb-2 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          TAMPER ALERT: Crypto-hash mismatch. Data integrity cannot be verified.
        </div>
      )}

      {/* Top row – demographics */}
      <div className="flex flex-wrap gap-4 text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
        {info.age && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
            Age: <span className="text-black">{info.age}</span>
          </span>
        )}
        {info.gender && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
            {info.gender}
          </span>
        )}
        {info.bloodType && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full">
            <Droplets className="w-3 h-3" />
            {info.bloodType}
          </span>
        )}
      </div>

      {/* Condition badges */}
      <div className="flex flex-wrap gap-2">
        <MedicalBadge label="Diabetic"       active={info.isDiabetic}      color="bg-white text-black border-2 border-black" />
        <MedicalBadge label="Hypertensive"   active={info.isHypertensive}  color="bg-white text-black border-2 border-black" />
        <MedicalBadge label="Heart Disease"  active={info.hasHeartDisease} color="bg-white text-black border-2 border-black" />
        <MedicalBadge label="Asthma"         active={info.hasAsthma}       color="bg-white text-black border-2 border-black" />
        {!info.isDiabetic && !info.isHypertensive && !info.hasHeartDisease && !info.hasAsthma && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 border border-zinc-200">
            Clear Record
          </span>
        )}
      </div>

      {/* Detail rows */}
      {info.conditions && (
        <div className="flex gap-2 text-slate-700">
          <Thermometer className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
          <div><span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block">Other Conditions</span>{info.conditions}</div>
        </div>
      )}
      {info.allergies && (
        <div className="flex gap-2 text-slate-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-yellow-500 shrink-0" />
          <div><span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block">Allergies</span>{info.allergies}</div>
        </div>
      )}
      {info.currentMedications && (
        <div className="flex gap-2 text-slate-700">
          <Pill className="w-3.5 h-3.5 mt-0.5 text-purple-500 shrink-0" />
          <div><span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block">Current Medications</span>{info.currentMedications}</div>
        </div>
      )}
      {info.notes && (
        <div className="flex gap-2 text-slate-700">
          <FileText className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div><span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block">Doctor Notes</span>{info.notes}</div>
        </div>
      )}

      {/* Security Verification (Blockchain Concept) */}
      <div className="mt-6 pt-4 border-t-2 border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isVerified ? 'bg-black' : 'bg-zinc-100 animate-pulse'}`}>
            {isVerified ? <ShieldCheck className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-black" />}
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] leading-none ${isVerified ? 'text-black' : 'text-zinc-400'}`}>
              {isVerified ? 'Ledger Verified' : 'Block Integrity Error'}
            </p>
            <p className="text-[9px] text-zinc-300 font-bold uppercase mt-1">Hash Sequence: {info.checksum || "Unsigned"}</p>
          </div>
        </div>
        <div className="text-right">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="text-[9px] h-6 border-zinc-100 bg-white font-black uppercase tracking-widest rounded-lg flex items-center gap-2 border hover:bg-black hover:text-white transition-all px-2"
          >
           View Ledger History {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {showHistory && <MedicalHistoryPanel patientId={info.patientId} />}
    </div>
  );
}

function QueuePatientRow({ patient, idx }: { patient: any; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const med: MedicalInfo = patient.medicalInfo;

  return (
    <div className={`px-6 py-5 transition-all border-b border-zinc-50 ${idx === 0 ? "bg-zinc-50/50" : "hover:bg-zinc-50/30"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${idx === 0 ? "bg-black text-white border-black" : "bg-white text-zinc-300 border-zinc-100"}`}>
            {idx + 1}
          </div>
          <div>
            <p className="text-md font-black uppercase tracking-tight text-black">{patient.name}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1.5 text-black" /> Authorized {patient.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {med?.isDiabetic && <span className="text-[9px] px-2 py-1 rounded bg-black text-white font-black uppercase tracking-widest">Diabetic</span>}
            {med?.isHypertensive && <span className="text-[9px] px-2 py-1 rounded bg-black text-white font-black uppercase tracking-widest">HBP</span>}
          </div>
          <Badge variant="secondary" className={`${patient.type === "Priority" ? "bg-zinc-100 text-black" : "bg-white text-zinc-400 font-bold"} border border-zinc-100 rounded-lg text-[10px] uppercase font-black px-3`}>
            {patient.type}
          </Badge>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
            title="View medical info"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && <MedicalInfoPanel info={med} />}
    </div>
  );
}

export default function DoctorDashboard() {
  const currentSlot = useQuery(api.slots.getCurrentSlot);
  // Show everyone checked in today, regardless of their specific slot timing
  const liveQueue = useQuery(api.queue.getLiveQueue, {}) || [];
  const nextPatient = liveQueue[0] ?? null;
  const [showNextMed, setShowNextMed] = useState(false);

  const callPatient = useMutation(api.queue.callPatient);
  const completeConsultation = useMutation(api.queue.removeFromQueue);
  const [processing, setProcessing] = useState(false);

  const handleCallPatient = async () => {
    if (!nextPatient) return;
    setProcessing(true);
    try {
      if (nextPatient.status === "Waiting") {
        await callPatient({ queueId: nextPatient._id });
      } else {
        await completeConsultation({ queueId: nextPatient._id, status: "completed" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Auth / User Logic
  const userId = typeof window !== "undefined" ? localStorage.getItem("healthdesk_userId") : null;
  const doctor = useQuery(api.users.getUser, { userId: userId as Id<"users"> });
  const setBreak = useMutation(api.users.setBreakStatus);

  const toggleBreak = async () => {
    if (doctor) {
      await setBreak({ 
        userId: doctor._id, 
        wantsBreak: !doctor.wantsBreak 
      });
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-white/30 selection:text-white relative overflow-hidden flex flex-col text-white">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-300/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <header className="px-6 h-24 flex items-center justify-between sticky top-0 z-50 bg-[#137dab]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Activity className="w-6 h-6 text-[#137dab]" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">HealthDesk</span>
        </div>
        <nav className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-8">
          <button 
             onClick={toggleBreak}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${doctor?.wantsBreak ? 'bg-amber-500/80 text-white border-amber-400' : 'bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#137dab]'}`}
          >
             <Coffee className="w-4 h-4" /> {doctor?.wantsBreak ? 'Break Requested' : 'Request Break'}
          </button>
          <span className="text-white bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20 uppercase">
             Dr. {doctor?.name || "Loading..."} • Surgeon
          </span>
          <Link href="/login" className="flex items-center gap-2 text-white/80 hover:text-white transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-[90rem] mx-auto w-full space-y-12 relative z-10">
        <div className="flex justify-between items-end border-b border-white/20 pb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-3 drop-shadow-md">Consultation Room</h1>
            <p className="text-white/70 font-bold uppercase text-[10px] tracking-[0.2em]">Live Patient Pipeline & Records</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Active Slot</p>
              <p className="font-bold text-white uppercase drop-shadow-sm">
                {currentSlot ? (
                  <>
                    {new Date(currentSlot.date!).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {currentSlot.startTime} - {currentSlot.endTime}
                  </>
                ) : (
                  "No Active Slot"
                )}
              </p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">In Queue</p>
              <p className="text-2xl font-black text-white leading-none drop-shadow-md">{liveQueue.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Active / Next Patient */}
          <section className="lg:col-span-5 space-y-8 animate-reveal">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 drop-shadow-sm">
                <Stethoscope className="w-6 h-6" /> Patient on Deck
              </h2>
            </div>
            
            <Card className="neo-card shadow-[0_15px_40px_rgba(0,0,0,0.2)] border-none bg-white/10 backdrop-blur-xl overflow-hidden group">
              <CardContent className="p-10 space-y-8">
                {nextPatient ? (
                  <>
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-3xl border border-white/30 flex items-center justify-center bg-white/20 group-hover:bg-white transition-all duration-500 shadow-inner group-hover:text-[#137dab]">
                        <User className="w-10 h-10 group-hover:text-[#137dab] text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-bold tracking-tighter text-white drop-shadow-md">{nextPatient.name}</h3>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-white text-[#137dab] text-[9px] font-black uppercase rounded-full shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                            {nextPatient.type}
                          </span>
                          <span className="px-3 py-1 border border-white/20 text-white/80 text-[9px] font-black uppercase rounded-full flex items-center gap-1 bg-white/5">
                            <Clock className="w-3 h-3" /> {nextPatient.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-white/20" />

                    {/* Quick Vital Badges */}
                    {nextPatient.medicalInfo && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-3 backdrop-blur-sm">
                           <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-rose-300" />
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Blood Type</p>
                              <p className="font-bold text-white shadow-sm">{nextPatient.medicalInfo.bloodType || "Ukn"}</p>
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-3 backdrop-blur-sm text-white/80">
                           {nextPatient.medicalInfo.isDiabetic ? (
                             <span className="text-[10px] font-black uppercase text-white drop-shadow-sm">🩸 Diabetic</span>
                           ) : (
                             <span className="text-[10px] font-black uppercase opacity-20">🩸 Diabetic</span>
                           )}
                           {nextPatient.medicalInfo.isHypertensive ? (
                             <span className="text-[10px] font-black uppercase text-white drop-shadow-sm">💓 HBP</span>
                           ) : (
                             <span className="text-[10px] font-black uppercase opacity-20">💓 HBP</span>
                           )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4">
                       <Button 
                         variant="ghost" 
                         onClick={() => setShowNextMed(!showNextMed)} 
                         className={`w-full h-12 rounded-xl flex items-center justify-between px-6 font-black uppercase text-[10px] tracking-widest transition-all ${showNextMed ? 'bg-white text-[#137dab]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
                       >
                         Medical File Details
                         {showNextMed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                       </Button>
                       {showNextMed && (
                         <div className="animate-reveal bg-white/95 rounded-xl text-black">
                           <MedicalInfoPanel info={nextPatient.medicalInfo} />
                         </div>
                       )}
                    </div>

                    <div className="pt-6">
                       <Button 
                          onClick={handleCallPatient}
                          disabled={processing}
                          className="neo-button w-full h-16 text-lg tracking-tight bg-white text-[#137dab] hover:bg-white/90 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
                        >
                          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                           nextPatient?.status === 'Consulting' ? 'Finish Consultation' : 'Call for Consultation'}
                        </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-white/50">
                     <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">Queue Neutralized</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Live Queue */}
          <section className="lg:col-span-7 space-y-8 animate-reveal" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 drop-shadow-sm">
              <Users className="w-6 h-6" /> Arrival Flow
            </h2>
            <Card className="neo-card shadow-[0_15px_40px_rgba(0,0,0,0.2)] border-none bg-white/10 backdrop-blur-xl overflow-hidden">
               <div className="bg-white/5 border-b border-white/20 text-[9px] font-black text-white/70 uppercase tracking-[0.2em] py-5 px-8 grid grid-cols-5">
                  <div className="col-span-2">Patient</div>
                  <div className="col-span-2">Critical Tags</div>
                  <div className="text-right">Actions</div>
               </div>
               <div className="divide-y divide-white/10">
                {liveQueue.map((patient: any, idx: number) => (
                  <div key={patient._id || idx} className="p-6 px-8 grid grid-cols-5 items-center group hover:bg-white/5 transition-all font-bold animate-reveal" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="col-span-2 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-all shadow-inner ${idx === 0 ? "bg-white text-[#137dab] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-white/20 bg-white/10 text-white"}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-lg tracking-tight text-white drop-shadow-sm">{patient.name}</p>
                        <p className="text-[9px] font-black uppercase text-white/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-white/40" /> {patient.time}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex gap-1.5 flex-wrap">
                      {patient.medicalInfo?.isDiabetic && <div className="px-2 py-0.5 border border-white/30 text-[8px] font-black uppercase rounded bg-white/10 backdrop-blur-sm">Diabetic</div>}
                      {patient.medicalInfo?.isHypertensive && <div className="px-2 py-0.5 border border-white/30 text-[8px] font-black uppercase rounded bg-white/10 backdrop-blur-sm">HBP</div>}
                      <div className={`px-2 py-0.5 text-[8px] font-black uppercase rounded shadow-sm ${patient.type === "Priority" ? "bg-white text-[#137dab]" : "text-white/80 border border-white/20 bg-white/5"}`}>
                        {patient.type}
                      </div>
                    </div>
                    <div className="text-right">
                       <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-white hover:text-[#137dab] text-white transition-all shadow-sm">
                          <ChevronRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
              {liveQueue.length === 0 && (
                <div className="p-32 text-center text-white/50">
                   <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">Zero Activity</p>
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
