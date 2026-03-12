"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, LogOut, CheckCircle2, User, UserPlus, Clock, Search, BriefcaseMedical, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { QRCodeSVG } from "qrcode.react";

export default function ReceptionistDashboard() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newSlot, setNewSlot] = useState({ start: "09:00 AM", end: "10:00 AM", reg: 10, prio: 2 });
  const [creating, setCreating] = useState(false);

  const slots = useQuery(api.slots.getSlotsWithAvailability) || [];
  const createSlot = useMutation(api.slots.createSlot);

  const liveQueue = useQuery(api.queue.getLiveQueue) || [];

  const handleCreateSlot = async () => {
    setCreating(true);
    try {
      await createSlot({
        startTime: newSlot.start,
        endTime: newSlot.end,
        regularSlots: newSlot.reg,
        prioritySlots: newSlot.prio
      });
      setShowCreate(false);
    } catch(err) {
      alert("Error creating slot");
    } finally {
      setCreating(false);
    }
  }

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
                <Clock className="w-5 h-5 text-amber-600" /> Today's Slots
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(!showCreate)} className="h-8 shadow-sm">
                <Plus className="w-4 h-4 mr-1 text-slate-400" /> New
              </Button>
            </div>

            {showCreate && (
              <Card className="bg-white border-blue-200 shadow-sm animate-in fade-in zoom-in-95">
                <CardHeader className="py-4 border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-sm font-semibold text-slate-700">Create Custom Slot</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium tracking-wide">Start</label>
                      <Input value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium tracking-wide">End</label>
                      <Input value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-emerald-600 font-medium tracking-wide">Reg Capacity</label>
                      <Input type="number" value={newSlot.reg} onChange={e => setNewSlot({...newSlot, reg: Number(e.target.value)})} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-amber-600 font-medium tracking-wide">Prio Capacity</label>
                      <Input type="number" value={newSlot.prio} onChange={e => setNewSlot({...newSlot, prio: Number(e.target.value)})} className="h-8 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-2 h-8 bg-blue-600" onClick={handleCreateSlot} disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Database Slot"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {slots.length === 0 ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /> : slots.map((slot: any) => {
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
                        <span>Reg Aval: {slot.availableRegular}/{slot.regularSlots}</span>
                        <span>Pri Aval: {slot.availablePriority}/{slot.prioritySlots}</span>
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
              <Card className="bg-white border-2 border-slate-200 text-center flex flex-col items-center justify-center p-6 space-y-4">
                 <h3 className="font-bold text-slate-900 border-b pb-2 mb-2 w-full">Scan to Check-in</h3>
                 <div className="bg-slate-50 p-4 rounded-xl border-4 border-slate-200">
                   {/* In production, dynamically generate this code to the current window location host. Assumed network mobile IP test */}
                   <QRCodeSVG value={`http://10.254.141.151:3000/patient/checkin`} size={150} />
                 </div>
                 <p className="text-xs text-slate-500">Patients MUST be connected to the clinic's network (10.254.141.151) on their phone and log in to scan successfully.</p>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
