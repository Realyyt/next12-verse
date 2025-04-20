
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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
    <div className="min-h-screen flex items-center justify-center bg-[#040423]">
      <div className="bg-white/95 rounded-xl shadow-xl px-8 py-12 w-full max-w-sm flex flex-col gap-8 items-center border border-[#EF400A]/10">
        <img
          src="/lovable-uploads/5653a923-64df-4a42-96c6-9b8ecf9b8ad4.png"
          alt="Next12 Logo"
          className="mb-2 w-20 h-20 rounded-md border-4 border-[#040423] bg-white"
        />
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <span className="text-[#040423]">next</span>
          <span className="text-[#EF400A]">12</span>
        </h2>
        <form className="w-full space-y-5" onSubmit={handleSignup}>
          <div>
            <label className="block mb-1 text-sm text-[#040423] font-medium">Email</label>
            <Input
              autoFocus
              placeholder="Enter your email"
              className="bg-[#F8F8F8] border border-[#898989] text-[#040423] placeholder-[#898989]"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-[#040423] font-medium">Password</label>
            <Input
              placeholder="Create a password"
              className="bg-[#F8F8F8] border border-[#898989] text-[#040423] placeholder-[#898989]"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            className="w-full bg-[#040423] hover:bg-[#EF400A] text-white font-bold tracking-wide text-lg rounded-xl py-2"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>
        <div className="text-center text-sm text-[#898989]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#040423] hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
