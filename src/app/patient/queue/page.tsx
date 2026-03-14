"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, Clock, Users, Coffee, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function QueueStatusPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("healthdesk_userId"));
  }, []);

  const queueData = useQuery(api.queue.getQueuePosition, userId ? { userId: userId as any } : "skip");

  const Navbar = () => (
    <header className="px-6 lg:px-12 h-16 flex items-center gap-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <Link href="/patient" className="p-2 bg-slate-100 hover:bg-[#137dab]/10 hover:text-[#137dab] rounded-lg transition-all border border-slate-200 text-slate-500">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#137dab] rounded-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-black tracking-tight text-slate-800">HealthDesk</span>
      </div>
    </header>
  );

  if (queueData === undefined) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-[#137dab] animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (queueData === null) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Not in Queue</h2>
            <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
              You haven't checked into the clinic yet today. Please scan the QR code at the front desk when you arrive.
            </p>
          </div>
          <Link href="/patient">
            <Button className="h-11 px-8 bg-[#137dab] text-white hover:bg-[#137dab]/90 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_4px_12px_rgba(19,125,171,0.25)]">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPosition = queueData.position;
  const totalInQueue = queueData.totalInQueue;
  const estimatedWait = queueData.estimatedWaitTime;

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#137dab]/5 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      <Navbar />

      <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full space-y-8 relative z-10">

        {/* Header */}
        <div className="pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-1 bg-[#137dab]/10 text-[#137dab] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#137dab]/20">
              Live Status
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Queue Status</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Your real-time position in the clinic</p>
        </div>

        {/* Position + Wait grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Position card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[220px]">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Position</p>
            <div className="text-8xl font-black tracking-tighter text-[#137dab] leading-none my-4 drop-shadow-sm">
              {currentPosition}
            </div>
            <p className="text-sm font-bold text-slate-500">
              Out of <span className="text-slate-800 font-black">{totalInQueue}</span> patients in queue
            </p>
          </div>

          {/* Info card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Wait block */}
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimated Wait</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">~{estimatedWait} <span className="text-lg text-slate-400 font-bold">mins</span></p>
                <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">Based on average consultation time</p>
              </div>
            </div>
            {/* Tips block */}
            <div className="p-6 flex items-start gap-4">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">While you wait</p>
                <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">
                  You can wait in the lobby or step outside. Please return when your number reaches position 1.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Flow Visualizer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-4 bg-[#137dab] rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Queue Flow</h2>
          </div>

          <div className="relative flex items-center justify-between mx-4 md:mx-16">
            {/* Progress line */}
            <div className="absolute top-6 left-0 w-full h-[2px] bg-slate-100 -z-0">
              <div className="h-full bg-gradient-to-r from-emerald-300 via-[#137dab]/40 to-transparent w-[60%] rounded-full" />
            </div>

            {/* In Room */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-base shadow-[0_4px_12px_rgba(16,185,129,0.3)]">1</div>
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 text-center w-16">In Room</span>
            </div>

            {/* Next */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-12 h-12 rounded-xl bg-[#137dab]/20 text-[#137dab] border border-[#137dab]/30 flex items-center justify-center font-black text-base">2</div>
              <span className="text-[9px] uppercase font-black tracking-widest text-[#137dab]/70 text-center w-16">Up Next</span>
            </div>

            {/* YOU */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-14 h-14 rounded-xl bg-[#137dab] text-white flex items-center justify-center font-black text-lg shadow-[0_6px_20px_rgba(19,125,171,0.35)] ring-4 ring-[#137dab]/20 scale-110">
                {currentPosition}
              </div>
              <span className="text-[9px] uppercase font-black tracking-widest text-[#137dab] text-center w-16 mt-1">You</span>
            </div>

            {/* Waiting */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-black text-base">...</div>
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 text-center w-16">Waiting</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link href="/patient">
            <Button variant="outline" className="h-10 px-6 font-black uppercase tracking-widest text-[10px] border-slate-200 hover:border-[#137dab]/40 hover:bg-[#137dab]/5 hover:text-[#137dab] rounded-xl transition-all text-slate-500">
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}
