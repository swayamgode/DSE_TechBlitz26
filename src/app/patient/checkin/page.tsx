"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, ArrowLeft, QrCodeIcon, Loader2, Info } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function CheckinPage() {
  const [scanning, setScanning] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const checkInMut = useMutation(api.queue.checkInPatient);

  useEffect(() => {
    setUserId(localStorage.getItem("healthdesk_userId"));
  }, []);

  const handleScan = async () => {
    if (!userId) {
      setErrorMsg("User ID not found, please log in again.");
      return;
    }
    
    setScanning(true);
    setErrorMsg("");
    
    // Simulate a brief QR "scan" delay
    setTimeout(async () => {
      try {
        await checkInMut({ userId: userId as any });
        setCheckinSuccess(true);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to check-in. Do you have an appointment right now?");
      } finally {
        setScanning(false);
      }
    }, 1200);
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

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {!checkinSuccess ? (
          <Card className="w-full max-w-md bg-white border-2 border-slate-200">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">Clinic Check-in</CardTitle>
              <CardDescription>
                Scan the QR code at the reception desk to enter the live queue.
              </CardDescription>
            </CardHeader>
            {errorMsg && (
              <div className="mx-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}
            <CardContent className="flex flex-col items-center justify-center pt-8">
              <div className="relative w-48 h-48 border-4 border-dashed border-slate-300 rounded-3xl flex items-center justify-center">
                {scanning ? (
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                ) : (
                  <QrCodeIcon className="w-16 h-16 text-slate-400" />
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button 
                onClick={handleScan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-sm"
                disabled={scanning}
              >
                {scanning ? "Scanning..." : "Simulate QR Scan"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full max-w-md bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-500/10">
            <CardContent className="flex flex-col items-center py-12 px-6 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-5xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-emerald-900">Checked In Successfully</h2>
              <p className="text-emerald-700">You have been added to the queue based on your arrival time.</p>
              
              <Link href="/patient" className="w-full mt-8">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
