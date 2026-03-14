"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity, LogOut, CheckCircle2, User, Stethoscope, Clock, Users,
  ChevronDown, ChevronUp, Heart, Pill, AlertTriangle, Droplets,
  Phone, FileText, ShieldCheck, Coffee, History, Loader2,
  Thermometer, Calendar, ChevronRight, X, ClipboardList,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Condition pill ─────────────────────────────────────────────────────────────
function ConditionPill({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
      active ? color : "bg-slate-50 border-slate-200 text-slate-300"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-current" : "bg-slate-200"}`} />
      {label}
    </span>
  );
}

// ── Hashing helper (Shared with server logic) ──────────────────────────────────
function calculateChecksum(data: any) {
  const content = JSON.stringify({
    p: data.patientId,
    d: data.isDiabetic,
    h: data.isHypertensive,
    hd: data.hasHeartDisease,
    as: data.hasAsthma,
    c: data.conditions || "",
    a: data.allergies || "",
    m: data.currentMedications || "",
    n: data.notes || "",
  });

  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = (hash & hash); 
  }
  return "hash-" + Math.abs(hash).toString(16).slice(0, 32);
}

// ── Full Medical Info Panel ───────────────────────────────────────────────────
function MedicalInfoPanel({ info, compact = false }: { info: MedicalInfo; compact?: boolean }) {
  const [showHistory, setShowHistory] = useState(false);
  const history = useQuery(
    api.medicalInfo.getMedicalHistory,
    info ? { patientId: info.patientId as Id<"users"> } : "skip"
  );

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 gap-3">
        <FileText className="w-10 h-10 opacity-20" />
        <div>
          <p className="text-sm font-black text-slate-400">No medical records found</p>
          <p className="text-[10px] font-bold text-slate-300 mt-0.5">Patient has not filled in their medical ledger yet.</p>
        </div>
      </div>
    );
  }

  const generatedHash = calculateChecksum(info);
  const isVerified = info.checksum === generatedHash;

  const hasConditions = info.isDiabetic || info.isHypertensive || info.hasHeartDisease || info.hasAsthma;

  return (
    <div className="space-y-5">
      {/* Integrity Alert if tampered */}
      {!isVerified && info.checksum && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-3 text-[11px] font-bold mb-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <div className="flex-1">
            <p className="uppercase tracking-widest">Tamper Alert</p>
            <p className="text-[9px] opacity-70 mt-0.5">Block-hash mismatch. Data integrity cannot be verified in this instance.</p>
          </div>
        </div>
      )}

      {/* ── Demographics row ── */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
          <User className="w-3 h-3 text-[#137dab]" /> Patient Particulars
        </p>
        <div className="flex flex-wrap gap-2">
          {info.age && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#137dab]/8 border border-[#137dab]/20 text-[#137dab] rounded-lg text-[10px] font-black uppercase tracking-widest">
              <Calendar className="w-3 h-3" /> {info.age} yrs
            </span>
          )}
          {info.gender && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {info.gender}
            </span>
          )}
          {info.bloodType && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
              <Droplets className="w-3 h-3" /> {info.bloodType}
            </span>
          )}
          {!info.age && !info.gender && !info.bloodType && (
            <span className="text-[10px] font-bold text-slate-300">Not specified</span>
          )}
        </div>
      </div>

      {/* ── Systemic conditions ── */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
          <Thermometer className="w-3 h-3 text-[#137dab]" /> Systemic Conditions
        </p>
        <div className="flex flex-wrap gap-2">
          <ConditionPill
            label="Diabetes (T1/T2)"
            active={info.isDiabetic}
            color="bg-amber-50 border-amber-300 text-amber-700"
          />
          <ConditionPill
            label="Hypertension"
            active={info.isHypertensive}
            color="bg-rose-50 border-rose-300 text-rose-700"
          />
          <ConditionPill
            label="Heart Disease"
            active={info.hasHeartDisease}
            color="bg-red-50 border-red-300 text-red-700"
          />
          <ConditionPill
            label="Asthma / Resp."
            active={info.hasAsthma}
            color="bg-sky-50 border-sky-300 text-sky-700"
          />
          {!hasConditions && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Clear Record
            </span>
          )}
        </div>
      </div>

      {/* ── Clinical details grid ── */}
      {(info.conditions || info.allergies || info.currentMedications || info.notes) && (
        <div className={`grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          {info.conditions && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> Relevant Conditions
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{info.conditions}</p>
            </div>
          )}
          {info.allergies && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Allergens
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{info.allergies}</p>
            </div>
          )}
          {info.currentMedications && (
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-1">
                <Pill className="w-3 h-3" /> Current Medications
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{info.currentMedications}</p>
            </div>
          )}
          {info.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Patient Notes
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{info.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Emergency contact ── */}
      {info.emergencyContact && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Emergency Contact</p>
            <p className="text-xs font-bold text-slate-700">{info.emergencyContact}</p>
          </div>
        </div>
      )}

      {/* ── Blockchain / integrity section ── */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#137dab]/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#137dab]" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#137dab]">Ledger Verified</p>
            <p className="text-[8px] font-mono text-slate-300 truncate max-w-[180px]">{info.checksum ?? "—"}</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-[#137dab]/40 hover:text-[#137dab] transition-colors"
        >
          <History className="w-3 h-3" />
          Audit Log {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Audit history ── */}
      {showHistory && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(!history || history.length === 0) ? (
            <p className="text-center py-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">No audit blocks yet</p>
          ) : history.map((block) => (
            <div key={block._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase bg-[#137dab]/10 text-[#137dab] px-1.5 py-0.5 rounded">Block #{block.blockIndex}</span>
                  <span className="text-[9px] font-bold text-slate-400">{new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs">{block.checksum}</p>
              </div>
              <span className="text-[9px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">v{block.version}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Queue patient row (expandable) ────────────────────────────────────────────
function QueuePatientRow({ patient, idx }: { patient: any; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const med: MedicalInfo = patient.medicalInfo;
  const isFirst = idx === 0;

  return (
    <div className={`border-b border-slate-100 transition-all ${isFirst ? "bg-[#137dab]/3" : "hover:bg-slate-50"}`}>
      <div
        className="px-5 py-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Position badge */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
          isFirst
            ? "bg-[#137dab] text-white shadow-[0_4px_10px_rgba(19,125,171,0.3)]"
            : "bg-slate-100 text-slate-500"
        }`}>
          {idx + 1}
        </div>

        {/* Name + time */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            {patient.name}
            {med && <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />}
          </p>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase mt-0.5">
            <Clock className="w-3 h-3" /> {patient.time}
          </p>
        </div>

        {/* Condition flags */}
        <div className="hidden sm:flex gap-1.5 flex-wrap justify-end">
          {med?.bloodType && (
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase rounded-lg flex items-center gap-1">
              <Droplets className="w-3 h-3" />{med.bloodType}
            </span>
          )}
          {med?.isDiabetic && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase rounded-lg">Diabetic</span>}
          {med?.isHypertensive && <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-black uppercase rounded-lg">HBP</span>}
          {med?.hasHeartDisease && <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[9px] font-black uppercase rounded-lg">Cardiac</span>}
          {med?.hasAsthma && <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-black uppercase rounded-lg">Asthma</span>}
          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg ${
            patient.type === "Priority"
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-slate-100 text-slate-500"
          }`}>{patient.type}</span>
        </div>

        {/* Expand toggle */}
        <button className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#137dab] hover:bg-[#137dab]/10 transition-all">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded medical info */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <div className="pt-4">
            <MedicalInfoPanel info={med} compact />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Doctor Dashboard ─────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const currentSlot = useQuery(api.slots.getCurrentSlot);
  const liveQueue = useQuery(api.queue.getLiveQueue, {}) || [];
  const nextPatient = liveQueue[0] ?? null;
  const [showMed, setShowMed] = useState(true); 
  const [patientNotes, setPatientNotes] = useState("");

  const callPatient = useMutation(api.queue.callPatient);
  const completeConsultation = useMutation(api.queue.removeFromQueue);
  const saveNotes = useMutation(api.medicalInfo.saveConsultationNotes);
  const [processing, setProcessing] = useState(false);

  const userId = typeof window !== "undefined" ? localStorage.getItem("healthdesk_userId") : null;
  const doctor = useQuery(api.users.getUser, { userId: userId as Id<"users"> });
  const setBreak = useMutation(api.users.setBreakStatus);

  // Sync notes when patient changes or consultation starts
  useEffect(() => {
    if (nextPatient?.status === "Consulting" && nextPatient.medicalInfo?.notes) {
      setPatientNotes(nextPatient.medicalInfo.notes);
    } else if (nextPatient?.status !== "Consulting") {
      setPatientNotes("");
    }
  }, [nextPatient?._id, nextPatient?.status]);

  const handleCallPatient = async () => {
    if (!nextPatient) return;
    setProcessing(true);
    try {
      if (nextPatient.status === "Waiting") {
        await callPatient({ queueId: nextPatient._id });
      } else {
        // Save notes before finishing
        await saveNotes({ 
          patientId: nextPatient.patientId as Id<"users">, 
          notes: patientNotes 
        });
        await completeConsultation({ queueId: nextPatient._id, status: "completed" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const toggleBreak = async () => {
    if (doctor) {
      await setBreak({ userId: doctor._id, wantsBreak: !doctor.wantsBreak });
    }
  };

  const isConsulting = nextPatient?.status === "Consulting";

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
      {/* Subtle bg */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#137dab]/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      {/* ── Navbar ── */}
      <header className="px-6 h-16 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#137dab] rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">HealthDesk</span>
        </div>

        <nav className="flex items-center gap-4">
          {/* Doctor name chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <div className="w-6 h-6 rounded-full bg-[#137dab]/10 flex items-center justify-center text-[#137dab] font-black text-xs">
              {doctor?.name?.charAt(0) ?? "D"}
            </div>
            <span className="text-xs font-black text-slate-700">Dr. {doctor?.name ?? "—"}</span>
          </div>

          {/* Break toggle */}
          <button
            onClick={toggleBreak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              doctor?.wantsBreak
                ? "bg-amber-100 text-amber-700 border-amber-300 animate-pulse"
                : "bg-white text-slate-500 border-slate-200 hover:border-[#137dab]/40 hover:text-[#137dab]"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            {doctor?.wantsBreak ? "Break Requested" : "Request Break"}
          </button>

          <Link href="/login" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Link>
        </nav>
      </header>

      <main className="relative z-10 p-6 lg:p-10 max-w-[96rem] mx-auto w-full space-y-8">

        {/* ── Hero bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-1 bg-[#137dab]/10 text-[#137dab] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#137dab]/20">
                Consultation Room
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Doctor Dashboard</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Live Patient Pipeline · Medical Records
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Slot</p>
              <p className="text-sm font-black text-[#137dab]">
                {currentSlot ? `${currentSlot.startTime} – ${currentSlot.endTime}` : "—"}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">In Queue</p>
              <p className="text-2xl font-black text-[#137dab]">{liveQueue.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* ══ LEFT: Active patient card ══ */}
          <section className="lg:col-span-5 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#137dab]" /> Patient on Deck
            </h2>

            <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
              isConsulting
                ? "border-[#137dab] shadow-[0_0_0_2px_rgba(19,125,171,0.12)]"
                : "border-slate-200"
            }`}>

              {nextPatient ? (
                <>
                  {/* Patient header */}
                  <div className={`p-5 flex items-center gap-4 border-b border-slate-100 ${isConsulting ? "bg-[#137dab]/5" : ""}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${
                      isConsulting ? "bg-[#137dab] text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {nextPatient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-slate-900">{nextPatient.name}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          nextPatient.type === "Priority"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20"
                        }`}>{nextPatient.type}</span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {nextPatient.time}
                        </span>
                        {isConsulting && (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Consulting
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick vital chips */}
                  {nextPatient.medicalInfo && (
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2">
                      {nextPatient.medicalInfo.bloodType && (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> {nextPatient.medicalInfo.bloodType}
                        </span>
                      )}
                      {nextPatient.medicalInfo.age && (
                        <span className="px-2.5 py-1 bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20 text-[10px] font-black uppercase rounded-lg">
                          {nextPatient.medicalInfo.age} yrs
                        </span>
                      )}
                      {nextPatient.medicalInfo.isDiabetic && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase rounded-lg">Diabetic</span>
                      )}
                      {nextPatient.medicalInfo.isHypertensive && (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase rounded-lg">HBP</span>
                      )}
                      {nextPatient.medicalInfo.hasHeartDisease && (
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase rounded-lg">Cardiac</span>
                      )}
                      {nextPatient.medicalInfo.hasAsthma && (
                        <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase rounded-lg">Asthma</span>
                      )}
                      {!nextPatient.medicalInfo.isDiabetic &&
                       !nextPatient.medicalInfo.isHypertensive &&
                       !nextPatient.medicalInfo.hasHeartDisease &&
                       !nextPatient.medicalInfo.hasAsthma && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Clear
                        </span>
                      )}
                    </div>
                  )}

                  {/* Consultation Notes (Only when consulting) */}
                  {isConsulting && (
                    <div className="p-5 bg-emerald-50/30 border-b border-emerald-100 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" /> Consultation Notes
                      </p>
                      <textarea
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        placeholder="Type clinical observations, diagnosis, or prescription notes here..."
                        className="w-full h-32 p-4 rounded-xl border border-emerald-200 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm placeholder:text-slate-300"
                      />
                    </div>
                  )}

                  {/* Medical records toggle */}
                  <button
                    onClick={() => setShowMed((v) => !v)}
                    className="w-full px-5 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#137dab] hover:bg-[#137dab]/5 transition-colors border-b border-slate-100"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Full Medical Records
                    </span>
                    {showMed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Full medical info */}
                  {showMed && (
                    <div className="p-5 border-b border-slate-100">
                      <MedicalInfoPanel info={nextPatient.medicalInfo} />
                    </div>
                  )}

                  {/* Action button */}
                  <div className="p-5">
                    <Button
                      onClick={handleCallPatient}
                      disabled={processing}
                      className={`w-full h-12 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-[0.98] ${
                        isConsulting
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                          : "bg-[#137dab] hover:bg-[#137dab]/90 text-white shadow-[0_4px_12px_rgba(19,125,171,0.25)]"
                      }`}
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : isConsulting ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Stethoscope className="w-4 h-4 mr-2" />
                      )}
                      {processing ? "Processing…"
                       : isConsulting ? "Mark Consultation Complete"
                       : "Call for Consultation"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Queue Empty</p>
                  <p className="text-[10px] font-bold text-slate-300 mt-1">No patients checked in yet</p>
                </div>
              )}
            </div>
          </section>

          {/* ══ RIGHT: Full queue list ══ */}
          <section className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#137dab]" /> Arrival Flow
              </h2>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#137dab] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {liveQueue.length} in queue
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Patient</div>
                <div className="col-span-5 hidden sm:block">Flags</div>
                <div className="col-span-1 text-right">Info</div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {liveQueue.length === 0 ? (
                  <div className="py-24 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20 text-[#137dab]" />
                    <p className="text-sm font-black">No patients yet</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-1">Queue will populate as patients check in</p>
                  </div>
                ) : liveQueue.map((patient: any, idx: number) => (
                  <QueuePatientRow key={patient._id ?? idx} patient={patient} idx={idx} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
