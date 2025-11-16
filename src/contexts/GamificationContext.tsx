import { createContext, useContext, ReactNode } from 'react';
import { useGamification } from '@/hooks/useGamification';

const GamificationContext = createContext<ReturnType<typeof useGamification> | null>(null);

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const gamification = useGamification();
  
  return (
    <GamificationContext.Provider value={gamification}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamificationContext = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationContext must be used within GamificationProvider');
  }
  return context;
};
