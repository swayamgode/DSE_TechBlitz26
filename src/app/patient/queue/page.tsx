"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowLeft, Clock, Users, Coffee, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function QueueStatusPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("healthdesk_userId"));
  }, []);

  const queueData = useQuery(api.queue.getQueuePosition, userId ? { userId: userId as any } : "skip");

  if (queueData === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading queue status...</p>
      </div>
    );
  }

  if (queueData === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-2">
            <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Not in Queue</h2>
        <p className="text-slate-500 font-medium max-w-sm">You haven't checked into the clinic yet today. Please scan the QR code at the front desk when you arrive.</p>
        <Link href="/patient" className="mt-4">
           <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentPosition = queueData.position;
  const totalInQueue = queueData.totalInQueue;
  const estimatedWait = queueData.estimatedWaitTime;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/patient" className="hover:bg-slate-100 p-2 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Live Queue Status</h1>
          <p className="text-slate-600">Your First-Come-First-Serve position in the clinic.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-blue-600 border-none shadow-xl shadow-blue-500/30 text-white flex flex-col justify-center items-center py-16">
            <CardHeader className="text-center pb-2">
              <CardDescription className="text-blue-100 uppercase tracking-widest text-xs font-semibold">Your Position</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-8xl font-black">{currentPosition}</div>
              <p className="text-blue-100 mt-4 text-center">Out of {totalInQueue} patients in the queue</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm flex flex-col justify-between p-6 space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Est. Wait Time
                  </h3>
                  <p className="text-3xl font-bold text-amber-600 mt-1">~{estimatedWait} mins</p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Based on average consultation time. Please be in the waiting area when your position reaches 1.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-900">What to do now?</h3>
                  <p className="text-sm text-slate-500 mt-1">You can wait in the lobby or grab a coffee nearby. We will notify you when you are next.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Next step visualizer */}
        <section className="mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" /> Queue Flow
          </h2>
          <div className="flex items-center justify-between mx-4 lg:mx-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm ring-4 ring-white shadow-sm">1</div>
              <span className="text-xs font-semibold text-slate-500 text-center w-16">In Room</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm ring-4 ring-white shadow-sm">2</div>
              <span className="text-xs font-semibold text-slate-500 text-center w-16">Next</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm ring-4 ring-blue-50 shadow-md transform scale-125">3</div>
              <span className="text-xs font-bold text-blue-600 text-center w-16 mt-3">You</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm ring-4 ring-white shadow-sm">...</div>
              <span className="text-xs font-semibold text-slate-500 text-center w-16">Waiting</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
