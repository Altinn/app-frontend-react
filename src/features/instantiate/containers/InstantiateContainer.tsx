import React from 'react';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import { InstantiateValidationError } from 'src/features/instantiate/containers/InstantiateValidationError';
import { MissingRolesError } from 'src/features/instantiate/containers/MissingRolesError';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useInstance } from 'src/hooks/queries/useInstance';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { ProcessTaskType } from 'src/types';
import { changeBodyBackground } from 'src/utils/bodyStyling';
import { HttpStatusCodes } from 'src/utils/network/networking';
import { isAxiosError } from 'src/utils/network/sharedNetworking';

export const InstantiateContainer = () => {
  changeBodyBackground(AltinnAppTheme.altinnPalette.primary.greyLight);
  const instance = useInstance();
  const selectedParty = useAppSelector((state) => state.party.selectedParty);
  const { lang } = useLanguage();

  React.useEffect(() => {
    const shouldCreateInstance = !!selectedParty && !instance.data && !instance.isFetching;
    if (shouldCreateInstance) {
      instance.instantiate(selectedParty.partyId);
    }
  }, [selectedParty, instance]);

  if (isAxiosError(instance.error)) {
    const message = (instance.error.response?.data as any)?.message;
    if (instance.error.response?.status === HttpStatusCodes.Forbidden) {
      if (message) {
        return <InstantiateValidationError message={message} />;
      }
      return <MissingRolesError />;
    }

    return <UnknownError />;
  }

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
};
