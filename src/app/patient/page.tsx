"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Clock, LogOut, QrCode, User } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
        <nav className="text-sm font-medium text-slate-600">
          <Link href="/login" className="flex items-center gap-2 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Patient Dashboard</h1>
          <p className="text-slate-600">Welcome, John Doe. Manage your appointments and clinic visits.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Action Cards */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
            <CardHeader>
              <Calendar className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Reserve a consultation slot</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patient/book" className="w-full block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Slots</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
            <CardHeader>
              <QrCode className="w-8 h-8 text-emerald-600 mb-2" />
              <CardTitle>QR Check-in</CardTitle>
              <CardDescription>Check in at the clinic</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patient/checkin" className="w-full block">
                <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  Scan QR
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
            <CardHeader>
              <Clock className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Queue Status</CardTitle>
              <CardDescription>View your live FCFS position</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patient/queue" className="w-full block">
                <Button variant="secondary" className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100">
                  Check Status
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Current appointments / checkings */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Upcoming Appointments</h2>
          <Card className="bg-white border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900">No upcoming appointments</p>
              <p className="text-sm text-slate-500 max-w-sm mt-1">You haven't booked any slots yet. Click 'Book Appointment' to get started.</p>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
