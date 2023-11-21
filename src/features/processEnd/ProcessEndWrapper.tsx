import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Confirm } from 'src/features/processEnd/confirm/containers/Confirm';
import { Feedback } from 'src/features/processEnd/feedback/Feedback';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';

export function ProcessEndWrapper() {
  return (
    <Routes>
      <Route
        path='confirmation'
        element={<Confirm />}
      />
      <Route
        path='feedback'
        element={<Feedback />}
      />
      <Route
        path='receipt'
        element={<ReceiptContainer />}
      />
    </Routes>
  );
}
