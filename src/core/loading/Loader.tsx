import React from 'react';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { useLanguage } from 'src/features/language/useLanguage';
import { ProcessTaskType } from 'src/types';

interface LoaderProps {
  reason: string; // The reason is used by developers to identify the reason for the loader
  details?: string;
}

export function Loader({ reason, details }: LoaderProps) {
  const { lang } = useLanguage();

  return (
    <PresentationComponent
      header={lang('instantiate.starting')}
      type={ProcessTaskType.Unknown}
      renderNavBar={false}
    >
      <AltinnContentLoader
        width='100%'
        height='400'
        reason={reason}
        details={details}
      >
        <AltinnContentIconFormData />
      </AltinnContentLoader>
    </PresentationComponent>
  );
}
