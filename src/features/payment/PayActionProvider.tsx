import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';

interface PayActionContextType {
  performPayAction: (partyId: string, instanceGuid: string) => void;
}

const PayActionContext = createContext<PayActionContextType | undefined>(undefined);

export const usePayAction = () => {
  const context = useContext(PayActionContext);
  if (!context) {
    throw new Error('usePayAction must be used within a PayActionProvider');
  }
  return context;
};

interface PayActionProviderProps {
  children: ReactNode;
}

export const PayActionProvider: React.FC<PayActionProviderProps> = ({ children }) => {
  const partyId = useNavigationParam('partyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const performPayActionMutation = usePerformPayActionMutation(partyId, instanceGuid);

  const performPayAction = () => {
    performPayActionMutation.mutate();
  };

  return <PayActionContext.Provider value={{ performPayAction }}>{children}</PayActionContext.Provider>;
};
