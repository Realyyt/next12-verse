import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

export function useWebRTCCall({
  userId,
  peerId,
  callChannelId,
}: {
  userId: string;
  peerId: string;
  callChannelId: string;
}) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connecting' | 'in-call' | 'ended' | 'rejected' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(true);

  // Setup signaling channel
  useEffect(() => {
    if (!userId || !peerId || !callChannelId) return;
    const channel = supabase.channel(callChannelId);
    channelRef.current = channel;
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [userId, peerId, callChannelId]);

  // Handle incoming signaling messages
  useEffect(() => {
    if (!channelRef.current) return;
    const channel = channelRef.current;
    const handler = (payload: any) => {
      const { type, from, data } = payload.payload;
      if (from === userId) return; // Ignore own messages
      if (type === 'offer') {
        setCallState('incoming');
        handleOffer(data);
      } else if (type === 'answer') {
        handleAnswer(data);
      } else if (type === 'ice-candidate') {
        handleRemoteICE(data);
      } else if (type === 'end') {
        setCallState('ended');
        cleanup();
      } else if (type === 'reject') {
        setCallState('rejected');
        cleanup();
      }
    };
    channel.on('broadcast', { event: 'signal' }, handler);
    return () => {
      channel.off('broadcast', { event: 'signal' }, handler);
    };
    // eslint-disable-next-line
  }, [userId, peerId, callChannelId]);

  // Send signaling message
  const sendSignal = useCallback((type: string, data: any) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type, from: userId, to: peerId, data },
    });
  }, [userId, peerId]);

  // Start a call (as caller)
  const startCall = useCallback(async () => {
    setCallState('calling');
    try {
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      pcRef.current = pc;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (event) => {
        if (event.candidate) sendSignal('ice-candidate', event.candidate);
      };
      pc.ontrack = (event) => {
        setRemoteStream(new MediaStream([event.track]));
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('offer', offer);
    } catch (err: any) {
      setError(err.message);
      setCallState('failed');
    }
  }, [sendSignal]);

  // Accept a call (as callee)
  const acceptCall = useCallback(async () => {
    setCallState('connecting');
    try {
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      pcRef.current = pc;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (event) => {
        if (event.candidate) sendSignal('ice-candidate', event.candidate);
      };
      pc.ontrack = (event) => {
        setRemoteStream(new MediaStream([event.track]));
      };
      // Wait for offer to be set before creating answer
      // (handleOffer will setRemoteDescription)
    } catch (err: any) {
      setError(err.message);
      setCallState('failed');
    }
  }, [sendSignal]);

  // Reject a call
  const rejectCall = useCallback(() => {
    sendSignal('reject', {});
    setCallState('rejected');
    cleanup();
  }, [sendSignal]);

  // End a call
  const endCall = useCallback(() => {
    sendSignal('end', {});
    setCallState('ended');
    cleanup();
  }, [sendSignal]);

  // Handle offer
  const handleOffer = async (offer: any) => {
    try {
      if (!pcRef.current) await acceptCall();
      const pc = pcRef.current!;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal('answer', answer);
      setCallState('in-call');
    } catch (err: any) {
      setError(err.message);
      setCallState('failed');
    }
  };

  // Handle answer
  const handleAnswer = async (answer: any) => {
    try {
      const pc = pcRef.current!;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      setCallState('in-call');
    } catch (err: any) {
      setError(err.message);
      setCallState('failed');
    }
  };

  // Handle remote ICE
  const handleRemoteICE = async (candidate: any) => {
    try {
      const pc = pcRef.current!;
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  // Toggle local video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoEnabled(track.enabled);
      });
    }
  }, [localStream]);

  // Toggle local audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioEnabled(track.enabled);
      });
    }
  }, [localStream]);

  // Toggle remote audio (speaker)
  const toggleRemoteAudio = useCallback(() => {
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsRemoteAudioEnabled(track.enabled);
      });
    }
  }, [remoteStream]);

  return {
    callState,
    error,
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
  };
} 