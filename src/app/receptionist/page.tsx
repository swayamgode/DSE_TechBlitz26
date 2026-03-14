"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, LogOut, CheckCircle2, User, Clock, BriefcaseMedical,
  Plus, Loader2, Heart, Users, X, RefreshCw, Coffee, Calendar,
  Pencil, ChevronDown, ChevronUp, UserCheck, UserX, Stethoscope,
  AlertCircle, ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { QRCodeSVG } from "qrcode.react";

const TIME_OPTIONS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM",
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM", "08:30 PM", "09:00 PM",
];

const CAPACITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Slot card with expandable bookings list ──────────────────────────────────
function SlotCard({
  slot,
  isActive,
  isNow,
  onClick,
  onEdit,
}: {
  slot: any;
  isActive: boolean;
  isNow: boolean;
  onClick: () => void;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalSeats = slot.regularSlots + slot.prioritySlots;
  const booked = slot.bookedPatients?.length ?? 0;
  const checkedIn = slot.bookedPatients?.filter((p: any) => p.checkedIn).length ?? 0;
  const pct = totalSeats > 0 ? Math.round((booked / totalSeats) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer bg-white shadow-sm ${
        isActive
          ? "border-[#137dab] shadow-[0_0_0_2px_rgba(19,125,171,0.15)]"
          : "border-slate-200 hover:border-[#137dab]/40"
      }`}
    >
      {/* Header row */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <Calendar className="w-3 h-3" />
            {slot.date || "Today"}
            {isNow && (
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black ml-1">
                NOW
              </span>
            )}
          </div>
          <p className="text-base font-black text-slate-900">
            {slot.startTime}{" "}
            <span className="text-sm font-semibold text-slate-400">— {slot.endTime}</span>
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-bold text-slate-500">
              Reg <span className="text-slate-800">{slot.availableRegular}/{slot.regularSlots}</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Pri <span className="text-slate-800">{slot.availablePriority}/{slot.prioritySlots}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
            booked === totalSeats
              ? "bg-slate-100 text-slate-500"
              : isActive
              ? "bg-[#137dab] text-white"
              : "bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20"
          }`}>
            {booked === totalSeats ? "Full" : `${totalSeats - booked} left`}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#137dab] flex items-center gap-1 transition-colors"
          >
            <Pencil className="w-3 h-3" /> edit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-3">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#137dab] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Bookings toggle */}
      {booked > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#137dab] hover:bg-[#137dab]/5 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-3 h-3" />
            {booked} booked · {checkedIn} checked in
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Expanded booking list */}
      {expanded && booked > 0 && (
        <div className="border-t border-slate-100 divide-y divide-slate-50 bg-white">
          {slot.bookedPatients.map((p: any, i: number) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#137dab]/10 text-[#137dab] flex items-center justify-center font-black text-xs">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{p.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${
                    p.type === "priority" ? "text-amber-600" : "text-slate-400"
                  }`}>{p.type}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                p.checkedIn
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {p.checkedIn
                  ? <><UserCheck className="w-3 h-3" /> Present</>
                  : <><UserX className="w-3 h-3" /> Pending</>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReceptionistDashboard() {
  const [sessionPin, setSessionPin] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // ── Create slot panel state ────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState(todayStr());
  const [createStart, setCreateStart] = useState("09:00 AM");
  const [createEnd, setCreateEnd] = useState("10:00 AM");
  const [createReg, setCreateReg] = useState("10");
  const [createPrio, setCreatePrio] = useState("2");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // ── Edit slot panel state ──────────────────────────────────────────
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editReg, setEditReg] = useState("");
  const [editPrio, setEditPrio] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Convex ────────────────────────────────────────────────────────
  const currentSlot = useQuery(api.slots.getCurrentSlot);
  const slots = useQuery(api.slots.getSlotsWithAvailability) || [];
  const createSlotMut = useMutation(api.slots.createSlot);
  const updateSlot = useMutation(api.slots.updateSlot);
  const removeFromQueue = useMutation(api.queue.removeFromQueue);
  const doctors = useQuery(api.users.getDoctors) || [];
  const liveQueue =
    useQuery(api.queue.getLiveQueue, selectedSlotId ? { slotId: selectedSlotId as any } : {}) || [];

  const activeSlotDisplayId = selectedSlotId || currentSlot?._id || null;

  // ── Session PIN ───────────────────────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem("hd_session_pin");
    if (stored) {
      setSessionPin(stored);
    } else {
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      sessionStorage.setItem("hd_session_pin", pin);
      setSessionPin(pin);
    }
  }, []);

  const refreshPin = () => {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem("hd_session_pin", pin);
    setSessionPin(pin);
  };

  // ── Create slot ───────────────────────────────────────────────────
  const handleCreateSlot = async () => {
    setCreating(true);
    try {
      await createSlotMut({
        date: createDate,
        startTime: createStart,
        endTime: createEnd,
        regularSlots: Number(createReg),
        prioritySlots: Number(createPrio),
      });
      setCreateSuccess(true);
      setTimeout(() => { setCreateSuccess(false); setShowCreate(false); }, 1800);
    } catch {
      alert("Error creating slot — check time values.");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit slot ─────────────────────────────────────────────────────
  const handleOpenEdit = (slot: any) => {
    setEditingSlotId(slot._id);
    setEditDate(slot.date || todayStr());
    setEditStart(slot.startTime);
    setEditEnd(slot.endTime);
    setEditReg(String(slot.regularSlots));
    setEditPrio(String(slot.prioritySlots));
    setShowCreate(false);
  };

  const handleSaveEdit = async () => {
    if (!editingSlotId) return;
    setSavingEdit(true);
    try {
      await updateSlot({
        slotId: editingSlotId as any,
        date: editDate,
        startTime: editStart,
        endTime: editEnd,
        regularSlots: Number(editReg),
        prioritySlots: Number(editPrio),
      });
      setEditingSlotId(null);
    } catch {
      alert("Error updating slot");
    } finally {
      setSavingEdit(false);
    }
  };

  // Shared select class for form fields
  const selTrigger =
    "w-full h-11 px-3 border-slate-200 bg-white rounded-xl shadow-sm hover:border-[#137dab]/40 font-semibold text-sm text-slate-900 focus:ring-[#137dab]/30";

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800">
      {/* ── Navbar ── */}
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
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-[96rem] mx-auto w-full space-y-8">

        {/* ── Hero bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Command Center</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Slot Management · Live Queue · Patient Tracker
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">On-duty Doctors</p>
              <p className="text-2xl font-black text-[#137dab]">{doctors.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Slots</p>
              <p className="text-2xl font-black text-[#137dab]">{slots.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Queue</p>
              <p className="text-2xl font-black text-[#137dab]">{liveQueue.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* ══ LEFT COLUMN: Staff + Slot Management ══ */}
          <section className="lg:col-span-4 space-y-6">

            {/* Doctor Status */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
                <BriefcaseMedical className="w-4 h-4 text-[#137dab]" /> Medical Staff
              </h2>
              <div className="space-y-2">
                {doctors.length === 0 ? (
                  <div className="text-center py-6 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400">
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

            {/* ── Schedule Blocks ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#137dab]" /> Schedule Blocks
                </h2>
                <button
                  onClick={() => { setShowCreate((v) => !v); setEditingSlotId(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    showCreate
                      ? "bg-slate-200 text-slate-600"
                      : "bg-[#137dab] text-white shadow-[0_4px_10px_rgba(19,125,171,0.3)] hover:bg-[#137dab]/90"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showCreate ? "Cancel" : "New Slot"}
                </button>
              </div>

              {/* ── Create Slot Form ── */}
              {showCreate && (
                <Card className="border border-[#137dab]/25 shadow-lg bg-white rounded-2xl overflow-hidden mb-4">
                  <CardHeader className="py-4 px-5 bg-gradient-to-r from-[#137dab]/8 to-transparent border-b border-slate-100">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-[#137dab] flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Create New Slot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">

                    {/* Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                      <Input
                        type="date"
                        value={createDate}
                        onChange={(e) => setCreateDate(e.target.value)}
                        className="h-11 rounded-xl border-slate-200 bg-white shadow-sm font-semibold text-sm text-slate-900 focus-visible:ring-[#137dab]/30"
                      />
                    </div>

                    {/* Start / End Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Time</label>
                        <Select value={createStart} onValueChange={(v) => v && setCreateStart(v)}>
                          <SelectTrigger className={selTrigger}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t} className="font-semibold text-sm">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Time</label>
                        <Select value={createEnd} onValueChange={(v) => v && setCreateEnd(v)}>
                          <SelectTrigger className={selTrigger}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t} className="font-semibold text-sm">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Regular Seats</label>
                        <Select value={createReg} onValueChange={(v) => v && setCreateReg(v)}>
                          <SelectTrigger className={selTrigger}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {CAPACITY_OPTIONS.map((n) => (
                              <SelectItem key={n} value={String(n)} className="font-semibold text-sm">{n} patients</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Seats</label>
                        <Select value={createPrio} onValueChange={(v) => v && setCreatePrio(v)}>
                          <SelectTrigger className={selTrigger}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <SelectItem key={n} value={String(n)} className="font-semibold text-sm">{n} priority</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateSlot}
                      disabled={creating}
                      className="w-full h-12 bg-[#137dab] text-white hover:bg-[#137dab]/90 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_4px_12px_rgba(19,125,171,0.25)] transition-all active:scale-[0.98]"
                    >
                      {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : createSuccess ? (
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {creating ? "Creating…" : createSuccess ? "Slot Created!" : "Create Slot"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* ── Edit Slot Form ── */}
              {editingSlotId && (
                <Card className="border border-amber-200 shadow-lg bg-white rounded-2xl overflow-hidden mb-4">
                  <CardHeader className="py-4 px-5 bg-amber-50 border-b border-amber-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                      <Pencil className="w-3.5 h-3.5" /> Edit Slot
                    </CardTitle>
                    <button onClick={() => setEditingSlotId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                      <Input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="h-11 rounded-xl border-slate-200 bg-white shadow-sm font-semibold text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start</label>
                        <Select value={editStart} onValueChange={(v) => v && setEditStart(v)}>
                          <SelectTrigger className={selTrigger}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {TIME_OPTIONS.map((t) => <SelectItem key={t} value={t} className="font-semibold text-sm">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End</label>
                        <Select value={editEnd} onValueChange={(v) => v && setEditEnd(v)}>
                          <SelectTrigger className={selTrigger}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {TIME_OPTIONS.map((t) => <SelectItem key={t} value={t} className="font-semibold text-sm">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Regular</label>
                        <Select value={editReg} onValueChange={(v) => v && setEditReg(v)}>
                          <SelectTrigger className={selTrigger}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {CAPACITY_OPTIONS.map((n) => <SelectItem key={n} value={String(n)} className="font-semibold text-sm">{n} patients</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                        <Select value={editPrio} onValueChange={(v) => v && setEditPrio(v)}>
                          <SelectTrigger className={selTrigger}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {[0,1,2,3,4,5,6,7,8,9,10].map((n) => <SelectItem key={n} value={String(n)} className="font-semibold text-sm">{n} priority</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="w-full h-12 bg-amber-500 text-white hover:bg-amber-600 font-black uppercase tracking-widest text-[10px] rounded-xl shadow transition-all active:scale-[0.98]"
                    >
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      {savingEdit ? "Saving…" : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* ── Slot List ── */}
              {slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-slate-300 bg-white text-center">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-sm font-black text-slate-400">No slots yet</p>
                  <p className="text-[10px] font-bold text-slate-300 mt-1">Click "New Slot" to create one</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {slots.map((slot: any) => (
                    <SlotCard
                      key={slot._id}
                      slot={slot}
                      isActive={activeSlotDisplayId === slot._id}
                      isNow={currentSlot?._id === slot._id}
                      onClick={() => { setSelectedSlotId(slot._id); setEditingSlotId(null); setShowCreate(false); }}
                      onEdit={() => handleOpenEdit(slot)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ══ RIGHT COLUMN: Live Queue + Kiosk ══ */}
          <section className="lg:col-span-8 space-y-6">

            {/* Queue header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#137dab]/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#137dab]" />
                  </span>
                  Live Arrival Queue
                </h2>
                {activeSlotDisplayId && (() => {
                  const s = slots.find((s: any) => s._id === activeSlotDisplayId);
                  return s ? (
                    <p className="text-[10px] font-bold text-slate-400 mt-1 ml-10 uppercase tracking-widest">
                      Slot: {s.startTime} — {s.endTime} · {s.date || "Today"}
                    </p>
                  ) : null;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#137dab] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {liveQueue.length} Present
                </div>
                {!selectedSlotId && (
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">All today's slots</span>
                )}
                {selectedSlotId && (
                  <button
                    onClick={() => setSelectedSlotId(null)}
                    className="text-[9px] font-black text-slate-400 hover:text-[#137dab] uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear filter
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">

              {/* ── Queue Table ── */}
              <Card className="md:col-span-8 border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
                <div className="bg-slate-50 border-b border-slate-200 py-3 px-5 grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="col-span-5">Patient</div>
                  <div className="col-span-2 text-center">Type</div>
                  <div className="col-span-3 text-center">Status</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                  {liveQueue.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-20 text-[#137dab]" />
                      <p className="text-sm font-black">Queue is empty</p>
                      <p className="text-[10px] font-bold mt-1">
                        {selectedSlotId ? "No arrivals for this slot yet" : "No patients checked in today"}
                      </p>
                    </div>
                  ) : liveQueue.map((patient: any, idx: number) => (
                    <div
                      key={patient._id}
                      className="px-5 py-3.5 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors"
                    >
                      {/* Patient info */}
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

                      {/* Type badge */}
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          patient.type === "Priority"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {patient.type}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-3 flex justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                          patient.status === "Consulting"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20"
                        }`}>
                          {patient.status === "Consulting"
                            ? <><Stethoscope className="w-3 h-3" /> Consulting</>
                            : <><Clock className="w-3 h-3" /> Waiting</>
                          }
                        </div>
                      </div>

                      {/* Remove */}
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${patient.name} from queue?`)) {
                              await removeFromQueue({ queueId: patient._id, status: "cancelled" });
                            }
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                          title="Remove from queue"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* ── Sidebar: Bookings + Kiosk ── */}
              <div className="md:col-span-4 space-y-5">

                {/* Booked (not yet arrived) for selected slot */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
                  <div className="bg-slate-50 border-b border-slate-200 py-3 px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {activeSlotDisplayId ? "Booked — Not Arrived" : "Select a Slot"}
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {(() => {
                      const activeSlot = slots.find((s: any) => s._id === activeSlotDisplayId);
                      if (!activeSlot) {
                        return (
                          <div className="p-8 text-center text-slate-400 text-[11px] font-bold">
                            Click a slot to see bookings
                          </div>
                        );
                      }
                      const pending = activeSlot.bookedPatients?.filter((p: any) => !p.checkedIn) || [];
                      if (pending.length === 0) {
                        return (
                          <div className="p-6 text-center text-slate-400 text-[11px] font-bold">
                            All booked patients have arrived
                          </div>
                        );
                      }
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
                                  <p className={`text-[9px] font-black uppercase ${
                                    bk.type === "priority" ? "text-amber-600" : "text-slate-400"
                                  }`}>{bk.type}</p>
                                </div>
                              </div>
                              <User className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </Card>

                {/* Kiosk */}
                <Card className="border-[#137dab]/20 bg-gradient-to-b from-white to-[#137dab]/5 shadow-md rounded-xl p-5 flex flex-col items-center gap-5 text-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Self Check-in Kiosk</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Give PIN or QR to arriving patients</p>
                  </div>

                  <div className="w-full bg-white border border-[#137dab]/20 rounded-xl p-4 shadow-sm text-center space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#137dab]">Security PIN</p>
                    <p className="text-4xl font-extrabold tracking-widest font-mono text-slate-900">{sessionPin || "——————"}</p>
                    <button
                      onClick={refreshPin}
                      className="flex items-center gap-1.5 mx-auto text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#137dab] transition-colors pt-1"
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
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
