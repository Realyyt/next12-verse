
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Signup: Match luxury tech glassmorphism login style
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message });
    } else {
      toast({ title: "Welcome!", description: "Check your email for confirmation." });
      navigate("/login");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0C021A] via-[#18082F] to-[#0f1015] overflow-hidden">
      {/* Glowing animated brand gradient orbs */}
      <div className="pointer-events-none absolute w-[600px] h-[600px] bg-gradient-to-br from-[#EF400A]/30 via-[#500096]/20 to-[#3CDDF5]/10 rounded-full blur-[120px] opacity-90 left-1/2 -translate-x-1/2 -top-60 animate-fade-in" />
      <div className="pointer-events-none absolute w-[350px] h-[350px] bg-gradient-to-tr from-[#EF400A]/40 via-transparent to-[#a03fff]/20 rounded-full blur-[90px] opacity-90 right-4 top-12 animate-fade-in-slow" />
      <div className="pointer-events-none absolute w-1/2 md:w-1/4 h-4/6 right-0 bottom-0 bg-gradient-to-tl from-transparent via-[#3cdff599]/20 to-[#100e23]/0 blur-2xl" />
      {/* Glassmorphic panel */}
      <div className="z-20 relative max-w-md w-full px-8 py-12 rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_-10px_#EF400A33,0_2px_16px_-4px_#16121C88] backdrop-blur-2xl flex flex-col items-center gap-8 animate-scale-in">
        {/* Logo/Brand */}
        <img
          src="/lovable-uploads/5653a923-64df-4a42-96c6-9b8ecf9b8ad4.png"
          alt="Next12 Logo"
          className="w-20 h-20 mb-1 rounded-xl border-4 border-[#EF400A] shadow-lg glass-morphism"
          draggable={false}
        />
        <h1 className="text-4xl font-extrabold tracking-wider flex items-center gap-2 bg-gradient-to-r from-[#fff] via-[#EF400A] to-[#4c4280] bg-clip-text text-transparent text-gradient drop-shadow-md select-none">
          next
          <span className="text-[#EF400A]">12</span>
        </h1>
        {/* Signup Form */}
        <form className="w-full space-y-7" onSubmit={handleSignup}>
          <div>
            <label className="block mb-2 text-sm font-semibold tracking-wide text-[#e5deff]">Email</label>
            <Input
              autoFocus
              placeholder="Email address"
              className="bg-white/10 border border-[#332f50] text-white placeholder-[#E5DEFF]/70 focus-visible:ring-2 focus-visible:ring-[#EF400A] focus:bg-black/25 transition-all"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold tracking-wide text-[#e5deff]">Password</label>
            <Input
              placeholder="Create a password"
              className="bg-white/10 border border-[#332f50] text-white placeholder-[#E5DEFF]/60 focus-visible:ring-2 focus-visible:ring-[#EF400A] focus:bg-black/25 transition-all"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#EF400A] via-[#a03fff] to-[#04D5F5] hover:brightness-110 hover:scale-105 transition-all duration-200 text-white font-bold tracking-wider text-lg rounded-2xl py-2 shadow-xl"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing up…" : "Sign up"}
          </Button>
        </form>
        <div className="text-center text-sm text-[#E5DEFF]/80">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#EF400A] hover:underline hover:brightness-125 transition">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
