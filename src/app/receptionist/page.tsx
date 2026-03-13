"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, LogOut, CheckCircle2, User, UserPlus, Clock, Search, BriefcaseMedical, Plus, Loader2, Heart, Users, X, RefreshCw } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [regCapacity, setRegCapacity] = useState("10");
  const [prioCapacity, setPrioCapacity] = useState("2");
  const [creating, setCreating] = useState(false);
  const [sessionPin, setSessionPin] = useState("");

  const slots = useQuery(api.slots.getSlotsWithAvailability) || [];
  const createSlot = useMutation(api.slots.createSlot);
  const liveQueue = useQuery(api.queue.getLiveQueue) || [];

  // Generate a 6-digit PIN on mount and store in sessionStorage so it
  // persists across receptionist page refreshes but resets each day/session
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

  const handleCreateSlot = async () => {
    setCreating(true);
    try {
      await createSlot({
        startTime: startTime,
        endTime: endTime,
        regularSlots: Number(regCapacity),
        prioritySlots: Number(prioCapacity),
      });
      setShowCreate(false);
    } catch (err) {
      alert("Error creating slot");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      {/* Navbar */}
      <header className="px-6 h-24 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-1.5 bg-black rounded-lg transition-transform group-hover:-rotate-3">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-black">HealthDesk</span>
        </div>
        <nav className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-8">
          <span className="text-black bg-zinc-100 px-4 py-1.5 rounded-full flex items-center gap-2 border border-zinc-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> RECEPTION DESK
          </span>
          <Link href="/login" className="flex items-center gap-2 hover:text-black transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-[90rem] mx-auto w-full space-y-12">
        <div className="flex justify-between items-end border-b border-zinc-100 pb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-black mb-3">Main Control</h1>
            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">Operations & Queue Management</p>
          </div>
          <div className="flex gap-4">
            <Button className="neo-button h-14 px-8 text-sm">
              <UserPlus className="w-5 h-5 mr-3" /> Register Walk-in
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Slots / Schedule */}
          <section className="lg:col-span-4 space-y-8 animate-reveal">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Clock className="w-6 h-6" /> Registration Slots
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(!showCreate)} className="h-10 w-10 p-0 rounded-full border border-zinc-200 hover:bg-black hover:text-white transition-all">
                <Plus className={`w-5 h-5 transition-transform duration-300 ${showCreate ? 'rotate-45' : ''}`} />
              </Button>
            </div>

            {showCreate && (
              <Card className="neo-card animate-reveal overflow-hidden shadow-none border-zinc-200">
                <CardHeader className="py-5 bg-zinc-50 border-b border-zinc-200">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">New Operational Slot</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Start</label>
                      <Select value={startTime} onValueChange={(v) => v && setStartTime(v)}>
                        <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-black">
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">End</label>
                      <Select value={endTime} onValueChange={(v) => v && setEndTime(v)}>
                        <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-black">
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Reg Cap</label>
                      <Select value={regCapacity} onValueChange={(v) => v && setRegCapacity(v)}>
                        <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-black">
                          {[1,2,3,4,5,6,7,8,9,10,12,15,20].map((n) => (
                            <SelectItem key={n} value={String(n)} className="font-bold">{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Pri Cap</label>
                      <Select value={prioCapacity} onValueChange={(v) => v && setPrioCapacity(v)}>
                        <SelectTrigger className="h-12 rounded-xl border-zinc-200 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-black">
                          {[0,1,2,3,4,5].map((n) => (
                            <SelectItem key={n} value={String(n)} className="font-bold">{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-black text-white hover:bg-black/90 font-black rounded-xl" onClick={handleCreateSlot} disabled={creating}>
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Slot"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {slots.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-zinc-100 text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em]">
                  Awaiting Schedule Data
                </div>
              ) : slots.map((slot: any, idx: number) => {
                const totalAppts = slot.regularSlots + slot.prioritySlots;
                const capacityRemaining = slot.availableRegular + slot.availablePriority;
                const isFull = capacityRemaining === 0;

                return (
                  <Card key={slot._id} className={`neo-card shadow-none transition-all group ${isFull ? 'bg-zinc-50 border-zinc-200 grayscale shadow-none' : 'hover:-translate-y-1'} animate-reveal`} style={{ animationDelay: `${idx * 50}ms` }}>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black">
                          {slot.startTime}
                        </CardTitle>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{slot.endTime}</p>
                      </div>
                      {isFull ? (
                        <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase rounded-full">Full</div>
                      ) : (
                        <div className="px-3 py-1 border border-black text-black text-[9px] font-black uppercase rounded-full">
                          {capacityRemaining} Left
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pb-5 space-y-3">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span>Reg: {slot.availableRegular}/{slot.regularSlots}</span>
                        <span>Pri: {slot.availablePriority}/{slot.prioritySlots}</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200">
                        <div
                          className={`h-full transition-all duration-1000 ${isFull ? 'bg-zinc-400' : 'bg-black'}`}
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
          <section className="lg:col-span-8 space-y-8 animate-reveal" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6" /> Live Clinic Arrival Queue
              </h2>
              <div className="flex items-center gap-2">
                 <div className="px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                   {liveQueue.length} Present
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-10">
              {/* Queue List */}
              <Card className="md:col-span-12 lg:col-span-8 neo-card shadow-none border-zinc-200 overflow-hidden">
                <div className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] py-5 px-8 grid grid-cols-4">
                  <div className="col-span-2">Patient Details</div>
                  <div>Status</div>
                  <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-zinc-100">
                  {liveQueue.length === 0 ? (
                    <div className="p-32 text-center text-zinc-300">
                       <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">Empty Queue</p>
                    </div>
                  ) : liveQueue.map((patient: any, idx: number) => (
                    <div key={patient._id} className="p-6 px-8 grid grid-cols-4 items-center group hover:bg-zinc-50 transition-all font-bold animate-reveal" style={{ animationDelay: `${idx * 40}ms` }}>
                      <div className="col-span-2 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center font-black text-xl group-hover:bg-black group-hover:text-white transition-all">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-lg tracking-tight flex items-center gap-2">
                            {patient.name}
                            {patient.medicalInfo && (
                              <Heart className="w-3.5 h-3.5 fill-black" />
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${patient.type === 'Priority' ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-400'}`}>
                              {patient.type}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-300 flex items-center gap-1 uppercase">
                              <Clock className="w-3 h-3" /> {patient.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase border ${patient.status === 'Consulting' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' : 'bg-white text-zinc-500 border-zinc-200'}`}>
                          {patient.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-black hover:text-white border border-transparent hover:border-black transition-all">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Scan Card */}
              <Card className="md:col-span-12 lg:col-span-4 neo-card shadow-none border-black p-8 flex flex-col items-center justify-between text-center space-y-10 group">
                <div className="space-y-1">
                   <h3 className="font-black text-2xl tracking-tighter">Self-Check-in</h3>
                   <div className="h-1.5 w-8 bg-black mx-auto rounded-full" />
                </div>

                <div className="w-full bg-black text-white rounded-3xl p-8 space-y-4 shadow-xl transition-transform hover:-translate-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Security PIN</p>
                  <p className="text-6xl font-black tracking-[0.2em] font-mono">
                    {sessionPin || "------"}
                  </p>
                  <button
                    onClick={refreshPin}
                    className="flex items-center gap-2 mx-auto pt-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>

                <div className="w-full space-y-6">
                  <div className="flex justify-center p-6 rounded-3xl border-2 border-zinc-100 bg-zinc-50/50 group-hover:border-black transition-all duration-500">
                    <QRCodeSVG 
                      value={typeof window !== 'undefined' ? `${window.location.origin}/patient/checkin?pin=${sessionPin}` : ""} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Connection Diagnostics</p>
                     <div className="bg-zinc-100 p-4 rounded-2xl border border-zinc-200 space-y-2">
                        <p className="text-[9px] font-bold text-zinc-500 break-all select-all">IP: 192.168.26.197</p>
                        <p className="text-[9px] font-bold text-zinc-500 break-all select-all lowercase font-mono">https://giant-walls-go.loca.lt</p>
                     </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
