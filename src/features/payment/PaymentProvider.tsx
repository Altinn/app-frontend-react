import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import { Loader } from 'src/core/loading/Loader';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';

type PaymentContextProps = {
  showLoader: () => void;
  hideLoader: () => void;
  usePerformPayment: () => void;
};

type PaymentContextProvider = {
  children: ReactNode;
};

export const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<PaymentContextProvider> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const partyId = useNavigationParam('partyId');
  const instanceGuid = useNavigationParam('instanceGuid');

  const contextValue: PaymentContextProps = {
    showLoader: () => {
      setLoading(true);
    },
    hideLoader: () => {
      setLoading(false);
    },
    usePerformPayment: () => {
      usePerformPayActionMutation(partyId, instanceGuid);
    },
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {loading && <Loader reason='Navigating to external payment solution' />}
      {!loading && children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
