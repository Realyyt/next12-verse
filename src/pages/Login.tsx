
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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
    <div className="min-h-screen flex items-center justify-center bg-[#EF400A]">
      <div className="bg-white/95 rounded-xl shadow-xl px-8 py-12 w-full max-w-sm flex flex-col gap-8 items-center border border-[#040423]/10">
        <img
          src="/lovable-uploads/5653a923-64df-4a42-96c6-9b8ecf9b8ad4.png"
          alt="Next12 Logo"
          className="mb-2 w-20 h-20 rounded-md border-4 border-[#EF400A] bg-white"
        />
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <span className="text-[#040423]">next</span>
          <span className="text-[#EF400A]">12</span>
        </h2>
        <form className="w-full space-y-5" onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              className="bg-[#F8F8F8] border border-[#898989] text-[#040423] placeholder-[#898989]"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            className="w-full bg-[#EF400A] hover:bg-[#040423] text-white font-bold tracking-wide text-lg rounded-xl py-2"
            disabled={loading}
            type="submit"
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <div className="text-center text-sm text-[#898989]">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#EF400A] hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
