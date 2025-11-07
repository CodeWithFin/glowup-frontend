import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Auth Modal
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  
  // Mobile Menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  // Mega Menu
  activeMegaMenu: string | null;
  setActiveMegaMenu: (menu: string | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Auth Modal
      isAuthModalOpen: false,
      authModalMode: 'signin',
      openAuthModal: (mode = 'signin') => 
        set({ isAuthModalOpen: true, authModalMode: mode }),
      closeAuthModal: () => 
        set({ isAuthModalOpen: false }),
      
      // Mobile Menu
      isMobileMenuOpen: false,
      toggleMobileMenu: () => 
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => 
        set({ isMobileMenuOpen: false }),
      
      // Mega Menu
      activeMegaMenu: null,
      setActiveMegaMenu: (menu) => 
        set({ activeMegaMenu: menu }),
    }),
    { name: 'UIStore' }
  )
);
