import React, { Suspense } from 'react';

export default function ChatPage() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      <div className="flex items-center border-b p-4 gap-3">
        <div className="flex-1">
          <div className="font-semibold text-lg">Chat</div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className='text-center p-8'>Loading video, voice, and chat...</div>}>
          {/* <VideoCall100ms /> */}
        </Suspense>
      </div>
    </div>
  );
}
