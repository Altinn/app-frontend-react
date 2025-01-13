import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { AxiosError } from 'axios';

import { Loader } from 'src/core/loading/Loader';
import { usePerformPayActionMutation } from 'src/features/payment/usePerformPaymentMutation';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';

type PaymentContextProps = {
  showLoader: () => void;
  hideLoader: () => void;
  performPayment: () => void;
  paymentError: AxiosError | null;
};

type PaymentContextProvider = {
  children: ReactNode;
};

export const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<PaymentContextProvider> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const partyId = useNavigationParam('partyId');
  const instanceGuid = useNavigationParam('instanceGuid');
  const { mutate, error } = usePerformPayActionMutation(partyId, instanceGuid);

  const contextValue: PaymentContextProps = {
    showLoader: () => {
      setLoading(true);
    },
    hideLoader: () => {
      setLoading(false);
    },
    performPayment: () => {
      setLoading(true);
      mutate();
    },
    paymentError: error,
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {loading ? <Loader reason='Navigating to external payment solution' /> : children}
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
