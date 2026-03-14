"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, CalendarCheck, Clock, Loader2, Info, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function BookSlotPage() {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotType, setSlotType] = useState<"regular" | "priority">("regular");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const slots = useQuery(api.slots.getSlotsWithAvailability) || [];
  const bookSlotMut = useMutation(api.appointments.bookSlot);
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("healthdesk_userId") : null;

  const handleBook = async () => {
    if (!selectedSlot || !currentUserId) return;
    setBookingLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await bookSlotMut({ userId: currentUserId as any, slotId: selectedSlot._id, type: slotType });
      setSuccessMsg(`Slot confirmed for ${selectedSlot.startTime} – ${selectedSlot.endTime}.`);
      setSelectedSlot(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to book slot.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col">
      {/* Subtle bg blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#137dab]/5 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      {/* Navbar */}
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

      <main className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full space-y-8 relative z-10">

        {/* Header */}
        <div className="pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-1 bg-[#137dab]/10 text-[#137dab] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#137dab]/20">
              Patient Portal
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Book a Consultation</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Choose an available time slot for today</p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> {successMsg}
          </div>
        )}

        {/* Booking Type Toggle */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Booking Type</p>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Select the urgency of your visit</p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 sm:ml-auto">
            <button
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                slotType === "regular"
                  ? "bg-white text-[#137dab] shadow-sm border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => setSlotType("regular")}
            >
              Regular
            </button>
            <button
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                slotType === "priority"
                  ? "bg-amber-400 text-amber-900 shadow-sm"
                  : "text-slate-400 hover:text-amber-600"
              }`}
              onClick={() => setSlotType("priority")}
            >
              Priority / Emer.
            </button>
          </div>
        </div>

        {/* Slot Grid */}
        {slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 text-[#137dab] animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading available slots...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot: any, idx: number) => {
              const isAvailable = slotType === "regular" ? slot.availableRegular > 0 : slot.availablePriority > 0;
              const isSelected = selectedSlot?._id === slot._id;
              const count = slotType === "regular" ? slot.availableRegular : slot.availablePriority;

              return (
                <div
                  key={slot._id}
                  onClick={() => isAvailable && setSelectedSlot(slot)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={`relative bg-white border rounded-2xl p-5 transition-all duration-200 overflow-hidden ${
                    !isAvailable
                      ? "opacity-40 grayscale pointer-events-none border-slate-200"
                      : isSelected
                      ? "border-[#137dab] shadow-[0_0_0_3px_rgba(19,125,171,0.15)] cursor-pointer"
                      : "border-slate-200 shadow-sm hover:shadow-md hover:border-[#137dab]/40 cursor-pointer hover:-translate-y-0.5"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-[#137dab] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <Calendar className="w-3 h-3" /> {slot.date || "Today"}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#137dab]" />
                    <span className="text-xl font-black tracking-tight text-slate-900">{slot.startTime}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 ml-6">until {slot.endTime}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {slotType === "regular" ? "Regular" : "Priority"} slots
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      !isAvailable
                        ? "bg-rose-50 text-rose-500 border border-rose-200"
                        : "bg-[#137dab]/10 text-[#137dab] border border-[#137dab]/20"
                    }`}>
                      {count} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          {selectedSlot ? (
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-[#137dab]/5 border border-[#137dab]/20 px-4 py-3 rounded-xl">
              <div className="w-2 h-2 bg-[#137dab] rounded-full animate-pulse" />
              Selected: <span className="text-[#137dab] font-black">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
            </div>
          ) : (
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select a slot to confirm your booking</p>
          )}

          <Button
            size="lg"
            className="h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-[#137dab] text-white hover:bg-[#137dab]/90 shadow-[0_4px_12px_rgba(19,125,171,0.25)] rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
            disabled={!selectedSlot || bookingLoading}
            onClick={handleBook}
          >
            {bookingLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarCheck className="w-4 h-4 mr-2" />}
            Confirm Booking
          </Button>
        </div>

      </main>
    </div>
  );
}
