
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, Send, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export default function ChatPage() {
  const { id: chatUserId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get recipient profile
  useEffect(() => {
    if (!chatUserId) return;
    supabase.from("profiles").select("*").eq("id", chatUserId).single().then(({ data }) => {
      setProfile(data);
    });
  }, [chatUserId]);

  // Get my profile
  useEffect(() => {
    if (user?.email) {
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        setMyProfile(data);
      });
    }
  }, [user]);

  // Fetch messages
  useEffect(() => {
    if (!user || !chatUserId) return;
    supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatUserId}),and(sender_id.eq.${chatUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        if (scrollAreaRef.current) setTimeout(() => {
          scrollAreaRef.current!.scrollTop = scrollAreaRef.current!.scrollHeight;
        }, 100);
      });
    // For simplicity: not subscribing to realtime updates yet
  }, [user, chatUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-screen">User not found</div>;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageInput.trim()) return;
    setMessageInput("");
    const { data, error } = await supabase.from("messages").insert([{
      sender_id: user.id,
      receiver_id: chatUserId,
      content: messageInput.trim()
    }]).select().single();
    if (error) return; // TODO: Toast
    setMessages([...messages, data]);
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      <div className="flex items-center border-b p-4 gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          {profile.avatar ? <AvatarImage src={profile.avatar} alt={profile.name} />
          : <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>}
        </Avatar>
        <div>
          <div className="font-semibold">{profile.name}</div>
          <div className="text-xs text-next12-gray">@{profile.username}</div>
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
            >
              <div className={`rounded-xl px-4 py-2 max-w-xs ${msg.sender_id === user.id ? "bg-next12-orange text-white" : "bg-gray-100 text-next12-dark"}`}>
                <div>{msg.content}</div>
                <div className="text-xs mt-1 opacity-60">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form className="flex gap-2 border-t p-4" onSubmit={sendMessage}>
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" size="icon" disabled={!messageInput.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
