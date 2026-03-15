"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Activity, Calendar, Clock, LogOut, QrCode, Heart, Save, CheckCircle2, User, 
  AlertCircle, ChevronDown, Phone, Droplets, Upload, FileText, Image as ImageIcon, Trash2, Loader2, File
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// ─── Toggle chip ────────────────────────────────────────────────────────────────
function ConditionTag({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200 select-none ${
        checked
          ? "bg-[#137dab] border-[#137dab] text-white shadow-[0_4px_12px_rgba(19,125,171,0.3)]"
          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-[#137dab]/40 hover:bg-[#137dab]/5"
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${checked ? "bg-white" : "bg-slate-300"}`} />
      {label}
    </button>
  );
}

// ─── Custom Select Wrapper ──────────────────────────────────────────────────────
function SelectField({
  label,
  value,
  onChange,
  children,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
        {icon && <span className="text-[#137dab]">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm font-semibold focus:outline-none focus:border-[#137dab]/60 focus:ring-2 focus:ring-[#137dab]/15 bg-white transition-all text-slate-800 appearance-none cursor-pointer shadow-sm hover:border-[#137dab]/30"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="w-4 h-4 text-[#137dab]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("healthdesk_userId") as Id<"users"> | null;
    setUserId(id);
  }, []);

  const userData = useQuery(
    api.users.getUser,
    userId ? { userId } : "skip"
  );

  const existingMed = useQuery(
    api.medicalInfo.getMedicalInfo,
    userId ? { patientId: userId } : "skip"
  );

  const saveMed = useMutation(api.medicalInfo.saveMedicalInfo);

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
  const [emergencyPhone, setEmergencyPhone] = useState("");
  
  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const generateUploadUrl = useMutation(api.medicalFiles.generateUploadUrl);
  const saveFileMetadata = useMutation(api.medicalFiles.saveFileMetadata);
  const deleteFile = useMutation(api.medicalFiles.deleteFile);
  const userFiles = useQuery(api.medicalFiles.getFiles, userId ? { patientId: userId } : "skip");

  const calculateHash = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // 1. Calculate integrity hash (Blockchain requirement)
      const checksum = await calculateHash(file);

      // 2. Get upload URL
      const postUrl = await generateUploadUrl();

      // 3. Post to storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();

      // 4. Save metadata to DB
      await saveFileMetadata({
        patientId: userId,
        storageId,
        fileName: file.name,
        fileType: file.type,
        checksum: `sha256-${checksum}`,
      });

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

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
      // Parse phone from emergencyContact if stored as "Name — Phone"
      const ec = existingMed.emergencyContact ?? "";
      if (ec.includes(" — ")) {
        const parts = ec.split(" — ");
        setEmergencyPhone(parts[1] ?? "");
        setEmergencyContact(parts[0] ?? "");
      } else {
        setEmergencyContact(ec);
      }
    }
  }, [existingMed]);

  const handleSave = async () => {
    if (!userId) return;
    const combinedContact = emergencyContact
      ? emergencyPhone
        ? `${emergencyContact} — ${emergencyPhone}`
        : emergencyContact
      : emergencyPhone;

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
      emergencyContact: combinedContact || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#137dab]/60 focus:ring-2 focus:ring-[#137dab]/15 bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-sm hover:border-[#137dab]/30";

  // Age options: 1-120
  const ageOptions = Array.from({ length: 120 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col">
      {/* Subtle background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#137dab]/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/60 rounded-full blur-[80px] pointer-events-none" />

      {/* ── Navbar ── */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#137dab] rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800">HealthDesk</span>
        </div>
        <Link href="/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#137dab] transition-colors group">
          <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          Logout
        </Link>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-10 relative z-10">

        {/* ── Hero Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-1 bg-[#137dab]/10 text-[#137dab] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#137dab]/20">
                Active Session
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Patient Portal</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Medical Records & Live Queueing</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[#137dab]/10 flex items-center justify-center">
              <User className="w-4 h-4 text-[#137dab]" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged In As</p>
              <p className="font-black text-slate-800 uppercase text-xs">
                {userData?.name ?? "Patient Terminal"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick Action Cards ── */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Booking */}
          <Link href="/patient/book" className="group block">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(19,125,171,0.12)] hover:border-[#137dab]/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-slate-100 group-hover:text-[#137dab]/20 transition-colors">
                <Calendar className="w-14 h-14" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#137dab]/10 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-[#137dab]" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Booking</h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 mb-4">Reserve a Consultation</p>
                <div className="flex items-center gap-2 text-[#137dab] text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  View Available Slots <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Check-in */}
          <Link href="/patient/checkin" className="group block">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(19,125,171,0.12)] hover:border-[#137dab]/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-slate-100 group-hover:text-[#137dab]/20 transition-colors">
                <QrCode className="w-14 h-14" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#137dab]/10 flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5 text-[#137dab]" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Check-in</h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 mb-4">Entry Authorization</p>
                <div className="flex items-center gap-2 text-[#137dab] text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  Begin Check-in <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Status */}
          <Link href="/patient/queue" className="group block">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(19,125,171,0.12)] hover:border-[#137dab]/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-slate-100 group-hover:text-[#137dab]/20 transition-colors">
                <Clock className="w-14 h-14" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#137dab]/10 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#137dab]" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Queue Status</h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 mb-4">Live Flow Tracker</p>
                <div className="flex items-center gap-2 text-[#137dab] text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  Real-time Position <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Medical Ledger ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#137dab]/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-[#137dab]" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Medical Ledger</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Encrypted Patient Information</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Securely shared with your<br />doctor during each consultation.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Section: Patient Particulars */}
            <div className="p-6 border-b border-slate-100 bg-[#137dab]/3">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-[#137dab] rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patient Particulars</h3>
                <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-[#137dab] bg-[#137dab]/10 border border-[#137dab]/20 px-2 py-0.5 rounded-full">Required</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Full Name - read-only from account */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#137dab]" />
                    Full Name
                  </label>
                  <div className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold bg-slate-50 text-slate-600 flex items-center gap-2 shadow-sm">
                    <span className="text-slate-800">{userData?.name ?? "—"}</span>
                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">From Account</span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#137dab]" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Section: Core Vitals */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-[#137dab] rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Vitals</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">

                {/* Age Dropdown */}
                <SelectField
                  label="Age"
                  value={age}
                  onChange={setAge}
                  icon={<User className="w-3 h-3" />}
                >
                  <option value="">Select Age</option>
                  {ageOptions.map((a) => (
                    <option key={a} value={String(a)}>{a} yrs</option>
                  ))}
                </SelectField>

                {/* Gender Dropdown */}
                <SelectField
                  label="Gender"
                  value={gender}
                  onChange={setGender}
                  icon={<User className="w-3 h-3" />}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </SelectField>

                {/* Blood Type Dropdown */}
                <SelectField
                  label="Blood Type"
                  value={bloodType}
                  onChange={setBloodType}
                  icon={<Droplets className="w-3 h-3" />}
                >
                  <option value="">Select Blood Type</option>
                  {["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </SelectField>

              </div>
            </div>

            {/* Section: Systemic Conditions */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-[#137dab] rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Systemic Conditions</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <ConditionTag label="Diabetes (Type 1/2)" checked={isDiabetic} onChange={setIsDiabetic} />
                <ConditionTag label="Hypertension" checked={isHypertensive} onChange={setIsHypertensive} />
                <ConditionTag label="Cardiac Complications" checked={hasHeartDisease} onChange={setHasHeartDisease} />
                <ConditionTag label="Respiratory / Asthma" checked={hasAsthma} onChange={setHasAsthma} />
              </div>
            </div>

            {/* Section: Medical Documents (New) */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#137dab] rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Medical Documents</h3>
                </div>
                
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} accept=".pdf,image/*" />
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-[#137dab] hover:bg-[#137dab] hover:text-white shadow-sm'}`}>
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </div>
                </label>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-lg flex items-center gap-2 uppercase tracking-tight">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {uploadError}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {!userFiles || userFiles.length === 0 ? (
                  <div className="col-span-2 py-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No documents uploaded yet</p>
                  </div>
                ) : (
                  userFiles.map((file: any) => (
                    <div key={file._id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-all group">
                       <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-[#137dab]/5 group-hover:text-[#137dab] transition-colors">
                          {file.fileType.includes("image") ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                             <a href={file.url ?? "#"} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-800 truncate hover:text-[#137dab] transition-colors">
                                {file.fileName}
                             </a>
                             <button 
                               onClick={() => deleteFile({ fileId: file._id, storageId: file.storageId })}
                               className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Uploaded {new Date(file.timestamp).toLocaleDateString()}
                             </p>
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 w-fit">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-black uppercase truncate max-w-[120px]">{file.checksum}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section: Clinical Notes */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-[#137dab] rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clinical Notes</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Relevant Conditions</label>
                  <textarea rows={3} value={conditions} onChange={e => setConditions(e.target.value)} placeholder="List of chronic or relevant disorders..." className={inputCls + " resize-none"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Allergen Database</label>
                  <textarea rows={3} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Food, chemical or environmental..." className={inputCls + " resize-none"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Medications</label>
                  <textarea rows={3} value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} placeholder="Medication names & dosage..." className={inputCls + " resize-none"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Additional Notes</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes for your specialist..." className={inputCls + " resize-none"} />
                </div>
              </div>
            </div>

            {/* Section: Emergency Contact & Save */}
            <div className="p-6 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-rose-400 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Emergency Contact</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                    Contact Name
                  </label>
                  <input
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-rose-500" />
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                {saved && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Saved Successfully
                  </div>
                )}
                {!userId && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    Session Error — Log in again
                  </span>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!userId}
                  className="h-11 px-8 bg-[#137dab] text-white hover:bg-[#137dab]/90 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_4px_12px_rgba(19,125,171,0.25)] transition-all active:scale-[0.97]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saved ? "Secured" : "Sync Ledger"}
                </Button>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
