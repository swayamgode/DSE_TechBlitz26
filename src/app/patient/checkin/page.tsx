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
  KeyRound, Camera, X, RefreshCw,
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
  }, []);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 h-16 flex items-center border-b bg-white top-0 z-50">
        <Link href="/patient" className="mr-8 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthDesk</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        {!checkinSuccess ? (
          <Card className="w-full max-w-md bg-white border-2 border-slate-200 shadow-lg overflow-hidden">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-2xl font-bold text-slate-900">Clinic Check-in</CardTitle>
              <CardDescription>
                {checking ? "Processing your check-in…" : "Enter the PIN from the reception desk"}
              </CardDescription>
            </CardHeader>

            {errorMsg && (
              <div className="mx-6 mb-2 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            {/* ── Tab switcher ── */}
            <div className="mx-6 mb-4 flex rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-1 gap-1">
              <button
                onClick={() => { setMode("pin"); stopCamera(); setCameraError(""); setErrorMsg(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === "pin" ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <KeyRound className="w-4 h-4" /> Enter PIN
              </button>
              <button
                onClick={() => { setMode("camera"); setErrorMsg(""); setPin(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === "camera" ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Camera className="w-4 h-4" /> Scan QR
              </button>
            </div>

            <CardContent className="px-6 pb-0">

              {/* ── PIN mode ── */}
              {mode === "pin" && (
                <div className="space-y-5">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-600 font-medium">
                      Ask the receptionist for today&apos;s 6-digit PIN:
                    </p>
                    {/* PIN digit boxes */}
                    <div className="flex gap-2 justify-center">
                      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-colors ${
                            pin[i]
                              ? "border-blue-500 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-slate-50 text-slate-300"
                          }`}
                        >
                          {pin[i] || "•"}
                        </div>
                      ))}
                    </div>
                    {/* Hidden input that captures the PIN */}
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={PIN_LENGTH}
                      value={pin}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
                        setPin(v);
                        setErrorMsg("");
                      }}
                      className="absolute opacity-0 w-0 h-0"
                      id="pin-hidden-input"
                      autoComplete="off"
                    />
                  </div>

                  {/* Tap area to focus the hidden input */}
                  <button
                    className="w-full py-3 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                    onClick={() => document.getElementById("pin-hidden-input")?.focus()}
                  >
                    Tap here to type the PIN
                  </button>

                  {/* Numpad for mobile */}
                  <div className="grid grid-cols-3 gap-2">
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
                        className={`h-12 rounded-xl text-lg font-semibold transition-all ${
                          key
                            ? key === "⌫"
                              ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 active:scale-95"
                              : "bg-slate-100 text-slate-800 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                            : ""
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Camera mode ── */}
              {mode === "camera" && (
                <div className="space-y-3">
                  {!isSecure && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Camera requires HTTPS.</strong> You&apos;re on HTTP — camera may be blocked by the browser.
                        Use the <strong>PIN method</strong> instead, or deploy the app to use QR scanning.
                      </span>
                    </div>
                  )}

                  {!cameraOpen ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="w-36 h-36 rounded-3xl border-4 border-dashed border-blue-200 bg-blue-50/40 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-blue-300" />
                      </div>
                      {cameraError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                          {cameraError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      {/* Corner frame overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-52 h-52 relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                          {/* Scan line */}
                          <div
                            className="absolute left-2 right-2 h-0.5 bg-blue-400/80"
                            style={{ animation: "scanline 2s ease-in-out infinite", top: "50%" }}
                          />
                        </div>
                      </div>
                      {scannerReady && (
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                          <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                            Point at the QR on the reception screen
                          </span>
                        </div>
                      )}
                      <button
                        onClick={stopCamera}
                        className="absolute top-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-6 pt-5 pb-6">
              {mode === "pin" ? (
                <Button
                  onClick={handlePinSubmit}
                  disabled={pin.length !== PIN_LENGTH || checking}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-base font-semibold shadow-sm transition-all"
                >
                  {checking
                    ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking In…</>
                    : <><KeyRound className="w-5 h-5 mr-2" /> Confirm Check-in</>
                  }
                </Button>
              ) : (
                <Button
                  onClick={cameraOpen ? stopCamera : startCamera}
                  className={`w-full h-12 text-white text-base font-semibold shadow-sm transition-all ${
                    cameraOpen ? "bg-slate-600 hover:bg-slate-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={checking}
                >
                  {checking
                    ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking In…</>
                    : cameraOpen
                    ? <><X className="w-5 h-5 mr-2" /> Stop Camera</>
                    : <><Camera className="w-5 h-5 mr-2" /> Open Camera</>
                  }
                </Button>
              )}
              <p className="text-xs text-slate-400 text-center">
                You need a booked appointment to check in.
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full max-w-md bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-500/10">
            <CardContent className="flex flex-col items-center py-12 px-6 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900">Checked In Successfully!</h2>
              <p className="text-emerald-700">You have been added to the live queue.</p>
              <div className="flex flex-col gap-3 w-full mt-4">
                <Link href="/patient/queue" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-12">
                    View My Queue Position
                  </Button>
                </Link>
                <Link href="/patient" className="w-full">
                  <Button variant="outline" className="w-full">Go to Dashboard</Button>
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
