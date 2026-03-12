"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, LogOut, CheckCircle2, User, UserPlus, Clock, Search, BriefcaseMedical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReceptionistDashboard() {
  const [search, setSearch] = useState("");

  const mockSlots = [
    { time: "09:00 - 10:00", available: 2, total: 10, priority: 1 },
    { time: "10:00 - 11:00", available: 0, total: 10, priority: 0 },
    { time: "11:00 - 12:00", available: 5, total: 10, priority: 2 },
  ];

  const mockAtClinic = [
    { id: 1, name: "Alice Smith", type: "Priority", time: "10:05", status: "Waiting" },
    { id: 2, name: "Bob Johnson", type: "Regular", time: "10:12", status: "Waiting" },
    { id: 3, name: "Charlie Davis", type: "Regular", time: "09:50", status: "Consulting" },
  ];

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
              <UserPlus className="w-4 h-4 mr-2" /> Add Walk-in Patient
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions / Slots */}
          <section className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> Today's Slots
            </h2>
            <div className="space-y-4">
              {mockSlots.map((slot, idx) => (
                <Card key={idx} className={`border ${slot.available === 0 ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-blue-100 hover:border-blue-300'} transition-colors`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex justify-between">
                      {slot.time}
                      {slot.available === 0 ? (
                        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Full</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{slot.available} left</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-500 pb-4">
                    <div className="flex justify-between mb-1">
                      <span>Regular: {slot.total - slot.priority - slot.available}/{slot.total}</span>
                      <span>Priority: {slot.priority}/2</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full ${slot.available === 0 ? 'bg-red-400' : 'bg-blue-500'}`} 
                        style={{ width: `${((slot.total - slot.available) / slot.total) * 100}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Active Queue / Clinic Management */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Patients at Clinic
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-9 h-9 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-6 grid grid-cols-4 border-b border-slate-100">
                <div className="col-span-2">Patient</div>
                <div>Status</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-100">
                {mockAtClinic.map((patient, idx) => (
                  <div key={patient.id} className="p-4 px-6 grid grid-cols-4 items-center hover:bg-slate-50 transition-colors">
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
          </section>
        </div>
      </main>
    </div>
  );
}
