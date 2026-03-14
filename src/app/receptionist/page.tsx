"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, LogOut, CheckCircle2, Clock, BriefcaseMedical,
  Loader2, Heart, Users, X, RefreshCw, Coffee, Calendar,
  Pencil, UserCheck, UserX, Stethoscope, Zap, Sun, Sunset,
  Moon, ChevronDown, ChevronUp, ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { QRCodeSVG } from "qrcode.react";

// ── Predefined non-overlapping clinic slot templates ───────────────────────────
const SLOT_TEMPLATES = [
  { label: "Early Morning",  icon: "sunrise", startTime: "08:00 AM", endTime: "09:00 AM" },
  { label: "Morning",        icon: "sun",     startTime: "09:00 AM", endTime: "10:00 AM" },
  { label: "Mid Morning",    icon: "sun",     startTime: "10:00 AM", endTime: "11:00 AM" },
  { label: "Late Morning",   icon: "sun",     startTime: "11:00 AM", endTime: "12:00 PM" },
  { label: "Afternoon",      icon: "sunset",  startTime: "02:00 PM", endTime: "03:00 PM" },
  { label: "Mid Afternoon",  icon: "sunset",  startTime: "03:00 PM", endTime: "04:00 PM" },
  { label: "Late Afternoon", icon: "sunset",  startTime: "04:00 PM", endTime: "05:00 PM" },
  { label: "Evening",        icon: "moon",    startTime: "05:00 PM", endTime: "06:00 PM" },
] as const;

const CAPACITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function SlotIcon({ icon }: { icon: string }) {
  const cls = "w-4 h-4";
  if (icon === "sun") return <Sun className={cls} />;
  if (icon === "sunset") return <Sunset className={cls} />;
  if (icon === "moon") return <Moon className={cls} />;
  return <Zap className={cls} />;
}

// ── Template tile: shows one predefined slot block ─────────────────────────────
function TemplateTile({
  template,
  activeSlot,     // the DB slot if activated, else null
  isNow,
  onActivate,
  onEdit,
  onSelectQueue,
  isQueueSelected,
}: {
  template: typeof SLOT_TEMPLATES[number];
  activeSlot: any | null;
  isNow: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onSelectQueue: () => void;
  isQueueSelected: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!activeSlot) {
    // ── Inactive tile ──
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4 opacity-60 hover:opacity-100 hover:border-[#137dab]/40 hover:bg-[#137dab]/3 transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-[#137dab]/10 group-hover:text-[#137dab] transition-colors">
            <SlotIcon icon={template.icon} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">{template.label}</p>
            <p className="text-sm font-bold text-slate-500">{template.startTime} – {template.endTime}</p>
          </div>
        </div>
        <button
          onClick={onActivate}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-[#137dab] hover:text-[#137dab] hover:bg-[#137dab]/5 transition-all"
        >
          + Activate
        </button>
      </div>
    );
  }

  // ── Active tile ──
  const totalSeats = activeSlot.regularSlots + activeSlot.prioritySlots;
  const booked = activeSlot.bookedPatients?.length ?? 0;
  const checkedIn = activeSlot.bookedPatients?.filter((p: any) => p.checkedIn).length ?? 0;
  const pct = totalSeats > 0 ? Math.round((booked / totalSeats) * 100) : 0;

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-all ${
        isQueueSelected
          ? "border-[#137dab] shadow-[0_0_0_2px_rgba(19,125,171,0.15)]"
          : "border-slate-200 shadow-sm hover:border-[#137dab]/40"
      }`}
    >
      <div
        className="p-4 flex items-start gap-3 cursor-pointer"
        onClick={onSelectQueue}
      >
        {/* Icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isNow ? "bg-emerald-100 text-emerald-600" : "bg-[#137dab]/10 text-[#137dab]"
        }`}>
          <SlotIcon icon={template.icon} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{template.label}</p>
            {isNow && (
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black">NOW</span>
            )}
          </div>
          <p className="text-sm font-black text-slate-900">{template.startTime} – {template.endTime}</p>

          {/* Mini fill bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-rose-400" : "bg-[#137dab]"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 whitespace-nowrap">
              {booked}/{totalSeats} booked
            </span>
          </div>

          {/* Seat info */}
          <div className="flex gap-3 mt-1.5">
            <span className="text-[9px] font-bold text-slate-400">
              Reg <span className="text-slate-700">{activeSlot.availableRegular}/{activeSlot.regularSlots}</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              Priority <span className="text-slate-700">{activeSlot.availablePriority}/{activeSlot.prioritySlots}</span>
            </span>
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#137dab] hover:bg-[#137dab]/10 transition-all"
          title="Edit capacity"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bookings toggle */}
      {booked > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-[#137dab] hover:bg-[#137dab]/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-3 h-3" />
            {booked} booked · {checkedIn} checked in
          </span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {/* Booking list */}
      {expanded && booked > 0 && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {activeSlot.bookedPatients.map((p: any, i: number) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#137dab]/10 text-[#137dab] flex items-center justify-center font-black text-xs">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{p.name}</p>
                  <p className={`text-[9px] font-black uppercase ${p.type === "priority" ? "text-amber-600" : "text-slate-400"}`}>{p.type}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                p.checkedIn ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500"
              }`}>
                {p.checkedIn ? <><UserCheck className="w-3 h-3" /> Present</> : <><UserX className="w-3 h-3" /> Pending</>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Capacity mini-form (used for both Activate and Edit) ──────────────────────
function CapacityForm({
  title,
  subtitle,
  reg,
  setReg,
  prio,
  setPrio,
  onSubmit,
  onCancel,
  loading,
  success,
  error,
  submitLabel,
  color,
}: {
  title: string;
  subtitle: string;
  reg: string; setReg: (v: string) => void;
  prio: string; setPrio: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  success: boolean;
  error: string;
  submitLabel: string;
  color: "blue" | "amber";
}) {
  const btnCls = color === "blue"
    ? "bg-[#137dab] hover:bg-[#137dab]/90 shadow-[0_4px_12px_rgba(19,125,171,0.25)]"
    : "bg-amber-500 hover:bg-amber-600 shadow";

  return (
    <div className={`rounded-xl border overflow-hidden bg-white shadow-md ${color === "blue" ? "border-[#137dab]/25" : "border-amber-200"}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${color === "blue" ? "bg-[#137dab]/5 border-[#137dab]/15" : "bg-amber-50 border-amber-100"}`}>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${color === "blue" ? "text-[#137dab]" : "text-amber-700"}`}>{title}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Regular Seats</label>
            <Select value={reg} onValueChange={(v) => v && setReg(v)}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white text-sm font-semibold focus:ring-[#137dab]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {CAPACITY_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)} className="font-semibold text-sm">{n} patients</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Seats</label>
            <Select value={prio} onValueChange={(v) => v && setPrio(v)}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white text-sm font-semibold focus:ring-[#137dab]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <SelectItem key={n} value={String(n)} className="font-semibold text-sm">{n} priority</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-700">
            <span className="shrink-0 text-rose-500">⚠</span>
            {error}
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full h-11 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-[0.98] ${btnCls}`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> :
           success ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" /> : null}
          {loading ? "Saving…" : success ? "Done!" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReceptionistDashboard() {
  const [sessionPin, setSessionPin] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // ── Active form: which template is being activated/edited ──────────────
  const [activatingTemplate, setActivatingTemplate] = useState<string | null>(null); // template label
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // ── Shared form state ──────────────────────────────────────────────────
  const [formReg, setFormReg] = useState("10");
  const [formPrio, setFormPrio] = useState("2");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Convex ────────────────────────────────────────────────────────────
  const currentSlot = useQuery(api.slots.getCurrentSlot);
  const slots = useQuery(api.slots.getSlotsWithAvailability) || [];
  const createSlotMut = useMutation(api.slots.createSlot);
  const updateSlot = useMutation(api.slots.updateSlot);
  const removeFromQueue = useMutation(api.queue.removeFromQueue);
  const doctors = useQuery(api.users.getDoctors) || [];
  const liveQueue =
    useQuery(api.queue.getLiveQueue, selectedSlotId ? { slotId: selectedSlotId as any } : {}) || [];

  // ── Session PIN ───────────────────────────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem("hd_session_pin");
    if (stored) { setSessionPin(stored); return; }
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem("hd_session_pin", pin);
    setSessionPin(pin);
  }, []);

  const refreshPin = () => {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem("hd_session_pin", pin);
    setSessionPin(pin);
  };

  // ── Find the DB slot matching a template + selected date ──────────────
  const getActiveSlot = (tmpl: typeof SLOT_TEMPLATES[number]) =>
    slots.find(
      (s: any) => s.date === selectedDate && s.startTime === tmpl.startTime && s.endTime === tmpl.endTime
    ) ?? null;

  // ── Activate a template ───────────────────────────────────────────────
  const openActivate = (label: string) => {
    setActivatingTemplate(label);
    setEditingSlotId(null);
    setFormReg("10");
    setFormPrio("2");
    setFormError("");
    setFormSuccess(false);
  };

  const handleActivate = async () => {
    const tmpl = SLOT_TEMPLATES.find((t) => t.label === activatingTemplate);
    if (!tmpl) return;
    setFormLoading(true);
    setFormError("");
    try {
      const slotId = await createSlotMut({
        date: selectedDate,
        startTime: tmpl.startTime,
        endTime: tmpl.endTime,
        regularSlots: Number(formReg),
        prioritySlots: Number(formPrio),
      });
      setFormSuccess(true);
      setTimeout(() => { setActivatingTemplate(null); setFormSuccess(false); setSelectedSlotId(slotId as any); }, 1200);
    } catch (err: any) {
      const raw: string = err?.data?.message ?? err?.message ?? "";
      const clean = raw.includes("Uncaught Error:")
        ? raw.split("Uncaught Error:")[1]?.split(" at handler")[0]?.split(" Called by")[0]?.trim()
        : raw.trim();
      setFormError(clean || "Could not activate slot. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit an existing slot ────────────────────────────────────────────
  const openEdit = (slot: any) => {
    setEditingSlotId(slot._id);
    setActivatingTemplate(null);
    setFormReg(String(slot.regularSlots));
    setFormPrio(String(slot.prioritySlots));
    setFormError("");
    setFormSuccess(false);
  };

  const handleEdit = async () => {
    if (!editingSlotId) return;
    const slot = slots.find((s: any) => s._id === editingSlotId);
    if (!slot) return;
    setFormLoading(true);
    setFormError("");
    try {
      await updateSlot({
        slotId: editingSlotId as any,
        date: slot.date ?? todayStr(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        regularSlots: Number(formReg),
        prioritySlots: Number(formPrio),
      });
      setFormSuccess(true);
      setTimeout(() => { setEditingSlotId(null); setFormSuccess(false); }, 1200);
    } catch {
      setFormError("Could not save changes. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const cancelForm = () => {
    setActivatingTemplate(null);
    setEditingSlotId(null);
    setFormError("");
  };

  // Count how many templates are active for the selected date
  const activeCount = SLOT_TEMPLATES.filter((t) => getActiveSlot(t) !== null).length;

  // ── Walk-in State ──
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInType, setWalkInType] = useState<"regular" | "priority">("regular");
  const [walkInSlotId, setWalkInSlotId] = useState<string>("");
  const [walkInAge, setWalkInAge] = useState("");
  const [walkInGender, setWalkInGender] = useState("");
  const [walkInBlood, setWalkInBlood] = useState("");
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState("");

  const registerWalkIn = useMutation(api.users.registerWalkIn);
  const saveMed = useMutation(api.medicalInfo.saveMedicalInfo);
  const bookSlot = useMutation(api.appointments.bookSlot);

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInSlotId) return;
    setWalkInLoading(true);
    setWalkInError("");
    try {
      const patientId = await registerWalkIn({ name: walkInName }) as Id<"users">;
      
      // Save initial medical particulars
      await saveMed({
        patientId,
        age: walkInAge ? parseInt(walkInAge) : undefined,
        gender: walkInGender || undefined,
        bloodType: walkInBlood || undefined,
        isDiabetic: false,
        isHypertensive: false,
        hasHeartDisease: false,
        hasAsthma: false,
      });

      await bookSlot({
        userId: patientId,
        slotId: walkInSlotId as Id<"slots">,
        type: walkInType
      });

      // Success - reset
      setShowWalkIn(false);
      setWalkInName("");
      setWalkInAge("");
      setWalkInGender("");
      setWalkInBlood("");
      setWalkInError("");
    } catch (err: any) {
      setWalkInError(err.message || "Failed to add walk-in");
    } finally {
      setWalkInLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col">
      {/* Walk-in Modal */}
      {showWalkIn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#137dab] p-6 text-white relative">
              <button onClick={() => { setShowWalkIn(false); setWalkInError(""); }} className="absolute top-6 right-6 p-1 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-black tracking-tight">Quick Walk-in</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Register & Queue Patient</p>
            </div>
            
            <form onSubmit={handleWalkInSubmit} className="p-6 space-y-5">
              {walkInError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase flex items-center gap-2">
                  <X className="w-3.5 h-3.5" /> {walkInError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Patient Name</label>
                <input 
                  autoFocus
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#137dab]/50 focus:ring-2 focus:ring-[#137dab]/10 transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Age</label>
                  <input 
                    type="number"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value)}
                    placeholder="25"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Gender</label>
                  <select 
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value)}
                    className="w-full h-11 px-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-900 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Blood</label>
                  <select 
                    value={walkInBlood}
                    onChange={(e) => setWalkInBlood(e.target.value)}
                    className="w-full h-11 px-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-900 outline-none"
                  >
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Slot & Time</label>
                  <select 
                    required
                    value={walkInSlotId}
                    onChange={(e) => setWalkInSlotId(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 outline-none focus:border-[#137dab]"
                  >
                    <option value="">Select Slot</option>
                    {slots.filter(s => (s.date === selectedDate || (!s.date && selectedDate === todayStr()))).map(s => (
                      <option key={s._id} value={s._id}>{s.startTime} - {s.endTime}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Queue Type</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl h-12">
                    <button 
                      type="button"
                      onClick={() => setWalkInType("regular")}
                      className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all ${walkInType === "regular" ? "bg-white text-[#137dab] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Regular
                    </button>
                    <button 
                      type="button"
                      onClick={() => setWalkInType("priority")}
                      className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all ${walkInType === "priority" ? "bg-white text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Priority
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setShowWalkIn(false)}
                  className="flex-1 h-12 font-black uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={walkInLoading}
                  className="flex-2 h-12 bg-[#137dab] hover:bg-[#137dab]/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_4px_12px_rgba(19,125,171,0.25)]"
                >
                  {walkInLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register & Queue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <header className="px-6 h-16 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#137dab]/10 rounded-lg">
            <Activity className="w-5 h-5 text-[#137dab]" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">HealthDesk</span>
        </div>
        <nav className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#137dab] bg-[#137dab]/10 px-3 py-1.5 rounded-full border border-[#137dab]/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#137dab] animate-pulse" />
            Receptionist
          </span>
          <Link href="/login" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Link>
        </nav>
      </header>

      <main className="p-6 lg:p-10 max-w-[96rem] mx-auto w-full space-y-8">

        {/* ── Header stats ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Command Center</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Schedule Management · Queue · Patient Tracker
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">On-duty Doctors</p>
              <p className="text-2xl font-black text-[#137dab]">{doctors.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Slots</p>
              <p className="text-2xl font-black text-[#137dab]">{activeCount}/{SLOT_TEMPLATES.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Queue</p>
              <p className="text-2xl font-black text-[#137dab]">{liveQueue.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* ══ LEFT: Schedule Management ══ */}
          <section className="lg:col-span-4 space-y-5">

            {/* Doctor Status */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
                <BriefcaseMedical className="w-3.5 h-3.5 text-[#137dab]" /> Medical Staff
              </h2>
              <div className="space-y-2">
                {doctors.length === 0 ? (
                  <div className="text-center py-5 rounded-xl border border-dashed border-slate-200 text-[11px] font-bold text-slate-400">
                    No doctors registered
                  </div>
                ) : doctors.map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#137dab]/10 text-[#137dab] flex items-center justify-center font-black text-sm">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{doc.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Physician</p>
                      </div>
                    </div>
                    {doc.wantsBreak ? (
                      <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-black gap-1 animate-pulse">
                        <Coffee className="w-3 h-3" /> Break
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Date Selector ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#137dab]" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-600">Schedule Date</h2>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setActivatingTemplate(null);
                  setEditingSlotId(null);
                  setSelectedSlotId(null);
                }}
                className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#137dab]/50 focus:ring-2 focus:ring-[#137dab]/10 transition-all"
              />
              <p className="text-[10px] font-bold text-slate-400 pl-1">{formatDate(selectedDate)}</p>
            </div>

            {/* ── Activate / Edit form ── */}
            {activatingTemplate && (
              <CapacityForm
                title={`Activate · ${activatingTemplate}`}
                subtitle={`${SLOT_TEMPLATES.find(t => t.label === activatingTemplate)?.startTime} – ${SLOT_TEMPLATES.find(t => t.label === activatingTemplate)?.endTime}`}
                reg={formReg} setReg={setFormReg}
                prio={formPrio} setPrio={setFormPrio}
                onSubmit={handleActivate}
                onCancel={cancelForm}
                loading={formLoading}
                success={formSuccess}
                error={formError}
                submitLabel="Activate Slot"
                color="blue"
              />
            )}

            {editingSlotId && (() => {
              const slot = slots.find((s: any) => s._id === editingSlotId);
              return slot ? (
                <CapacityForm
                  title={`Edit Capacity`}
                  subtitle={`${slot.startTime} – ${slot.endTime}`}
                  reg={formReg} setReg={setFormReg}
                  prio={formPrio} setPrio={setFormPrio}
                  onSubmit={handleEdit}
                  onCancel={cancelForm}
                  loading={formLoading}
                  success={formSuccess}
                  error={formError}
                  submitLabel="Save Changes"
                  color="amber"
                />
              ) : null;
            })()}

            {/* ── Slot Template Grid ── */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-[#137dab]" /> Clinic Time Blocks
                <span className="ml-auto text-[9px] text-slate-300">click to select queue</span>
              </h2>

              <div className="space-y-2.5">
                {SLOT_TEMPLATES.map((tmpl) => {
                  const activeSlot = getActiveSlot(tmpl);
                  return (
                    <TemplateTile
                      key={tmpl.label}
                      template={tmpl}
                      activeSlot={activeSlot}
                      isNow={currentSlot?._id === activeSlot?._id}
                      isQueueSelected={selectedSlotId === activeSlot?._id}
                      onActivate={() => {
                        if (editingSlotId) setEditingSlotId(null);
                        openActivate(tmpl.label);
                      }}
                      onEdit={() => {
                        if (activeSlot) openEdit(activeSlot);
                      }}
                      onSelectQueue={() => {
                        if (activeSlot) {
                          setSelectedSlotId((prev) => prev === activeSlot._id ? null : activeSlot._id);
                          setActivatingTemplate(null);
                          setEditingSlotId(null);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* ══ RIGHT: Live Queue + Kiosk ══ */}
          <section className="lg:col-span-8 space-y-6">

            {/* Queue header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#137dab]" /> Arrival Flow & Queue
                </h2>
                {!selectedSlotId && (
                  <p className="text-[10px] font-bold text-slate-400 mt-1 ml-10 uppercase tracking-widest">
                    All patients checked in today
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowWalkIn(true)}
                  className="px-3 py-1.5 bg-[#137dab] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#137dab]/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" /> + Add Walk-in
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {liveQueue.length} Present
                </div>
                {selectedSlotId && (
                  <button
                    onClick={() => setSelectedSlotId(null)}
                    className="text-[9px] font-black text-slate-400 hover:text-[#137dab] uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> All slots
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">

              {/* ── Queue table ── */}
              <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 py-3 px-5 grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="col-span-5">Patient</div>
                  <div className="col-span-2 text-center">Type</div>
                  <div className="col-span-3 text-center">Status</div>
                  <div className="col-span-2 text-right">Remove</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                  {liveQueue.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-20 text-[#137dab]" />
                      <p className="text-sm font-black">Queue is empty</p>
                      <p className="text-[10px] font-bold mt-1 text-slate-300">
                        {selectedSlotId ? "No arrivals for this slot yet" : "No patients checked in today"}
                      </p>
                    </div>
                  ) : liveQueue.map((patient: any, idx: number) => (
                    <div key={patient._id} className="px-5 py-3.5 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20 flex items-center justify-center font-black text-sm">
                            {patient.name.charAt(0)}
                          </div>
                          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-black">
                            {idx + 1}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-1">
                            {patient.name}
                            {patient.medicalInfo && <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                            <Clock className="w-2.5 h-2.5" /> {patient.time}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          patient.type === "Priority"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-500"
                        }`}>{patient.type}</span>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                          patient.status === "Consulting"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20"
                        }`}>
                          {patient.status === "Consulting"
                            ? <><Stethoscope className="w-3 h-3" /> Consulting</>
                            : <><Clock className="w-3 h-3" /> Waiting</>}
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${patient.name} from queue?`)) {
                              await removeFromQueue({ queueId: patient._id, status: "cancelled" });
                            }
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Sidebar: Pending bookings + Kiosk ── */}
              <div className="md:col-span-4 space-y-5">

                {/* Booked but not yet arrived */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedSlotId ? "Booked · Not Yet Arrived" : "Select a slot"}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {(() => {
                      const s = slots.find((s: any) => s._id === selectedSlotId);
                      if (!s) return (
                        <div className="p-6 text-center text-[11px] font-bold text-slate-300">
                          Click an active slot on the left to see upcoming bookings
                        </div>
                      );
                      const pending = s.bookedPatients?.filter((p: any) => !p.checkedIn) ?? [];
                      if (pending.length === 0) return (
                        <div className="p-6 text-center text-[11px] font-bold text-slate-400">
                          All booked patients have arrived ✓
                        </div>
                      );
                      return (
                        <div className="divide-y divide-slate-100">
                          {pending.map((bk: any, i: number) => (
                            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs">
                                  {bk.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-800">{bk.name}</p>
                                  <p className={`text-[9px] font-black uppercase ${bk.type === "priority" ? "text-amber-600" : "text-slate-400"}`}>{bk.type}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-black text-slate-300 uppercase">Pending</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Self Check-in kiosk */}
                <div className="bg-gradient-to-b from-white to-[#137dab]/5 border border-[#137dab]/20 rounded-xl shadow-md p-5 flex flex-col items-center gap-4 text-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Self Check-in Kiosk</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Share PIN or QR with arriving patients</p>
                  </div>
                  <div className="w-full bg-white border border-[#137dab]/20 rounded-xl p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#137dab] mb-1">Security PIN</p>
                    <p className="text-4xl font-extrabold tracking-widest font-mono text-slate-900">{sessionPin || "——————"}</p>
                    <button
                      onClick={refreshPin}
                      className="flex items-center gap-1.5 mx-auto mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#137dab] transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                  <div className="w-full flex justify-center p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <QRCodeSVG
                      value={typeof window !== "undefined" ? `${window.location.origin}/patient/checkin?pin=${sessionPin}` : ""}
                      size={110}
                      level="H"
                      includeMargin={false}
                      fgColor="#0f172a"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
