"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, LogOut, CheckCircle2, User, UserPlus, Clock, Search, BriefcaseMedical, Plus, Loader2, Heart, Users, X, RefreshCw, Coffee, Calendar, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { QRCodeSVG } from "qrcode.react";

const TIME_OPTIONS = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
  "09:00 PM",
];

export default function ReceptionistDashboard() {
  const [sessionPin, setSessionPin] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Edit slot state
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editReg, setEditReg] = useState("");
  const [editPrio, setEditPrio] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const currentSlot = useQuery(api.slots.getCurrentSlot);
  const slots = useQuery(api.slots.getSlotsWithAvailability) || [];
  const updateSlot = useMutation(api.slots.updateSlot);
  const removeFromQueue = useMutation(api.queue.removeFromQueue);
  const doctors = useQuery(api.users.getDoctors) || [];
  
  // Show full daily queue by default, or filter if a specific slot is clicked
  const liveQueue = useQuery(api.queue.getLiveQueue, selectedSlotId ? { slotId: selectedSlotId as any } : {}) || [];

  // Metadata for headers
  const activeSlotDisplayId = selectedSlotId || currentSlot?._id || null;

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

  const handleOpenEdit = (slot: any) => {
    setIsEditing(true);
    setEditDate(slot.date || new Date().toISOString().split('T')[0]);
    setEditStart(slot.startTime);
    setEditEnd(slot.endTime);
    setEditReg(String(slot.regularSlots));
    setEditPrio(String(slot.prioritySlots));
  };

  const handleSaveEdit = async () => {
    if (!activeSlotDisplayId) return;
    setSavingEdit(true);
    try {
      await updateSlot({
        slotId: activeSlotDisplayId as any,
        date: editDate,
        startTime: editStart,
        endTime: editEnd,
        regularSlots: Number(editReg),
        prioritySlots: Number(editPrio),
      });
      setIsEditing(false);
    } catch (err) {
      alert("Error updating slot");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="px-6 h-20 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-[#137dab]/10 rounded-xl">
            <Activity className="w-6 h-6 text-[#137dab]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
        <nav className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-8">
          <span className="text-[#137dab] bg-[#137dab]/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#137dab]/20 uppercase">
             Jane • Control Desk
          </span>
          <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-[90rem] mx-auto w-full space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Command Center</h1>
            <p className="text-slate-500 font-medium text-sm">Live Directory & Queue Master</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Doctors</p>
                <p className="text-2xl font-bold text-[#137dab]">{doctors?.length || 0}</p>
             </div>
             <div className="h-8 w-px bg-slate-300" />
             <div className="flex flex-col items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Global Queue</p>
                <p className="text-2xl font-bold text-[#137dab]">{liveQueue?.length || 0}</p>
             </div>
             <div className="ml-4">
               <Button className="h-12 px-6 text-sm font-semibold bg-[#137dab] hover:bg-[#137dab]/90 text-white rounded-lg shadow-sm">
                 <UserPlus className="w-5 h-5 mr-2" /> Register Walk-in
               </Button>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Medical Staff & Registration Slots */}
          <section className="lg:col-span-4 space-y-8">
            {/* Doctor Status Panel */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <BriefcaseMedical className="w-5 h-5 text-[#137dab]" /> Medical Staff
              </h2>
              <div className="grid gap-3">
                {doctors.map((doc: any) => (
                  <div key={doc._id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#137dab]/10 text-[#137dab] flex items-center justify-center font-bold">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase border border-slate-200 rounded px-1.5 py-0.5 mt-1 inline-block">On Duty</p>
                      </div>
                    </div>
                    {doc.wantsBreak ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none animate-pulse flex items-center gap-1.5 px-3 py-1">
                        <Coffee className="w-3 h-3" /> Break Req
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5 px-3 py-1 font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </Badge>
                    )}
                  </div>
                ))}
                {doctors.length === 0 && (
                  <p className="text-center py-4 text-xs font-semibold text-slate-500">No doctors active</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Clock className="w-5 h-5 text-[#137dab]" /> Schedule Blocks
              </h2>
              {activeSlotDisplayId && !isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const s = slots.find((s: any) => s._id === activeSlotDisplayId);
                    if (s) handleOpenEdit(s);
                  }} 
                  className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Selected
                </Button>
              )}
            </div>

            {isEditing && (
              <Card className="border border-[#137dab]/20 shadow-xl shadow-[#137dab]/5 bg-white overflow-hidden rounded-2xl mb-8 animate-reveal">
                <CardHeader className="py-5 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-[11px] font-black uppercase tracking-widest text-[#137dab]">Edit Block Capacity</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Operating Date</label>
                    <Input 
                      type="date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full h-12 px-4 border-slate-200 bg-white rounded-xl shadow-sm font-semibold text-slate-900 focus-visible:ring-[#137dab]/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Start Time</label>
                      <Select value={editStart} onValueChange={(v) => v && setEditStart(v)}>
                        <SelectTrigger className="w-full h-12 px-4 border-slate-200 bg-white rounded-xl shadow-sm hover:border-[#137dab]/30 font-semibold text-slate-900 focus:ring-[#137dab]/50">
                          <SelectValue placeholder="Start Time" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t} className="font-semibold cursor-pointer rounded-lg focus:bg-slate-100">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">End Time</label>
                      <Select value={editEnd} onValueChange={(v) => v && setEditEnd(v)}>
                        <SelectTrigger className="w-full h-12 px-4 border-slate-200 bg-white rounded-xl shadow-sm hover:border-[#137dab]/30 font-semibold text-slate-900 focus:ring-[#137dab]/50">
                          <SelectValue placeholder="End Time" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t} className="font-semibold cursor-pointer rounded-lg focus:bg-slate-100">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Regular Seats</label>
                      <Select value={editReg} onValueChange={(v) => v && setEditReg(v)}>
                        <SelectTrigger className="w-full h-12 px-4 border-slate-200 bg-white rounded-xl shadow-sm hover:border-[#137dab]/30 font-semibold text-slate-900 focus:ring-[#137dab]/50">
                          <SelectValue placeholder="Capacity" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                          {[1,2,3,4,5,6,7,8,9,10,12,15,20,25,30].map((n) => (
                            <SelectItem key={n} value={String(n)} className="font-semibold cursor-pointer rounded-lg focus:bg-slate-100">{n} Patients</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Priority Seats</label>
                      <Select value={editPrio} onValueChange={(v) => v && setEditPrio(v)}>
                        <SelectTrigger className="w-full h-12 px-4 border-slate-200 bg-white rounded-xl shadow-sm hover:border-[#137dab]/30 font-semibold text-slate-900 focus:ring-[#137dab]/50">
                          <SelectValue placeholder="Capacity" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                          {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                            <SelectItem key={n} value={String(n)} className="font-semibold cursor-pointer rounded-lg focus:bg-slate-100">{n} VIP/Priority</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full h-14 mt-6 bg-[#137dab] text-white hover:bg-[#137dab]/90 font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_5px_15px_rgba(19,125,171,0.3)] transition-all active:scale-[0.98] active:shadow-sm" onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {slots.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 bg-slate-100 text-slate-500 text-sm font-medium">
                  Awaiting Schedule Data
                </div>
              ) : slots.map((slot: any) => {
                const totalAppts = slot.regularSlots + slot.prioritySlots;
                const capacityRemaining = slot.availableRegular + slot.availablePriority;
                const isFull = capacityRemaining === 0;

                return (
                  <Card 
                    key={slot._id} 
                    onClick={() => { setSelectedSlotId(slot._id); setIsEditing(false); }}
                    className={`transition-all cursor-pointer border rounded-xl overflow-hidden ${activeSlotDisplayId === slot._id ? 'border-[#137dab] bg-[#137dab]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-[#137dab]/40 shadow-sm'}`} 
                  >
                    <CardHeader className="pb-3 p-4 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${activeSlotDisplayId === slot._id ? 'text-[#137dab]' : 'text-slate-500'}`}>
                           <Calendar className="w-3.5 h-3.5" /> {slot.date || "Today"}
                           {currentSlot?._id === slot._id && (
                             <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px]">NOW</span>
                           )}
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {slot.startTime} <span className="text-sm font-semibold text-slate-500">- {slot.endTime}</span>
                        </CardTitle>
                      </div>
                      {isFull ? (
                        <div className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md border border-slate-200">Full</div>
                      ) : (
                        <div className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md ${activeSlotDisplayId === slot._id ? 'bg-[#137dab] text-white' : 'border border-[#137dab]/20 text-[#137dab] bg-[#137dab]/10'}`}>
                          {capacityRemaining} Left
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pb-4 p-4 pt-0 space-y-2.5">
                      <div className={`flex justify-between text-[11px] font-semibold ${activeSlotDisplayId === slot._id ? 'text-[#137dab]' : 'text-slate-500'}`}>
                        <span>Reg: <span className="text-slate-900">{slot.availableRegular}/{slot.regularSlots}</span></span>
                        <span>Pri: <span className="text-slate-900">{slot.availablePriority}/{slot.prioritySlots}</span></span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${activeSlotDisplayId === slot._id ? 'bg-[#137dab]/20' : 'bg-slate-100'}`}>
                        <div
                          className={`h-full transition-all bg-[#137dab]`}
                          style={{ width: `${((totalAppts - capacityRemaining) / totalAppts) * 100}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Queue / Kiosk */}
          <section className="lg:col-span-8 space-y-6">
            {/* Header with Slot Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <span className="w-8 h-8 rounded-lg bg-[#137dab]/10 flex items-center justify-center"><Users className="w-4 h-4 text-[#137dab]" /></span> Live Clinic Arrival Queue
                </h2>
                {slots.find((s: any) => s._id === activeSlotDisplayId) && (
                  <p className="text-xs font-semibold text-slate-500 mt-1 ml-10">
                    Viewing details for block <span className="text-slate-900 font-bold">{slots.find((s: any) => s._id === activeSlotDisplayId)?.startTime} - {slots.find((s: any) => s._id === activeSlotDisplayId)?.endTime}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                 <div className="px-3 py-1 bg-[#137dab] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> {liveQueue.length} Present
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
              {/* Queue List */}
              <Card className="md:col-span-12 lg:col-span-8 border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-6 grid grid-cols-4">
                  <div className="col-span-2">Patient Details</div>
                  <div>Status</div>
                  <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {liveQueue.length === 0 ? (
                    <div className="p-20 text-center text-slate-400">
                       <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#137dab]" />
                       <p className="text-sm font-medium">Empty Queue Block</p>
                    </div>
                  ) : liveQueue.map((patient: any) => (
                    <div key={patient._id} className="p-4 px-6 grid grid-cols-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20 flex items-center justify-center font-bold text-lg">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {patient.name}
                            {patient.medicalInfo && (
                              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${patient.type === 'Priority' ? 'bg-[#137dab]/10 text-[#137dab]' : 'bg-slate-100 text-slate-600'}`}>
                              {patient.type}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 uppercase">
                              <Clock className="w-3 h-3" /> {patient.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                         <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${patient.status === 'Consulting' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          {patient.status === 'Consulting' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {patient.status}
                        </div>
                      </div>
                      <div className="text-right flex justify-end">
                        <Button 
                          onClick={async () => {
                            if (confirm(`Remove ${patient.name} from queue?`)) {
                              await removeFromQueue({ queueId: patient._id, status: "cancelled" });
                            }
                          }}
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full hover:bg-rose-100 hover:text-rose-600 text-slate-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Expected List / Bookings */}
              <div className="md:col-span-12 lg:col-span-4 space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Provisioned Blocks
                  </div>
                  <div className="p-0">
                    {(() => {
                      const activeSlot = slots.find((s: any) => s._id === activeSlotDisplayId);
                      const pendingBookings = activeSlot?.bookedPatients?.filter((p: any) => !p.checkedIn) || [];
                      
                      if (!activeSlot) {
                         return <div className="p-8 text-center text-slate-400 text-xs font-medium">No block selected</div>;
                      }

                      if (pendingBookings.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400">
                            <p className="text-xs font-medium bg-slate-50 py-2 rounded-lg border border-slate-100">All Bookings Fulfilled</p>
                          </div>
                        );
                      }

                      return (
                        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                          {pendingBookings.map((bk: any, i: number) => (
                            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600">
                                  {bk.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 leading-tight">{bk.name}</p>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">{bk.type} seat</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </Card>

                {/* Scan Card */}
                <Card className="border-[#137dab]/20 shadow-md bg-gradient-to-b from-white to-[#137dab]/5 p-6 flex flex-col items-center justify-between text-center space-y-6">
                  <div className="space-y-1">
                     <h3 className="font-bold text-xl text-slate-900">Self-Check-in Kiosk</h3>
                     <p className="text-xs text-slate-500">Provide PIN or QR to arriving patients</p>
                  </div>

                  <div className="w-full bg-white border border-[#137dab]/20 rounded-xl p-5 space-y-2 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#137dab]/5 border-l border-b border-[#137dab]/10 rounded-bl-3xl -z-0"></div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#137dab] relative z-10">Security PIN</p>
                    <p className="text-4xl font-extrabold tracking-widest font-mono text-slate-900 relative z-10">
                      {sessionPin || "------"}
                    </p>
                    <button
                      onClick={refreshPin}
                      className="flex items-center gap-1.5 mx-auto pt-2 text-xs font-semibold text-slate-400 hover:text-[#137dab] transition-colors relative z-10"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex justify-center p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <QRCodeSVG 
                        value={typeof window !== 'undefined' ? `${window.location.origin}/patient/checkin?pin=${sessionPin}` : ""} 
                        size={120} 
                        level="H"
                        includeMargin={false}
                        fgColor="#0f172a"
                      />
                    </div>
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
