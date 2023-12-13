import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { staticUseLanguageForTests } from 'src/features/language/useLanguage';
import type { HierarchyDataSources } from 'src/layout/layout';

export function getHierarchyDataSourcesMock(): HierarchyDataSources {
  return {
    formData: {},
    attachments: {},
    uiConfig: {} as any,
    pageNavigationConfig: { hidden: [], hiddenExpr: {} },
    options: {},
    applicationSettings: {} as any,
    instanceDataSources: {} as any,
    hiddenFields: new Set(),
    authContext: null,
    devTools: getInitialStateMock().devTools,
    langTools: staticUseLanguageForTests(),
    currentLanguage: 'nb',
  };
}
