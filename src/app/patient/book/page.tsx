"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowLeft, CalendarCheck, Clock, Loader2, Info } from "lucide-react";
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

  // We fetch user ID from localstorage for this simple project
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("healthdesk_userId") : null;

  const handleBook = async () => {
    if (!selectedSlot || !currentUserId) return;
    setBookingLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await bookSlotMut({
        userId: currentUserId as any,
        slotId: selectedSlot._id,
        type: slotType,
      });

      setSuccessMsg(`Successfully booked ${slotType} slot for ${selectedSlot.startTime} - ${selectedSlot.endTime}.`);
      setSelectedSlot(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to book slot.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center border-b bg-white top-0 z-50">
        <Link href="/patient" className="mr-8 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Book a Consultation Slot</h1>
          <p className="text-slate-600">Choose an available time slot for today.</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 font-medium rounded-lg border border-red-100 flex items-center gap-2">
            <Info className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200">
            {successMsg}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 mb-6 shadow-sm">
          <span className="text-sm font-medium text-slate-700">Booking Type:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${slotType === "regular" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setSlotType("regular")}
            >
              Regular
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${slotType === "priority" ? "bg-amber-100 text-amber-800 shadow-sm" : "text-slate-500 hover:text-amber-700"}`}
              onClick={() => setSlotType("priority")}
            >
              Priority / Emer.
            </button>
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot: any) => {
              // Determine availability based on selected type
              const isAvailable = slotType === "regular" ? slot.availableRegular > 0 : slot.availablePriority > 0;
              const isSelected = selectedSlot?._id === slot._id;

              return (
                <Card 
                  key={slot._id} 
                  className={`cursor-pointer transition-all ${
                    !isAvailable ? "opacity-50 grayscale bg-slate-100 pointer-events-none" :
                    isSelected ? "ring-2 ring-blue-600 border-blue-600 bg-blue-50/50" : "hover:border-blue-300"
                  }`}
                  onClick={() => isAvailable && setSelectedSlot(slot)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {slot.startTime}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {slot.endTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{slotType === "regular" ? "Regular left:" : "Priority left:"}</span>
                      <span className={`font-bold ${!isAvailable ? "text-red-500" : "text-slate-900"}`}>
                        {slotType === "regular" ? slot.availableRegular : slot.availablePriority}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-8">
          <Button 
            size="lg" 
            className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            disabled={!selectedSlot || bookingLoading}
            onClick={handleBook}
          >
            {bookingLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CalendarCheck className="w-5 h-5 mr-2" />} 
            Confirm Booking
          </Button>
        </div>
      </main>
    </div>
  );
}
