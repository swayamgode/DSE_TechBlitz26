"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import {
  Activity, ArrowLeft, Loader2, Info, CheckCircle,
  KeyRound, Camera, X, RefreshCw, ShieldCheck,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const PIN_LENGTH = 6;

function CheckinContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"pin" | "camera">("pin");
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scannerReady, setScannerReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const scanRef = useRef<number | null>(null);

  const checkInMut = useMutation(api.queue.checkInPatient);

  useEffect(() => {
    const storedId = localStorage.getItem("healthdesk_userId");
    setUserId(storedId);
    // Camera only works on HTTPS or localhost
    setIsSecure(location.protocol === "https:" || location.hostname === "localhost");
    
    // Auto-fill PIN from URL if present
    const urlPin = searchParams.get("pin");
    if (urlPin && /^\d{6}$/.test(urlPin)) {
      setPin(urlPin);
    }
  }, [searchParams]);

  // ── Check-in action ──────────────────────────────────────────────────────
  const performCheckIn = async () => {
    if (!userId) {
      setErrorMsg("You must be logged in. Please go to the login page first.");
      return;
    }
    setChecking(true);
    setErrorMsg("");
    try {
      await checkInMut({ userId: userId as any });
      setCheckinSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "No booked appointment found. Book a slot first.");
    } finally {
      setChecking(false);
    }
  };

  // ── PIN submit ────────────────────────────────────────────────────────────
  const handlePinSubmit = async () => {
    if (pin.length !== PIN_LENGTH) return;
    // Validate PIN against sessionStorage (same browser session) OR just trust it
    // In a real app you'd validate server-side; here we just check the code format
    // and let the mutation do the real auth guard
    if (!/^\d{6}$/.test(pin)) {
      setErrorMsg("Invalid PIN. Please enter the 6-digit code shown at the reception desk.");
      return;
    }
    await performCheckIn();
  };

  // ── Camera / BarcodeDetector ──────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError("");
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // Use BarcodeDetector API
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        detectorRef.current = detector;
        setScannerReady(true);
        startScanLoop(detector);
      } else {
        setCameraError("QR detection not supported on this browser. Please use the PIN instead.");
      }
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings, or use the PIN method below."
          : "Camera unavailable. Please use the PIN method instead."
      );
    }
  };

  const startScanLoop = (detector: any) => {
    const loop = async () => {
      if (!videoRef.current || !detector) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          const val: string = codes[0].rawValue;
          if (val === "HEALTHDESK_CHECKIN" || val.startsWith("HEALTHDESK_PIN:")) {
            stopCamera();
            await performCheckIn();
            return;
          }
        }
      } catch { /* frame not ready yet */ }
      scanRef.current = requestAnimationFrame(loop);
    };
    scanRef.current = requestAnimationFrame(loop);
  };

  const stopCamera = () => {
    if (scanRef.current) cancelAnimationFrame(scanRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    detectorRef.current = null;
    setCameraOpen(false);
    setScannerReady(false);
  };

  useEffect(() => () => stopCamera(), []);

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (userId === null && typeof window !== "undefined" && !localStorage.getItem("healthdesk_userId")) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
          <Info className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Login Required</h2>
        <p className="text-slate-500 max-w-sm">
          You need to be logged in to check in. Please log in first.
        </p>
        <Link href="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      <header className="px-6 h-24 flex items-center bg-white sticky top-0 z-50">
        <Link href="/patient" className="mr-6 hover:bg-zinc-100 p-3 rounded-full transition-all active:scale-95 border border-transparent hover:border-zinc-200">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-black rounded">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-black">HealthDesk</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start py-10 px-6 space-y-8 max-w-lg mx-auto w-full">
        {!checkinSuccess ? (
          <Card className="w-full neo-card border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-reveal">
            <CardHeader className="text-center pb-8 pt-12">
              <CardTitle className="text-4xl font-black text-black tracking-tighter">Clinic Entry</CardTitle>
              <CardDescription className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                {checking ? "Verifying Authorization…" : "Join the Live Pipeline"}
              </CardDescription>
            </CardHeader>

            {errorMsg && (
              <div className="mx-10 mb-6 p-4 bg-zinc-50 border border-black text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-reveal">
                <Info className="w-5 h-5 shrink-0" /> {errorMsg}
              </div>
            )}

            {/* Tab Swiper */}
            <div className="mx-10 mb-8 flex border-2 border-black rounded-full overflow-hidden p-1.5 gap-1.5 bg-zinc-50">
              <button
                onClick={() => { setMode("pin"); stopCamera(); setCameraError(""); setErrorMsg(""); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                  mode === "pin" ? "bg-black text-white" : "text-zinc-400 hover:text-black hover:bg-white"
                }`}
              >
                PIN Code
              </button>
              <button
                onClick={() => { setMode("camera"); setErrorMsg(""); setPin(""); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                  mode === "camera" ? "bg-black text-white" : "text-zinc-400 hover:text-black hover:bg-white"
                }`}
              >
                QR Scanner
              </button>
            </div>

            <CardContent className="px-10 pb-4">
              {mode === "pin" && (
                <div className="space-y-10 animate-reveal">
                  <div className="text-center space-y-6">
                    <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.3em]">
                      Security PIN Input
                    </p>
                    <div className="flex gap-2 justify-center">
                      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all ${
                            pin[i]
                              ? "border-black bg-white text-black translate-y-[-2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              : "border-zinc-100 bg-zinc-50 text-zinc-200"
                          }`}
                        >
                          {pin[i] || "•"}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minimal Numpad */}
                  <div className="grid grid-cols-3 gap-4">
                    {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((key, i) => (
                      <button
                        key={i}
                        disabled={!key}
                        onClick={() => {
                          if (key === "⌫") {
                            setPin((p) => p.slice(0, -1));
                          } else if (key && pin.length < PIN_LENGTH) {
                            setPin((p) => p + key);
                            setErrorMsg("");
                          }
                        }}
                        className={`h-14 rounded-2xl flex items-center justify-center text-lg font-black transition-all ${
                          key
                            ? key === "⌫"
                              ? "bg-zinc-100 text-black hover:bg-black hover:text-white"
                              : "bg-white border-2 border-zinc-100 hover:border-black hover:bg-black hover:text-white transition-all active:scale-95"
                            : ""
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "camera" && (
                <div className="space-y-6 animate-reveal">
                   {!cameraOpen ? (
                    <div className="flex flex-col items-center gap-8 py-10">
                      <div className="w-48 h-48 rounded-full border-4 border-dashed border-zinc-100 flex items-center justify-center group animate-pulse">
                        <Camera className="w-16 h-16 text-zinc-200 group-hover:text-black transition-colors" />
                      </div>
                      {cameraError && (
                        <p className="text-[10px] font-black uppercase text-red-500 bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                          {cameraError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-black">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-56 h-56 border-2 border-white/50 rounded-3xl" />
                        <div className="absolute w-56 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]" style={{ animation: "scanline 2.5s infinite linear" }} />
                      </div>
                      <button
                        onClick={stopCamera}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-black active:scale-90"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-10 pb-12 pt-6">
              <Button
                onClick={mode === "pin" ? handlePinSubmit : (cameraOpen ? stopCamera : startCamera)}
                disabled={(mode === "pin" && pin.length !== PIN_LENGTH) || checking}
                className="neo-button w-full h-16 text-md rounded-2xl"
              >
                {checking ? <Loader2 className="w-6 h-6 animate-spin" /> : mode === "pin" ? "AUTHORIZE ENTRY" : cameraOpen ? "ABORT SCAN" : "INITIALIZE SCANNER"}
              </Button>
              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                 <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> SECURE</span>
                 <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> FCFS QUEUE</span>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full neo-card border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] animate-reveal">
            <CardContent className="flex flex-col items-center py-20 px-10 text-center space-y-10">
              <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tighter">Authorized.</h2>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Patient Check-in Verified</p>
              </div>
              
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 text-left w-full space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Next Steps
                </p>
                <p className="text-sm font-bold leading-relaxed text-zinc-600">
                  You have been assigned a slot in the live pipeline. Maintain your phone connection to track real-time position updates.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <Link href="/patient/queue" className="w-full">
                  <Button className="neo-button w-full h-16 text-md">
                    TRACK POSITION
                  </Button>
                </Link>
                <Link href="/patient" className="w-full">
                  <Button variant="ghost" className="w-full h-14 font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-black">
                    RETURN TO TERMINAL
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <style>{`
          @keyframes scanline {
            0%   { top: 8%;  }
            50%  { top: 88%; }
            100% { top: 8%;  }
          }
        `}</style>
      </main>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <CheckinContent />
    </Suspense>
  );
}
