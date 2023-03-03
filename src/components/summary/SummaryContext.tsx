import React, { createContext } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import type { IFormData } from 'src/features/form/data';
import type { IAttachments } from 'src/shared/resources/attachments';
import type { IOptions, IRepeatingGroups, IRuntimeState, ITextResource } from 'src/types';

// Some values that might be needed for components to look up and present their value as a summary:
// PRIORITY: Do we need this? React components can fetch these themselves from redux
export interface SummaryLookups {
  formData: IFormData;
  attachments: IAttachments;
  options: IOptions;
  textResources: ITextResource[];
  repeatingGroups: IRepeatingGroups | null;
}

export interface ISummaryContext {
  lookups: SummaryLookups;
}

export const SummaryContext = createContext<ISummaryContext | undefined>(undefined);

export const SummaryContextProvider: FC<PropsWithChildren> = (props) => {
  const lookups = useSummaryLookups();

  return <SummaryContext.Provider value={{ lookups }}>{props.children}</SummaryContext.Provider>;
};

const useSummaryLookups = (): SummaryLookups => {
  const formData = useAppSelector((state: IRuntimeState) => state.formData.formData);
  const repeatingGroups = useAppSelector((state: IRuntimeState) => state.formLayout.uiConfig.repeatingGroups);
  const textResources = useAppSelector((state: IRuntimeState) => state.textResources.resources);
  const options = useAppSelector((state: IRuntimeState) => state.optionState.options);
  const attachments = useAppSelector((state: IRuntimeState) => state.attachments.attachments);

  return {
    formData,
    attachments,
    options,
    repeatingGroups,
    textResources,
  };
};
