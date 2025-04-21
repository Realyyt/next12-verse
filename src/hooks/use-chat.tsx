
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface ChatState {
  isOpen: boolean;
  activeUser: User | null;
  openChat: (user: User) => void;
  closeChat: () => void;
}

export const useChat = create<ChatState>((set) => ({
  isOpen: false,
  activeUser: null,
  openChat: (user) => set({ isOpen: true, activeUser: user }),
  closeChat: () => set({ isOpen: false }),
}));
