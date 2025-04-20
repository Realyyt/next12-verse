
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { IconMail, IconLock } from "lucide-react";

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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE8FB] via-[#E9F9FF] to-[#f9f6f6] overflow-hidden transition-colors duration-300">
      {/* Glowing gradient orbs */}
      <div className="pointer-events-none absolute w-[520px] h-[520px] bg-gradient-to-br from-[#EF400A]/30 via-[#500096]/10 to-[#D8F4FC]/20 rounded-full blur-[120px] opacity-80 left-1/2 -translate-x-1/2 -top-56 animate-fade-in" />
      <div className="pointer-events-none absolute w-[280px] h-[280px] bg-gradient-to-tr from-[#EF400A]/50 via-transparent to-[#a03fff]/20 rounded-full blur-[80px] opacity-90 right-6 top-12 animate-fade-in-slow" />
      <div className="pointer-events-none absolute w-2/5 md:w-1/6 h-3/6 left-0 bottom-0 bg-gradient-to-tr from-[#FFD3C6]/40 via-[#F9DDFF]/10 to-transparent blur-2xl" />
      {/* Glassmorphic Card */}
      <div className="z-20 relative max-w-md w-full px-8 py-12 rounded-3xl border border-white/25 bg-white/70 shadow-[0_18px_60px_-10px_#e9aae633,0_2px_16px_-4px_#EFC59E88] glass-morphism backdrop-blur-2xl flex flex-col items-center gap-8 animate-scale-in transition-shadow duration-300">
        {/* Brand */}
        <img
          src="/lovable-uploads/5653a923-64df-4a42-96c6-9b8ecf9b8ad4.png"
          alt="Next12 Logo"
          className="w-20 h-20 mb-2 rounded-xl border-4 border-[#EF400A] shadow-lg select-none"
          draggable={false}
        />
        <h1 className="text-4xl font-extrabold tracking-wider flex items-center gap-2 bg-gradient-to-r from-[#3b2430] via-[#EF400A] to-[#4c4280] bg-clip-text text-transparent text-gradient drop-shadow-md select-none">
          next
          <span className="text-[#EF400A]">12</span>
        </h1>
        {/* Signup Form */}
        <form className="w-full space-y-8" onSubmit={handleSignup}>
          <div>
            <label className="block mb-2 text-sm font-semibold tracking-wide text-[#483D5B]">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#EF400A]">
                <IconMail size={18} />
              </span>
              <Input
                autoFocus
                placeholder="Email address"
                className="pl-10 bg-white/40 border border-[#f2dbfa] text-zinc-700 placeholder-[#ac79e3]/60 focus-visible:ring-2 focus-visible:ring-[#EF400A] focus:bg-white/70 transition-all"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold tracking-wide text-[#483D5B]">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#EF400A]">
                <IconLock size={18} />
              </span>
              <Input
                placeholder="Create a password"
                className="pl-10 bg-white/40 border border-[#f2dbfa] text-zinc-700 placeholder-[#ac79e3]/60 focus-visible:ring-2 focus-visible:ring-[#EF400A] focus:bg-white/70 transition-all"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#EF400A] via-[#a03fff] to-[#04D5F5] hover:brightness-105 hover:scale-[1.03] transition-all duration-200 text-white font-bold tracking-wider text-lg rounded-2xl py-2 shadow-xl"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing up…" : "Sign up"}
          </Button>
        </form>
        <div className="text-center text-sm text-[#6e5687]">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#EF400A] hover:underline hover:brightness-125 transition">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
