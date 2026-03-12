"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Activity, UserRound, Stethoscope, BriefcaseMedical } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "receptionist" | "">("");
  const [loading, setLoading] = useState(false);

  // We use Convex directly! (Will only work once user completes npx convex dev)
  const loginOrCreate = useMutation(api.users.loginOrCreate);

  const handleLogin = async (e?: React.FormEvent, forceName?: string, forceRole?: "patient" | "doctor" | "receptionist") => {
    e?.preventDefault();
    const finalName = forceName || name;
    const finalRole = forceRole || role;

    if (!finalName || !finalRole) return;

    setLoading(true);

    try {
      const userId = await loginOrCreate({
        name: finalName,
        role: finalRole,
      });

      // Save to localStorage for our simple auth setup
      localStorage.setItem("healthdesk_userId", userId as string);
      localStorage.setItem("healthdesk_userRole", finalRole);

      // Simple role-based routing
      if (finalRole === "patient") {
        router.push("/patient");
      } else if (finalRole === "doctor") {
        router.push("/doctor");
      } else if (finalRole === "receptionist") {
        router.push("/receptionist");
      }
    } catch (err) {
      console.error(err);
      alert("Note: ensure Convex is running properly locally.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">HealthDesk</h1>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200/60 mb-6">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your details to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
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
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              disabled={!name || !role || loading}
            >
              {loading ? "Signing in..." : "Sign In to HealthDesk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-6 pb-2">
          <p className="text-xs text-slate-400 text-center">
            By signing in, you agree to our Terms of Service & Privacy Policy.
          </p>
        </CardFooter>
      </Card>

      {/* Developer Quick-Start Options */}
      <div className="w-full max-w-md p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
        <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider text-center">
          Developer Quick Access
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 h-10 w-full"
            onClick={() => handleLogin(undefined, "Alice Patient", "patient")}
            disabled={loading}
          >
            <UserRound className="w-3 h-3 mr-1" /> Patient
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 h-10 w-full"
            onClick={() => handleLogin(undefined, "Dr. Smith", "doctor")}
            disabled={loading}
          >
            <Stethoscope className="w-3 h-3 mr-1" /> Doctor
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 h-10 w-full"
            onClick={() => handleLogin(undefined, "Jane Frontdesk", "receptionist")}
            disabled={loading}
          >
            <BriefcaseMedical className="w-3 h-3 mr-1" /> Reception
          </Button>
        </div>
      </div>
    </div>
  );
}
