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

      <Card className={`w-full ${isRegister && role === 'patient' ? 'max-w-3xl' : 'max-w-md'} bg-white p-6 relative z-10 animate-reveal shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 rounded-2xl transition-all duration-500`} style={{ animationDelay: '100ms' }}>
        <CardHeader className="space-y-1 text-center pb-8 pt-0">
          <div className="flex justify-center mb-4">
             <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                Healthcare Portal
             </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {isRegister ? "Create an account" : "Sign in to HealthDesk"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-sm leading-relaxed">
            {isRegister ? "Start managing your healthcare experience" : "Enter your credentials to access the system"}
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
            <div className={`space-y-6 flex flex-col justify-center ${isRegister && role === 'patient' ? 'md:w-5/12' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">
                  Full Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-slate-200 focus:border-[#137dab]/50 text-slate-900 text-sm placeholder:text-slate-400 font-medium rounded-xl transition-all bg-slate-50 focus:bg-white focus:ring-[#137dab]/5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
                  Password
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-slate-200 focus:border-[#137dab]/50 text-slate-900 text-sm placeholder:text-slate-400 font-medium rounded-xl transition-all bg-slate-50 focus:bg-white focus:ring-[#137dab]/5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700 ml-1">
                  User Role
                </Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)} required>
                  <SelectTrigger className="h-11 border-slate-200 focus:border-[#137dab]/50 text-slate-900 text-sm font-medium rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white transition-all focus:ring-[#137dab]/5 data-[placeholder]:text-slate-400">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-100 rounded-xl bg-white shadow-2xl text-slate-800 p-2 text-sm">
                    <SelectItem value="patient" className="font-medium py-3 focus:bg-slate-50 focus:text-[#137dab] cursor-pointer rounded-lg mb-1">
                      <div className="flex items-center gap-3">
                        <UserRound className="w-4 h-4 text-[#137dab]" />
                        <span>Patient</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="doctor" className="font-medium py-3 focus:bg-slate-50 focus:text-[#137dab] cursor-pointer rounded-lg mb-1">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-4 h-4 text-[#137dab]" />
                        <span>Medical Practitioner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="receptionist" className="font-medium py-3 focus:bg-slate-50 focus:text-[#137dab] cursor-pointer rounded-lg">
                      <div className="flex items-center gap-3">
                        <BriefcaseMedical className="w-4 h-4 text-[#137dab]" />
                        <span>Receptionist / Staff</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button placed inside Column 1 if wide form */}
              {isRegister && role === 'patient' && (
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#137dab] text-white hover:bg-[#137dab]/90 text-sm font-bold mt-4 rounded-xl shadow-lg shadow-[#137dab]/10 transition-all active:scale-[0.98]"
                  disabled={!name || !password || !role || loading}
                >
                  {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting...</span> : "Create Account"}
                </Button>
              )}
            </div>

            {/* Column 2: Extended Patient Details Container */}
            {isRegister && role === "patient" && (
              <div className="space-y-6 pt-6 mt-6 border-t md:border-t-0 md:border-l md:pl-10 md:pt-0 md:mt-0 border-slate-100 animate-reveal md:w-7/12">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-xl bg-[#137dab]/5 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#137dab]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Medical Information</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Optional medical history for better care</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 ml-1">Age</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" className="h-10 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137dab]/50 text-slate-900 text-sm font-medium rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 ml-1">Gender</Label>
                    <Select value={gender} onValueChange={(v) => v && setGender(v)}>
                      <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-medium rounded-xl data-[placeholder]:text-slate-400">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-100 shadow-2xl rounded-xl p-1 text-slate-800 text-sm">
                        <SelectItem value="Male" className="cursor-pointer rounded-lg focus:bg-slate-50 font-medium">Male</SelectItem>
                        <SelectItem value="Female" className="cursor-pointer rounded-lg focus:bg-slate-50 font-medium">Female</SelectItem>
                        <SelectItem value="Other" className="cursor-pointer rounded-lg focus:bg-slate-50 font-medium">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 ml-1">Blood Type</Label>
                    <Select value={bloodType} onValueChange={(v) => v && setBloodType(v)}>
                      <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-medium rounded-xl data-[placeholder]:text-slate-400">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-100 shadow-2xl rounded-xl p-1 text-slate-800 text-sm">
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                          <SelectItem key={t} value={t} className="cursor-pointer rounded-lg focus:bg-slate-50 font-medium">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 ml-1">Emergency Ph.</Label>
                    <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Next of kin" className="h-10 border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-medium rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 ml-1">Chronic Conditions</Label>
                    <Input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Thyroid, Migraines..." className="h-10 border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-medium rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 ml-1">Known Allergies</Label>
                    <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Penicillin, Peanuts..." className="h-10 border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-[#137dab]/50 text-slate-900 font-medium rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-1 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl mt-2">
                  <label className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer group hover:bg-white p-2 rounded-xl transition-all">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isDiabetic ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-200'}`}>
                      {isDiabetic && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <input type="checkbox" checked={isDiabetic} onChange={(e) => setIsDiabetic(e.target.checked)} className="hidden" />
                    Diabetic
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer group hover:bg-white p-2 rounded-xl transition-all">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isHypertensive ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-200'}`}>
                      {isHypertensive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <input type="checkbox" checked={isHypertensive} onChange={(e) => setIsHypertensive(e.target.checked)} className="hidden" />
                    Hypertensive
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer group hover:bg-white p-2 rounded-xl transition-all">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${hasHeartDisease ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-200'}`}>
                      {hasHeartDisease && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <input type="checkbox" checked={hasHeartDisease} onChange={(e) => setHasHeartDisease(e.target.checked)} className="hidden" />
                    Heart Disease
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer group hover:bg-white p-2 rounded-xl transition-all">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${hasAsthma ? 'bg-[#137dab] border-[#137dab] text-white' : 'bg-white border-slate-200'}`}>
                      {hasAsthma && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
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
                className="w-full h-11 bg-[#137dab] text-white hover:bg-[#137dab]/90 text-sm font-bold mt-6 rounded-xl shadow-lg shadow-[#137dab]/10 transition-all active:scale-[0.98]"
                disabled={!name || !password || !role || loading}
              >
                {loading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span> : (isRegister ? "Create Account" : "Sign In")}
              </Button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center text-sm font-medium text-slate-500">
            {isRegister ? "Already have an account?" : "New to HealthDesk?"}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="ml-2 text-[#137dab] font-bold hover:underline underline-offset-4 transition-all"
              type="button"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Testing Sandbox Section */}
      <div className="w-full max-w-md p-6 bg-white border border-slate-100 rounded-2xl space-y-6 shadow-sm relative overflow-hidden animate-reveal z-10" style={{ animationDelay: '200ms' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-slate-50 pb-4 relative z-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5" /> Demo Environment
          </p>
          <Button variant="ghost" size="sm" onClick={seedDatabase} className="h-8 text-[10px] uppercase font-bold tracking-wider bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full px-4 transition-all border border-slate-100">
            <DatabaseBackup className="w-3 h-3 mr-2 text-[#137dab]" /> Initialize Demo
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[
            { label: "Patient", user: "Alice Patient", role: "patient" },
            { label: "Doctor", user: "Dr. Smith", role: "doctor" },
            { label: "Staff", user: "Jane Frontdesk", role: "receptionist" }
          ].map((item) => (
            <Button 
              key={item.label}
              size="sm" 
              className="bg-slate-50 hover:bg-[#137dab] text-slate-600 hover:text-white h-10 w-full font-bold text-[11px] rounded-xl transition-all border border-slate-100 hover:border-[#137dab] shadow-none group"
              onClick={() => handleAuth(undefined, item.user, "123", item.role as any, false)}
              disabled={loading}
            >
               {item.label}
            </Button>
          ))}
        </div>
        <p className="text-[10px] font-medium text-slate-400 text-center leading-relaxed relative z-10">
           Quick-access accounts for system demonstration.<br/>
           Requires initial database synchronization.
        </p>
      </div>
    </div>
  );
}
