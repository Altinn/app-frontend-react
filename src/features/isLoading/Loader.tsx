import React from 'react';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { useLanguage } from 'src/hooks/useLanguage';
import { ProcessTaskType } from 'src/types';

export function Loader() {
  const { lang } = useLanguage();

  return (
    <PresentationComponent
      header={lang('instantiate.starting')}
      type={ProcessTaskType.Unknown}
    >
      <AltinnContentLoader
        width='100%'
        height='400'
      >
        <AltinnContentIconFormData />
      </AltinnContentLoader>
    </PresentationComponent>
  );
}
