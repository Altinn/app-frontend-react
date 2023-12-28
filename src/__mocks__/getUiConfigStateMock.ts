import type { IUiConfig } from 'src/types';

export const getUiConfigStateMock = (customStates?: Partial<IUiConfig>): IUiConfig => ({
  focus: null,
  hiddenFields: [],
  excludePageFromPdf: [],
  excludeComponentFromPdf: [],
  ...customStates,
});
