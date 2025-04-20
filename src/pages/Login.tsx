
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

// BRAND: use the new brand graphic as visual focal point throughout
// Glassmorphism and dark gradients for a luxury tech feel

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message });
    } else {
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-tr from-[#100e23] via-[#1a162b] to-[#221e34] overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-[#EF400A]/60 via-[#04D5F5]/40 to-[#a03fff]/30 rounded-full blur-3xl opacity-60 pointer-events-none animate-fade-in" />
      <div className="absolute hidden md:block right-0 top-0 w-2/5 h-full bg-gradient-to-b from-[#0e162b50] via-transparent to-[#ef400a08]" />
      {/* Login panel */}
      <div className="z-10 bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl px-8 py-12 w-full max-w-sm flex flex-col items-center gap-8 relative animate-scale-in transition-all duration-500">
        {/* Branding */}
        <img
          src="/lovable-uploads/5653a923-64df-4a42-96c6-9b8ecf9b8ad4.png"
          alt="Next12 Logo"
          className="mb-2 w-20 h-20 rounded-lg border-4 border-[#EF400A] bg-white/80 backdrop-blur-md shadow-lg"
        />
        <h2 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-[#EF400A] via-white/90 to-[#1a162b] bg-clip-text text-transparent drop-shadow-sm">
          <span className="text-[#fff]">next</span>
          <span className="text-[#EF400A]">12</span>
        </h2>
        {/* Login Form */}
        <form className="w-full space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block mb-2 text-sm text-white font-semibold tracking-wide">Email</label>
            <Input
              autoFocus
              placeholder="Email address"
              className="bg-white/10 border border-[#2D2836] text-white placeholder-[#E5DEFF]/60 focus-visible:ring-2 focus-visible:ring-[#EF400A] transition"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-white font-semibold tracking-wide">Password</label>
            <Input
              placeholder="••••••••"
              className="bg-white/10 border border-[#2D2836] text-white placeholder-[#E5DEFF]/60 focus-visible:ring-2 focus-visible:ring-[#EF400A] transition"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            className="w-full bg-[#EF400A] hover:bg-[#fff] hover:text-[#EF400A] text-white font-bold tracking-wider text-lg rounded-xl py-2 transition-all duration-200 shadow-xl"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <span className="animate-pulse">Logging in...</span>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
        <div className="text-center text-sm text-[#E5DEFF]/90">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-bold text-[#EF400A] hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
