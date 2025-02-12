import React from 'react';

import { Fieldset } from '@digdir/designsystemet-react';

import { LanguageSelector } from 'src/components/presentation/LanguageSelector';

export const DevLanguageSelector = () => (
  <Fieldset style={{ width: 250 }}>
    <Fieldset.Legend>Språk</Fieldset.Legend>
    <LanguageSelector hideLabel={true} />
  </Fieldset>
);
