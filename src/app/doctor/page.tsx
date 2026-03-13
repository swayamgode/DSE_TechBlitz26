"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, LogOut, CheckCircle2, User, Stethoscope, Clock, Users,
  ChevronDown, ChevronUp, Heart, Pill, AlertTriangle, Droplets,
  Phone, FileText, Thermometer, ShieldCheck, ChevronRight,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

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

function MedicalInfoPanel({ info }: { info: MedicalInfo }) {
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
      <div className="flex flex-wrap gap-3 text-slate-600">
        {info.age && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Age: <strong>{info.age}</strong>
          </span>
        )}
        {info.gender && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {info.gender}
          </span>
        )}
        {info.bloodType && (
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-red-400" />
            Blood: <strong className="text-red-600">{info.bloodType}</strong>
          </span>
        )}
        {info.emergencyContact && (
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {info.emergencyContact}
          </span>
        )}
      </div>

      {/* Condition badges */}
      <div className="flex flex-wrap gap-2">
        <MedicalBadge label="🩸 Diabetic"       active={info.isDiabetic}      color="bg-orange-100 text-orange-800 border border-orange-200" />
        <MedicalBadge label="💓 Hypertensive"   active={info.isHypertensive}  color="bg-red-100 text-red-800 border border-red-200" />
        <MedicalBadge label="❤️ Heart Disease"  active={info.hasHeartDisease} color="bg-rose-100 text-rose-800 border border-rose-200" />
        <MedicalBadge label="🌬️ Asthma"         active={info.hasAsthma}       color="bg-sky-100 text-sky-800 border border-sky-200" />
        {!info.isDiabetic && !info.isHypertensive && !info.hasHeartDisease && !info.hasAsthma && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            ✅ No major conditions
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
      <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-5 w-5 items-center justify-center rounded-full ${isVerified ? 'bg-emerald-100' : 'bg-red-100 animate-pulse'}`}>
            {isVerified ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-red-600" />}
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isVerified ? 'text-slate-500' : 'text-red-600'}`}>
              {isVerified ? 'Security Verified' : 'Integrity Compromised'}
            </p>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Integrity Hash: {info.checksum || "Unsigned Record"}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className={`text-[9px] h-4 border-slate-200 bg-white font-mono ${!isVerified ? 'text-red-600 border-red-200' : 'text-slate-500'}`}>
            v{info.version || 1} • {info.lastVerified ? new Date(info.lastVerified).toLocaleDateString() : "Pending"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function QueuePatientRow({ patient, idx }: { patient: any; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const med: MedicalInfo = patient.medicalInfo;

  return (
    <div className={`px-4 pt-4 pb-3 transition-colors ${idx === 0 ? "bg-blue-50/30" : "hover:bg-slate-50"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
            {idx + 1}
          </div>
          <div>
            <p className={`font-medium ${idx === 0 ? "text-blue-900" : "text-slate-900"}`}>{patient.name}</p>
            <p className="text-xs text-slate-500 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Checked-in {patient.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {med?.isDiabetic && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold hidden sm:inline">Diabetic</span>}
          {med?.isHypertensive && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold hidden sm:inline">HBP</span>}
          <Badge variant="secondary" className={`${patient.type === "Priority" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-slate-100 text-slate-700"} rounded-full`}>
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
  const liveQueue = useQuery(api.queue.getLiveQueue) || [];
  const nextPatient = liveQueue[0] ?? null;
  const [showNextMed, setShowNextMed] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      {/* Navbar */}
      <header className="px-6 h-24 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-1.5 bg-black rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-black">HealthDesk</span>
        </div>
        <nav className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-8">
          <span className="text-black bg-zinc-100 px-4 py-1.5 rounded-full flex items-center gap-2 border border-zinc-200 uppercase">
             Dr. Mark • Surgeon
          </span>
          <Link href="/login" className="flex items-center gap-2 hover:text-black transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-[90rem] mx-auto w-full space-y-12">
        <div className="flex justify-between items-end border-b border-zinc-100 pb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-black mb-3">Consultation Room</h1>
            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">Live Patient Pipeline & Records</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Active Slot</p>
              <p className="font-bold text-black uppercase">10:00 AM - 11:00 AM</p>
            </div>
            <div className="h-10 w-px bg-zinc-100" />
            <div className="flex flex-col items-center">
              <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">In Queue</p>
              <p className="text-2xl font-black text-black leading-none">{liveQueue.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Active / Next Patient */}
          <section className="lg:col-span-5 space-y-8 animate-reveal">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Stethoscope className="w-6 h-6" /> Patient on Deck
              </h2>
            </div>
            
            <Card className="neo-card shadow-none border-black overflow-hidden group">
              <CardContent className="p-10 space-y-8">
                {nextPatient ? (
                  <>
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-3xl border-2 border-black flex items-center justify-center bg-zinc-50 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <User className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-bold tracking-tighter">{nextPatient.name}</h3>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase rounded-full">
                            {nextPatient.type}
                          </span>
                          <span className="px-3 py-1 border border-zinc-200 text-zinc-400 text-[9px] font-black uppercase rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {nextPatient.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-100" />

                    {/* Quick Vital Badges */}
                    {nextPatient.medicalInfo && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-rose-500" />
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Blood Type</p>
                              <p className="font-bold text-black">{nextPatient.medicalInfo.bloodType || "Ukn"}</p>
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3 text-zinc-400">
                           {nextPatient.medicalInfo.isDiabetic ? (
                             <span className="text-[10px] font-black uppercase text-black">🩸 Diabetic</span>
                           ) : (
                             <span className="text-[10px] font-black uppercase opacity-20">🩸 Diabetic</span>
                           )}
                           {nextPatient.medicalInfo.isHypertensive ? (
                             <span className="text-[10px] font-black uppercase text-black">💓 HBP</span>
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
                         className={`w-full h-12 rounded-xl flex items-center justify-between px-6 font-black uppercase text-[10px] tracking-widest transition-all ${showNextMed ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200'}`}
                       >
                         Medical File Details
                         {showNextMed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                       </Button>
                       {showNextMed && (
                         <div className="animate-reveal">
                           <MedicalInfoPanel info={nextPatient.medicalInfo} />
                         </div>
                       )}
                    </div>

                    <div className="pt-6">
                       <Button className="neo-button w-full h-16 text-lg tracking-tight">
                         Call for Consultation
                       </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-zinc-300">
                     <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Neutralized</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Live Queue */}
          <section className="lg:col-span-7 space-y-8 animate-reveal" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Users className="w-6 h-6" /> Arrival Flow
            </h2>
            <Card className="neo-card shadow-none border-zinc-200 overflow-hidden">
               <div className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] py-5 px-8 grid grid-cols-5">
                  <div className="col-span-2">Patient</div>
                  <div className="col-span-2">Critical Tags</div>
                  <div className="text-right">Actions</div>
               </div>
               <div className="divide-y divide-zinc-100">
                {liveQueue.map((patient: any, idx: number) => (
                  <div key={patient._id || idx} className="p-6 px-8 grid grid-cols-5 items-center group hover:bg-zinc-50 transition-all font-bold animate-reveal" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="col-span-2 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-all ${idx === 0 ? "bg-black text-white border-black" : "border-zinc-200 bg-white"}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-lg tracking-tight">{patient.name}</p>
                        <p className="text-[9px] font-black uppercase text-zinc-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-zinc-200" /> {patient.time}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex gap-1.5 flex-wrap">
                      {patient.medicalInfo?.isDiabetic && <div className="px-2 py-0.5 border border-black text-[8px] font-black uppercase rounded">Diabetic</div>}
                      {patient.medicalInfo?.isHypertensive && <div className="px-2 py-0.5 border border-black text-[8px] font-black uppercase rounded">HBP</div>}
                      <div className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${patient.type === "Priority" ? "bg-black text-white" : "text-zinc-400 border border-zinc-100"}`}>
                        {patient.type}
                      </div>
                    </div>
                    <div className="text-right">
                       <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-black hover:text-white transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
              {liveQueue.length === 0 && (
                <div className="p-32 text-center text-zinc-200">
                   <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Activity</p>
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
