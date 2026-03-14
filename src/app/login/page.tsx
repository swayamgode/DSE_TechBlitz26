"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Activity, UserRound, Stethoscope, BriefcaseMedical, KeyRound, DatabaseBackup, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function LoginPage() {
  const router = useRouter();
  
  // States
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "receptionist" | "">("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Detailed Patient Registration States
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [contact, setContact] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  // Booleans
  const [isDiabetic, setIsDiabetic] = useState(false);
  const [isHypertensive, setIsHypertensive] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasHeartDisease, setHasHeartDisease] = useState(false);

  const loginAcc = useMutation(api.users.login);
  const registerAcc = useMutation(api.users.register);
  const initSlots = useMutation(api.slots.initializeSlots);
  const saveMed = useMutation(api.medicalInfo.saveMedicalInfo);

  const handleAuth = async (e?: React.FormEvent, forceName?: string, forcePassword?: string, forceRole?: "patient" | "doctor" | "receptionist", forceRegister?: boolean) => {
    e?.preventDefault();
    setErrorMsg("");

    const finalName = forceName || name;
    const finalPassword = forcePassword || password;
    const finalRole = forceRole || role;

    if (!finalName || !finalPassword || !finalRole) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      let userId;
      
      const shouldRegister = forceRegister !== undefined ? forceRegister : isRegister;

      if (shouldRegister) {
        userId = await registerAcc({
          name: finalName,
          password: finalPassword,
          role: finalRole,
        });

        // If the user registers as a patient, generate their medical record immediately
        if (finalRole === "patient") {
          await saveMed({
            patientId: userId as Id<"users">,
            age: age ? Number(age) : undefined,
            gender: gender || undefined,
            bloodType: bloodType || undefined,
            emergencyContact: contact || undefined,
            allergies: allergies || undefined,
            conditions: conditions || undefined,
            isDiabetic: isDiabetic,
            isHypertensive: isHypertensive,
            hasAsthma: hasAsthma,
            hasHeartDisease: hasHeartDisease,
            notes: "Initial registration details completed via healthdesk portal.",
          });
        }
      } else {
        userId = await loginAcc({
          name: finalName,
          password: finalPassword,
          role: finalRole,
        });
      }

      // Save to localStorage
      localStorage.setItem("healthdesk_userId", userId as string);
      localStorage.setItem("healthdesk_userRole", finalRole);

      // Routing
      if (finalRole === "patient") router.push("/patient");
      else if (finalRole === "doctor") router.push("/doctor");
      else if (finalRole === "receptionist") router.push("/receptionist");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    try {
      await initSlots();
      // Register developer mocks
      try { 
        const aliceId = await registerAcc({ name: "Alice Patient", password: "123", role: "patient" }); 
        if (aliceId) {
          // Block 1: Initial Enrollment
          await saveMed({
            patientId: aliceId as Id<"users">,
            age: 28,
            gender: "Female",
            bloodType: "O+",
            isDiabetic: false,
            isHypertensive: false,
            hasHeartDisease: false,
            hasAsthma: true,
            conditions: "Asthma since childhood",
            allergies: "None known",
            currentMedications: "Salbutamol Inhaler (PRN)",
            notes: "Initial registration. Patient reports occasional wheezing.",
            emergencyContact: "Bob - +91 98765 43210"
          });

          // Block 2: Allergy Update (Simulating a later date)
          await saveMed({
            patientId: aliceId as Id<"users">,
            age: 28,
            gender: "Female",
            bloodType: "O+",
            isDiabetic: false,
            isHypertensive: false,
            hasHeartDisease: false,
            hasAsthma: true,
            conditions: "Asthma, Seasonal Allergies",
            allergies: "Peanuts, Penicillin",
            currentMedications: "Salbutamol, Cetirizine 10mg",
            notes: "Recently developed peanut allergy symptoms.",
            emergencyContact: "Bob - +91 98765 43210"
          });

          // Block 3: Latest - Hypertensive Diagnosis
          await saveMed({
            patientId: aliceId as Id<"users">,
            age: 28,
            gender: "Female",
            bloodType: "O+",
            isDiabetic: false,
            isHypertensive: true,
            hasHeartDisease: false,
            hasAsthma: true,
            conditions: "Asthma, Mild Hypertension",
            allergies: "Peanuts, Penicillin",
            currentMedications: "Salbutamol, Cetirizine, Lisinopril 5mg",
            notes: "Blood pressure elevated across last 3 readings. Initiated 5mg Lisinopril.",
            emergencyContact: "Bob - +91 98765 43210"
          });
        }
      } catch (e) {}
      try { await registerAcc({ name: "Dr. Smith", password: "123", role: "doctor" }); } catch (e) {}
      try { await registerAcc({ name: "Jane Frontdesk", password: "123", role: "receptionist" }); } catch (e) {}
      alert("Database synced with test users & medical records!");
    } catch(err) {
      alert("Error seeding DB.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-[#137dab]/20 selection:text-[#137dab] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#137dab]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="flex items-center gap-3 mb-8 animate-reveal relative z-10">
        <div className="p-2 bg-white rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-slate-100">
          <Activity className="w-8 h-8 text-[#137dab]" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-800 uppercase underline decoration-4 decoration-[#137dab]/20 underline-offset-8">HealthDesk</h1>
      </div>

      <Card className={`w-full ${isRegister && role === 'patient' ? 'max-w-3xl' : 'max-w-sm'} bg-white p-2 md:p-4 mb-4 relative z-10 animate-reveal shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 rounded-3xl transition-all duration-500`} style={{ animationDelay: '100ms' }}>
        <CardHeader className="space-y-1 text-center pb-4 pt-4">
          <div className="flex justify-center mb-2">
             <div className="px-3 py-1 bg-[#137dab]/10 text-[#137dab] rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-[#137dab]/20">
                Secure Portal
             </div>
          </div>
          <CardTitle className="text-xl font-black tracking-tight uppercase text-slate-900 drop-shadow-sm">
            {isRegister ? "Access Token" : "Identification"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
            {isRegister ? "Register new system credentials" : "Confirm identity via secure terminal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-black uppercase text-center flex items-center justify-center gap-3 shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className={`space-y-5 ${isRegister && role === 'patient' ? 'md:flex md:gap-10 md:space-y-0 text-left' : ''}`}>
            
            {/* Column 1: Core Credentials */}
            <div className={`space-y-5 flex flex-col justify-center ${isRegister && role === 'patient' ? 'md:w-5/12' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Username / Alias
                </Label>
                <Input 
                  id="name" 
                  placeholder="TYPE NAME..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 border-slate-200 focus:border-[#137dab]/50 text-slate-900 text-xs placeholder:text-slate-400 font-bold uppercase tracking-wider rounded-lg transition-all bg-slate-50 focus:bg-white focus:ring-[#137dab]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Hash / Password
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 border-slate-200 focus:border-[#137dab]/50 text-slate-900 text-xs placeholder:text-slate-400 font-bold tracking-widest rounded-lg transition-all bg-slate-50 focus:bg-white focus:ring-[#137dab]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Protocol / Role
                </Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)} required>
                  <SelectTrigger className="h-10 border-slate-200 focus:border-[#137dab]/50 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg bg-slate-50 hover:bg-slate-100/50 focus:bg-white transition-all focus:ring-[#137dab]/20 data-[placeholder]:text-slate-400">
                    <SelectValue placeholder="System Access Level" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 rounded-lg bg-white shadow-xl text-slate-800 p-1 text-xs">
                    <SelectItem value="patient" className="font-bold py-2 focus:bg-slate-100 focus:text-slate-900 cursor-pointer rounded-md mb-1">
                      <div className="flex items-center gap-2">
                        <UserRound className="w-3 h-3 text-[#137dab]" />
                        <span className="uppercase tracking-widest text-[9px]">Patient System</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="doctor" className="font-bold py-2 focus:bg-slate-100 focus:text-slate-900 cursor-pointer rounded-md mb-1">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3 h-3 text-[#137dab]" />
                        <span className="uppercase tracking-widest text-[9px]">Medical Staff</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="receptionist" className="font-bold py-2 focus:bg-slate-100 focus:text-slate-900 cursor-pointer rounded-md">
                      <div className="flex items-center gap-2">
                        <BriefcaseMedical className="w-3 h-3 text-[#137dab]" />
                        <span className="uppercase tracking-widest text-[9px]">Admin / Desk</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button placed inside Column 1 if wide form */}
              {isRegister && role === 'patient' && (
                <Button 
                  type="submit" 
                  className="w-full h-10 bg-[#137dab] text-white hover:bg-[#137dab]/90 text-[10px] font-black uppercase tracking-[0.2em] mt-4 rounded-lg shadow-[0_5px_15px_rgba(19,125,171,0.25)] transition-all active:scale-[0.98] active:shadow-sm"
                  disabled={!name || !password || !role || loading}
                >
                  {loading ? <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> PROCESSING...</span> : "INIT ACCESS"}
                </Button>
              )}
            </div>

            {/* Column 2: Extended Patient Details Container */}
            {isRegister && role === "patient" && (
              <div className="space-y-4 pt-6 mt-6 border-t md:border-t-0 md:border-l md:pl-10 md:pt-0 md:mt-0 border-slate-100 animate-reveal md:w-7/12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#137dab]/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#137dab]" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-800">Patient Intake Form</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Medical baseline (Optional sync)</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Age</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" className="h-9 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137dab]/50 text-slate-900 text-xs font-bold rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</Label>
                    <Select value={gender} onValueChange={(v) => v && setGender(v)}>
                      <SelectTrigger className="h-9 border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-bold rounded-lg data-[placeholder]:text-slate-400">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg p-1 text-slate-800 text-xs">
                        <SelectItem value="Male" className="cursor-pointer rounded-md focus:bg-slate-100 font-semibold">Male</SelectItem>
                        <SelectItem value="Female" className="cursor-pointer rounded-md focus:bg-slate-100 font-semibold">Female</SelectItem>
                        <SelectItem value="Other" className="cursor-pointer rounded-md focus:bg-slate-100 font-semibold">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Blood Type</Label>
                    <Input value={bloodType} onChange={(e) => setBloodType(e.target.value)} placeholder="e.g. O+" className="h-9 border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-bold uppercase rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Emergency Ph.</Label>
                    <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Next of kin" className="h-9 border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-bold rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Chronic Conditions</Label>
                    <Input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Thyroid, Migraines..." className="h-9 border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-bold rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Known Allergies</Label>
                    <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Penicillin, Peanuts..." className="h-9 border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-bold rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-1 bg-slate-50 p-4 border border-slate-100 rounded-xl mt-2">
                  <label className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-700 cursor-pointer group hover:bg-white p-1 rounded-md transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isDiabetic ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-300'}`}>
                      {isDiabetic && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                    </div>
                    <input type="checkbox" checked={isDiabetic} onChange={(e) => setIsDiabetic(e.target.checked)} className="hidden" />
                    Diabetic
                  </label>
                  <label className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-700 cursor-pointer group hover:bg-white p-1 rounded-md transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isHypertensive ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-300'}`}>
                      {isHypertensive && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                    </div>
                    <input type="checkbox" checked={isHypertensive} onChange={(e) => setIsHypertensive(e.target.checked)} className="hidden" />
                    Hypertensive
                  </label>
                  <label className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-700 cursor-pointer group hover:bg-white p-1 rounded-md transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${hasHeartDisease ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-300'}`}>
                      {hasHeartDisease && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                    </div>
                    <input type="checkbox" checked={hasHeartDisease} onChange={(e) => setHasHeartDisease(e.target.checked)} className="hidden" />
                    Heart Disease
                  </label>
                  <label className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-700 cursor-pointer group hover:bg-white p-1 rounded-md transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${hasAsthma ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-300'}`}>
                      {hasAsthma && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                    </div>
                    <input type="checkbox" checked={hasAsthma} onChange={(e) => setHasAsthma(e.target.checked)} className="hidden" />
                    Asthmatic
                  </label>
                </div>
              </div>
            )}
            
            {/* Submit Button for Default flow (not patient register) */}
            {!(isRegister && role === 'patient') && (
              <Button 
                type="submit" 
                className="w-full h-10 bg-[#137dab] text-white hover:bg-[#137dab]/90 text-[10px] font-black uppercase tracking-[0.2em] mt-6 rounded-lg shadow-[0_5px_15px_rgba(19,125,171,0.25)] transition-all active:scale-[0.98] active:shadow-sm"
                disabled={!name || !password || !role || loading}
              >
                {loading ? <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> PROCESSING...</span> : (isRegister ? "INIT ACCESS" : "AUTHORIZE")}
              </Button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isRegister ? "Existing user?" : "New user?"}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="ml-2 text-[#137dab] font-bold hover:underline underline-offset-4 transition-all"
              type="button"
            >
              {isRegister ? "Switch to Login" : "Initialize Registration"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Developer Quick-Start Options */}
      <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-[2rem] space-y-6 shadow-xl relative overflow-hidden animate-reveal z-10" style={{ animationDelay: '200ms' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl" />
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <KeyRound className="w-3 h-3 text-slate-400" /> Sandboxed Credentials
          </p>
          <Button variant="ghost" size="sm" onClick={seedDatabase} className="h-8 text-[9px] uppercase font-black tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-4 transition-all">
            <DatabaseBackup className="w-3 h-3 mr-2 text-[#137dab]" /> Sync Node
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 relative z-10">
          <Button 
            size="sm" 
            className="bg-slate-100 hover:bg-[#137dab] text-slate-700 hover:text-white h-9 w-full font-black uppercase text-[9px] tracking-widest rounded-lg transition-all shadow-sm group"
            onClick={() => handleAuth(undefined, "Alice Patient", "123", "patient", false)}
            disabled={loading}
          >
             Patient
          </Button>
          <Button 
            size="sm" 
            className="bg-slate-100 hover:bg-[#137dab] text-slate-700 hover:text-white h-9 w-full font-black uppercase text-[9px] tracking-widest rounded-lg transition-all shadow-sm group"
            onClick={() => handleAuth(undefined, "Dr. Smith", "123", "doctor", false)}
            disabled={loading}
          >
             Doctor
          </Button>
          <Button 
            size="sm" 
            className="bg-slate-100 hover:bg-[#137dab] text-slate-700 hover:text-white h-9 w-full font-black uppercase text-[9px] tracking-widest rounded-lg transition-all shadow-sm group"
            onClick={() => handleAuth(undefined, "Jane Frontdesk", "123", "receptionist", false)}
            disabled={loading}
          >
             Desk
          </Button>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center leading-relaxed relative z-10">
           Secure bypass enabled for system testing.<br/>
           Requires Active Node Sync.
        </p>
      </div>
    </div>
  );
}
