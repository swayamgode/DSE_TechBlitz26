"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Activity, UserRound, Stethoscope, BriefcaseMedical, KeyRound, UserPlus, LogIn, DatabaseBackup } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function LoginPage() {
  const router = useRouter();
  
  // States
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "receptionist" | "">("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginAcc = useMutation(api.users.login);
  const registerAcc = useMutation(api.users.register);
  const initSlots = useMutation(api.slots.initializeSlots);

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
      } else {
        userId = await loginAcc({
          name: finalName,
          password: finalPassword,
          role: finalRole,
        });
      }

      // Save to localStorage for our simple auth setup
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
      try { await registerAcc({ name: "Alice Patient", password: "123", role: "patient" }); } catch (e) {}
      try { await registerAcc({ name: "Dr. Smith", password: "123", role: "doctor" }); } catch (e) {}
      try { await registerAcc({ name: "Jane Frontdesk", password: "123", role: "receptionist" }); } catch (e) {}
      alert("Database slots & test users initialized!");
    } catch(err) {
      alert("Error seeding DB.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">HealthDesk</h1>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200/60 mb-6 relative overflow-hidden">
        {/* Toggle Nav line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 flex">
          <div className={`h-full bg-blue-600 transition-all w-1/2 ${isRegister ? 'translate-x-full' : ''}`} />
        </div>

        <CardHeader className="space-y-1 text-center pb-6 pt-8">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {isRegister ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {isRegister ? "Enter your details to register" : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Full Name
              </Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 focus-visible:ring-blue-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 focus-visible:ring-blue-600 tracking-widest"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                Role
              </Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)} required>
                <SelectTrigger className="h-11 focus-visible:ring-blue-600">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-emerald-500" />
                      <span>Patient</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="doctor">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-500" />
                      <span>Doctor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="receptionist">
                    <div className="flex items-center gap-2">
                      <BriefcaseMedical className="w-4 h-4 text-amber-500" />
                      <span>Receptionist</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className={`w-full h-12 text-white font-semibold transition-colors mt-2 ${isRegister ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'} shadow-lg`}
              disabled={!name || !password || !role || loading}
            >
              {loading ? "Authenticating..." : (isRegister ? <><UserPlus className="w-4 h-4 mr-2" /> Sign Up</> : <><LogIn className="w-4 h-4 mr-2" /> Sign In</>)}
            </Button>
          </form>

          <div className="mt-6 flex justify-center text-sm text-slate-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="ml-1 text-blue-600 font-semibold hover:underline"
              type="button"
            >
              {isRegister ? "Sign in instead" : "Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Developer Quick-Start Options */}
      <div className="w-full max-w-md p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-slate-300 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-screen blur-xl"></div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-3 h-3" /> Dev Sandbox Mode
          </p>
          <Button variant="ghost" size="sm" onClick={seedDatabase} className="h-7 text-[10px] uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full px-3">
            <DatabaseBackup className="w-3 h-3 mr-1 text-emerald-400" /> Init Data Objects
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 relative z-10">
          <Button 
            size="sm" 
            className="text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 h-10 w-full font-medium"
            onClick={() => handleAuth(undefined, "Alice Patient", "123", "patient", false)}
            disabled={loading}
          >
             Patient
          </Button>
          <Button 
            size="sm" 
            className="text-blue-300 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 h-10 w-full font-medium"
            onClick={() => handleAuth(undefined, "Dr. Smith", "123", "doctor", false)}
            disabled={loading}
          >
             Doctor
          </Button>
          <Button 
            size="sm" 
            className="text-amber-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 h-10 w-full font-medium px-1"
            onClick={() => handleAuth(undefined, "Jane Frontdesk", "123", "receptionist", false)}
            disabled={loading}
          >
             Receptionist
          </Button>
        </div>
        <p className="text-[10px] text-slate-500 text-center">Clicking above automatically attempts to login with test accounts (Requires "Init Data" first!).</p>
      </div>
    </div>
  );
}
