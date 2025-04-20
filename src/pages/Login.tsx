
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Layout } from "@/components/layout";
import { User, Lock } from "lucide-react";

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
    <Layout showHeader={false}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#9b87f5]/30 to-[#FEC6A1]/30">
        <form className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm space-y-6 border border-[#9b87f5]/10" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold text-center text-[#9b87f5]">Log in to Next12</h2>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-[#9b87f5]" size={18} />
              <Input
                autoFocus
                placeholder="Email"
                className="pl-10"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-[#9b87f5]" size={18} />
              <Input
                placeholder="Password"
                className="pl-10"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
          <div className="text-center text-sm">
            Don't have an account?
            <Link to="/signup" className="ml-1 font-medium text-[#9b87f5] hover:underline">Sign up</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
