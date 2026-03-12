"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowLeft, CalendarCheck, Clock } from "lucide-react";

export default function BookSlotPage() {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const mockSlots = [
    { id: 1, time: "09:00 - 10:00 AM", available: 10, priority_space: 2 },
    { id: 2, time: "10:00 - 11:00 AM", available: 2, priority_space: 0 },
    { id: 3, time: "11:00 - 12:00 PM", available: 0, priority_space: 1 },
    { id: 4, time: "12:00 - 01:00 PM", available: 8, priority_space: 2 },
  ];

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

        <div className="grid sm:grid-cols-2 gap-4">
          {mockSlots.map((slot) => (
            <Card 
              key={slot.id} 
              className={`cursor-pointer transition-all ${
                slot.available === 0 ? "opacity-50 grayscale bg-slate-100" :
                selectedSlot === slot.id ? "ring-2 ring-blue-600 border-blue-600 bg-blue-50/50" : "hover:border-blue-300"
              }`}
              onClick={() => slot.available > 0 && setSelectedSlot(slot.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {slot.time}
                  </span>
                </CardTitle>
                <CardDescription>
                  {slot.available === 0 ? "Fully Booked" : `${slot.available} regular slots open`}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Priority available: <span className="font-semibold text-slate-700">{slot.priority_space}</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-8">
          <Button 
            size="lg" 
            className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            disabled={!selectedSlot}
            onClick={() => {
              alert("Slot Booked! Don't forget to check-in when you arrive.");
              // handle booking logic
            }}
          >
            <CalendarCheck className="w-5 h-5 mr-2" /> Confirm Booking
          </Button>
        </div>
      </main>
    </div>
  );
}
