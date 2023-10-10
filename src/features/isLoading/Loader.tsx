import React from 'react';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { useLanguage } from 'src/hooks/useLanguage';
import { ProcessTaskType } from 'src/types';

interface LoaderProps {
  reason: string; // The reason is used by developers to identify the reason for the loader
}

export function Loader({ reason }: LoaderProps) {
  const { lang } = useLanguage();

  return (
    <PresentationComponent
      header={lang('instantiate.starting')}
      type={ProcessTaskType.Unknown}
    >
      <div
        data-testid='loader'
        data-reason={reason}
      >
        <AltinnContentLoader
          width='100%'
          height='400'
        >
          <AltinnContentIconFormData />
        </AltinnContentLoader>
      </div>
    </PresentationComponent>
  );
}
