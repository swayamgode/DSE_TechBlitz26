"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, LogOut, CheckCircle2, User, Stethoscope, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  const mockQueue = [
    { id: 1, name: "Alice Smith", type: "Priority", time: "10:05 AM", status: "Waiting" },
    { id: 2, name: "Bob Johnson", type: "Regular", time: "10:12 AM", status: "Waiting" },
    { id: 3, name: "Emily Brown", type: "Regular", time: "10:15 AM", status: "Waiting" },
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
          <span className="text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
            Dr. Mark
          </span>
          <Link href="/login" className="flex items-center gap-2 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Doctor Dashboard</h1>
            <p className="text-slate-600">Current Slot: 10:00 AM - 11:00 AM</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="flex flex-row items-center border-slate-200 shadow-sm py-2 px-4 space-x-4">
              <Users className="text-slate-400 w-8 h-8" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Patients in Queue</p>
                <p className="text-2xl font-bold text-slate-900 text-center">{mockQueue.length}</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Patient */}
          <section className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Action Center</h2>
            <Card className="border-blue-200 shadow-md bg-white border-2">
              <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Stethoscope className="w-5 h-5" /> Next Patient
                </CardTitle>
                <CardDescription>Ready for consultation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{mockQueue[0].name}</p>
                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 rounded-full mt-1">
                      {mockQueue[0].type}
                    </Badge>
                  </div>
                </div>
                <div className="flex text-sm text-slate-500 mt-2">
                  <Clock className="w-4 h-4 mr-1" /> Arrived: {mockQueue[0].time}
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-slate-50">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md">
                  Call Next Patient
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Live Queue */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Live FCFS Queue</h2>
            <Card className="border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {mockQueue.map((patient, idx) => (
                  <div key={patient.id} className={`p-4 flex items-center justify-between transition-colors ${idx === 0 ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${idx === 0 ? 'text-blue-900' : 'text-slate-900'}`}>{patient.name}</p>
                        <p className="text-xs text-slate-500 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Checked-in {patient.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={`${patient.type === 'Priority' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-slate-100 text-slate-700'} rounded-full`}>
                        {patient.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {mockQueue.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p>Queue is empty. Waiting for patients to check in.</p>
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
