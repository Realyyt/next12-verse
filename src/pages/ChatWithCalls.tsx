import React, { useEffect, useRef, useState } from 'react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { supabase } from '@/lib/supabaseClient';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';

// Helper to fetch a profile
async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data;
}

export default function ChatWithCalls() {
  console.log('ChatWithCalls component rendered');
  const { peerId } = useParams<{ peerId: string }>();
  // Auth
  const { user, loading } = useAuthUser();
  const [myProfile, setMyProfile] = useState<any>(null);
  const [peerProfile, setPeerProfile] = useState<any>(null);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  // WebRTC call state
  const [callChannelId, setCallChannelId] = useState<string | null>(null);
  const {
    callState,
    error: callError,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isVideoEnabled,
    isAudioEnabled,
    isRemoteAudioEnabled,
    toggleVideo,
    toggleAudio,
    toggleRemoteAudio,
  } = useWebRTCCall({ userId: user?.id || '', peerId, callChannelId: callChannelId || '' });

  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Fetch profiles
  useEffect(() => {
    console.log('useEffect triggered', { user, peerId });
    if (!user?.id) return;
    fetchProfile(user.id).then(setMyProfile);
    fetchProfile(peerId).then(setPeerProfile);
    setCallChannelId(`call-${[user.id, peerId].sort().join('-')}`);
  }, [user, peerId]);

  // Fetch chat messages
  useEffect(() => {
    if (!user?.id || !peerId) return;
    let ignore = false;
    supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!ignore) setMessages(data || []);
      });
    // Subscribe to new messages
    const channel = supabase.channel(`chat-${[user.id, peerId].sort().join('-')}`);
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      setMessages((prev) => [...prev, payload.new]);
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
    channel.subscribe();
    return () => {
      ignore = true;
      channel.unsubscribe();
    };
  }, [user, peerId]);

  // Send chat message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.id || !peerId) return;
    try {
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: peerId,
        content: input.trim(),
        type: 'text',
      });
      setInput('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  };

  // Handle file select/upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id || !peerId) return;
    setFileUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('chat-media').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(filePath);
      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: peerId,
        content: messageType === 'image' ? 'Sent an image' : 'Sent a file',
        type: messageType,
        media_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });
      toast({ title: 'Upload successful', description: file.name });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to upload file.', variant: 'destructive' });
    } finally {
      setFileUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStartCall = async () => {
    console.log('handleStartCall triggered');
    console.log('Starting call...', { callState, callError, user, peerId });
    if (callState === 'calling' || callState === 'in-call' || callState === 'connecting') {
      console.log('Call already in progress');
      return;
    }
    try {
      await startCall();
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  if (loading || !myProfile || !peerProfile) {
    console.log('Loading state:', { loading, myProfile, peerProfile });
    return <div className="flex-1 flex justify-center items-center">Loading...</div>;
  }

  // UI
  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center border-b p-4 gap-3">
        <img src={peerProfile.avatar || ''} alt={peerProfile.name} className="h-10 w-10 rounded-full object-cover bg-gray-200" />
        <div className="flex-1 ml-3">
          <div className="font-semibold text-lg">{peerProfile.name}</div>
          <div className="text-xs text-next12-gray">@{peerProfile.username}</div>
        </div>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            console.log('Call button clicked');
            handleStartCall();
          }}
          disabled={callState === 'calling' || callState === 'in-call' || callState === 'connecting'}
        >
          {callState === 'calling' || callState === 'connecting' ? 'Calling...' : 'Call'}
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            const senderProfile = isMe ? myProfile : peerProfile;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end`}>
                {!isMe && (
                  <img src={senderProfile.avatar || ''} alt={senderProfile.name} className="h-8 w-8 rounded-full object-cover bg-gray-200 mr-2" />
                )}
                <div>
                  <div className={`rounded-xl px-4 py-2 max-w-xs ${isMe ? 'bg-next12-orange text-white' : 'bg-gray-100 text-next12-dark'}`}
                    style={{ wordBreak: 'break-word' }}>
                    <div className="font-semibold text-xs mb-1">{senderProfile.name}</div>
                    {msg.type === 'text' && <div>{msg.content}</div>}
                    {msg.type === 'image' && (
                      <div className="space-y-2">
                        <img src={msg.media_url} alt="Shared image" className="rounded-lg max-w-full" />
                        <div>{msg.content}</div>
                      </div>
                    )}
                    {msg.type === 'file' && (
                      <div className="space-y-2">
                        <a
                          href={msg.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:underline"
                        >
                          <span>{msg.file_name}</span>
                        </a>
                        <div>{msg.content}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs opacity-60">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Message status placeholder (sent, delivered, read) */}
                    {isMe && <span className="text-xs text-green-600">✓</span>}
                  </div>
                </div>
                {isMe && (
                  <img src={senderProfile.avatar || ''} alt={senderProfile.name} className="h-8 w-8 rounded-full object-cover bg-gray-200 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat input */}
      <form className="flex gap-2 border-t p-4" onSubmit={sendMessage}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        />
        <button
          type="button"
          className="bg-gray-200 px-3 py-1 rounded"
          onClick={() => fileInputRef.current?.click()}
          disabled={fileUploading}
        >
          {fileUploading ? 'Uploading...' : 'Attach'}
        </button>
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="bg-next12-orange text-white px-4 py-2 rounded" type="submit" disabled={!input.trim()}>
          Send
        </button>
      </form>

      {/* Incoming call popup */}
      {callState === 'incoming' && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] bg-white shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 w-[350px] border border-gray-200 animate-slideDown">
          <div className="flex-1">
            <div className="font-semibold text-lg text-next12-dark flex items-center gap-2">
              Incoming call from {peerProfile.name}
            </div>
            <div className="flex gap-2 mt-3">
              <button className="bg-green-500 hover:bg-green-600 text-white flex-1 rounded px-4 py-2" onClick={acceptCall}>Accept</button>
              <button className="bg-red-500 hover:bg-red-600 text-white flex-1 rounded px-4 py-2" onClick={rejectCall}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* In-call UI */}
      {(callState === 'in-call' || callState === 'connecting' || callState === 'calling') && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-lg flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <video
                autoPlay
                playsInline
                muted
                ref={ref => {
                  if (ref && localStream) ref.srcObject = localStream;
                }}
                className="w-40 h-32 bg-gray-900 rounded-lg"
              />
              <video
                autoPlay
                playsInline
                ref={ref => {
                  if (ref && remoteStream) ref.srcObject = remoteStream;
                }}
                className="w-40 h-32 bg-gray-900 rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-full"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? 'Camera Off' : 'Camera On'}
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-full"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? 'Mute Mic' : 'Unmute Mic'}
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-full"
                onClick={toggleRemoteAudio}
              >
                {isRemoteAudioEnabled ? 'Speaker Off' : 'Speaker On'}
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full" onClick={endCall}>End Call</button>
            </div>
            {callError && <div className="text-red-500 mt-2">{callError}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 