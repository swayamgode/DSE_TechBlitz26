"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Clock, LogOut, QrCode, Heart, Save, CheckCircle2, User } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// ─── Helper toggle component ───────────────────────────────────────────────────
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group select-none">
      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
        style={{ height: "1.375rem", width: "2.5rem" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
        />
      </div>
    </label>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  // In a real app this comes from session/auth. We read from localStorage for this prototype.
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId") as Id<"users"> | null;
    setUserId(id);
  }, []);

  const existingMed = useQuery(
    api.medicalInfo.getMedicalInfo,
    userId ? { patientId: userId } : "skip"
  );

  const saveMed = useMutation(api.medicalInfo.saveMedicalInfo);

  // Form state
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [isDiabetic, setIsDiabetic] = useState(false);
  const [isHypertensive, setIsHypertensive] = useState(false);
  const [hasHeartDisease, setHasHeartDisease] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [notes, setNotes] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Populate form when existing data loads
  useEffect(() => {
    if (existingMed) {
      setAge(existingMed.age?.toString() ?? "");
      setGender(existingMed.gender ?? "");
      setBloodType(existingMed.bloodType ?? "");
      setIsDiabetic(existingMed.isDiabetic);
      setIsHypertensive(existingMed.isHypertensive);
      setHasHeartDisease(existingMed.hasHeartDisease);
      setHasAsthma(existingMed.hasAsthma);
      setConditions(existingMed.conditions ?? "");
      setAllergies(existingMed.allergies ?? "");
      setCurrentMedications(existingMed.currentMedications ?? "");
      setNotes(existingMed.notes ?? "");
      setEmergencyContact(existingMed.emergencyContact ?? "");
    }
  }, [existingMed]);

  const handleSave = async () => {
    if (!userId) return;
    await saveMed({
      patientId: userId,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      bloodType: bloodType || undefined,
      isDiabetic,
      isHypertensive,
      hasHeartDisease,
      hasAsthma,
      conditions: conditions || undefined,
      allergies: allergies || undefined,
      currentMedications: currentMedications || undefined,
      notes: notes || undefined,
      emergencyContact: emergencyContact || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

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
          <p className="text-slate-600">Manage your appointments and medical profile.</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CardTitle>QR / PIN Check-in</CardTitle>
              <CardDescription>Check in at the clinic</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patient/checkin" className="w-full block">
                <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  Check In
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

        {/* ── Medical Profile ───────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-semibold text-slate-900">My Medical Profile</h2>
          </div>
          <p className="text-sm text-slate-500 -mt-2">
            This info is securely stored and shared with your doctor when you visit the clinic — even if you lose your physical file.
          </p>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="pt-6 space-y-6">

              {/* Basic Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Basic Information</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Age</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 35" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className={inputCls}>
                      <option value="">Select...</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Blood Type</label>
                    <select value={bloodType} onChange={e => setBloodType(e.target.value)} className={inputCls}>
                      <option value="">Unknown</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Chronic Conditions</h3>
                <div className="space-y-3 max-w-sm">
                  <Toggle label="Diabetic (Type 1 / Type 2)" checked={isDiabetic} onChange={setIsDiabetic} />
                  <Toggle label="Hypertensive (High Blood Pressure)" checked={isHypertensive} onChange={setIsHypertensive} />
                  <Toggle label="Heart Disease / Cardiac Issues" checked={hasHeartDisease} onChange={setHasHeartDisease} />
                  <Toggle label="Asthma / Respiratory Issues" checked={hasAsthma} onChange={setHasAsthma} />
                </div>
              </div>

              {/* Other fields */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Medical History</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Other Conditions</label>
                    <textarea rows={2} value={conditions} onChange={e => setConditions(e.target.value)} placeholder="e.g. Thyroid disorder, Arthritis" className={inputCls + " resize-none"} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Known Allergies</label>
                    <textarea rows={2} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts, Latex" className={inputCls + " resize-none"} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Current Medications</label>
                    <textarea rows={2} value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} placeholder="e.g. Metformin 500mg, Lisinopril 10mg" className={inputCls + " resize-none"} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Additional Notes</label>
                    <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any other info for your doctor…" className={inputCls + " resize-none"} />
                  </div>
                </div>
              </div>

              {/* Emergency */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Emergency Contact</h3>
                <input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Name & phone, e.g. Jane Doe – +91 98765 43210" className={inputCls + " max-w-sm"} />
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!userId}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save Medical Profile"}
                </Button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                  </span>
                )}
                {!userId && (
                  <span className="text-xs text-slate-400">Log in to save your medical profile</span>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
