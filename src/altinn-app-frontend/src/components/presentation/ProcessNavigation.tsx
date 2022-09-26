import React, { useState } from 'react';

import { ConfirmButton } from 'src/features/confirm/components/ConfirmButton';

export const ProcessNavigation = ({ language }) => {
  const [busyWithId, setBusyWithId] = useState<string>('');
  const confirmButtonId = 'confirm-button';

  return (
    <div className={'process-navigation'}>
      <ConfirmButton
        busyWithId={busyWithId}
        setBusyWithId={setBusyWithId}
        language={language}
        id={confirmButtonId}
      />
    </div>
  );
};
