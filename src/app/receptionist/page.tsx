"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, LogOut, CheckCircle2, User, UserPlus, Clock, Search, BriefcaseMedical, Plus, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
        <nav className="text-sm font-medium text-slate-600 flex items-center gap-6">
          <span className="text-amber-900 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
            <BriefcaseMedical className="w-3 h-3" /> Reception
          </span>
          <Link href="/login" className="flex items-center gap-2 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Receptionist Dashboard</h1>
            <p className="text-slate-600">Managing Front Desk & Queues</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <UserPlus className="w-4 h-4 mr-2" /> Walk-in
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions / Slots */}
          <section className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" /> Today&apos;s Slots
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(!showCreate)} className="h-8 shadow-sm">
                <Plus className="w-4 h-4 mr-1 text-slate-400" /> New
              </Button>
            </div>

            {showCreate && (
              <Card className="bg-white border-blue-200 shadow-sm">
                <CardHeader className="py-4 border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-sm font-semibold text-slate-700">Create Custom Slot</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium tracking-wide">Start Time</label>
                      <Select value={startTime} onValueChange={(v) => v && setStartTime(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium tracking-wide">End Time</label>
                      <Select value={endTime} onValueChange={(v) => v && setEndTime(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-emerald-600 font-medium tracking-wide">Regular Capacity</label>
                      <Select value={regCapacity} onValueChange={(v) => v && setRegCapacity(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10,12,15,20].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-amber-600 font-medium tracking-wide">Priority Capacity</label>
                      <Select value={prioCapacity} onValueChange={(v) => v && setPrioCapacity(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full mt-2 h-9 bg-blue-600 hover:bg-blue-700" onClick={handleCreateSlot} disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Slot"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {slots.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">No slots created yet. Click &quot;New&quot; to add one.</div>
              ) : slots.map((slot: any) => {
                const totalAppts = slot.regularSlots + slot.prioritySlots;
                const capacityRemaining = slot.availableRegular + slot.availablePriority;
                const isFull = capacityRemaining === 0;

                return (
                  <Card key={slot._id} className={`border shadow-none ${isFull ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-blue-100 hover:border-blue-300'} transition-colors`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex justify-between">
                        {slot.startTime} - {slot.endTime}
                        {isFull ? (
                          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Full</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {capacityRemaining} left
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-500 pb-4">
                      <div className="flex justify-between mb-1">
                        <span>Reg: {slot.availableRegular}/{slot.regularSlots}</span>
                        <span>Pri: {slot.availablePriority}/{slot.prioritySlots}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full ${isFull ? 'bg-red-400' : 'bg-blue-500'}`}
                          style={{ width: `${((totalAppts - capacityRemaining) / totalAppts) * 100}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Active Queue / Clinic Management */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Patients at Clinic
              </h2>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 px-3 py-1">
                {liveQueue.length} in Queue
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Actual Live Queue List */}
              <Card className="border-slate-200 overflow-hidden bg-white shadow-sm md:col-span-2">
                <div className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-6 grid grid-cols-4 border-b border-slate-100">
                  <div className="col-span-2">Patient</div>
                  <div>Status</div>
                  <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {liveQueue.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-medium">No one is currently checked into the clinic queue.</div>
                  ) : liveQueue.map((patient: any) => (
                    <div key={patient._id} className="p-4 px-6 grid grid-cols-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{patient.name}</p>
                          <div className="flex items-center text-xs text-slate-500 mt-0.5">
                            <Badge variant="outline" className={`min-w-16 justify-center ${patient.type === 'Priority' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-slate-200 text-slate-600'} mr-2 rounded-full px-1.5 py-0 text-[10px]`}>
                              {patient.type}
                            </Badge>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Arr: {patient.time}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge variant="secondary" className={`${patient.status === 'Consulting' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-red-600">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Patient Scan Kiosk Display Card */}
              <Card className="bg-white border-2 border-blue-200 text-center flex flex-col items-center justify-center p-5 space-y-3">
                <h3 className="font-bold text-slate-900 border-b pb-2 w-full">Patient Check-in</h3>

                {/* PIN — primary method, works over HTTP */}
                <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                  <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Today&apos;s Check-in PIN</p>
                  <p className="text-4xl font-black tracking-[0.25em] text-blue-900 font-mono">
                    {sessionPin || "------"}
                  </p>
                  <p className="text-[10px] text-blue-600">Patient types this code on their phone</p>
                  <button
                    onClick={refreshPin}
                    className="text-[10px] text-blue-500 underline hover:text-blue-700 mt-1"
                  >
                    Generate new PIN
                  </button>
                </div>

                {/* QR — optional, only works over HTTPS */}
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Or scan QR (HTTPS only)</p>
                  <div className="flex justify-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <QRCodeSVG value={`HEALTHDESK_PIN:${sessionPin}`} size={110} />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">Open HealthDesk → Check-in → enter PIN</p>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
