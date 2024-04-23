import { getApplicationSettingsMock } from 'src/__mocks__/getApplicationSettingsMock';
import { staticUseLanguageForTests } from 'src/features/language/useLanguage';
import type { HierarchyDataSources } from 'src/layout/layout';

export function getHierarchyDataSourcesMock(): HierarchyDataSources {
  return {
    formDataSelector: () => null,
    attachments: {},
    layoutSettings: { pages: { order: [] } },
    pageNavigationConfigSelectors: {
      selectCurrentView: () => 'default',
      selectOrder: () => ['default'],
      selectHiddenExpr: () => undefined,
    },
    options: () => [],
    applicationSettings: getApplicationSettingsMock(),
    instanceDataSources: {} as any,
    authContext: null,
    devToolsIsOpen: false,
    devToolsHiddenComponents: 'hide',
    langToolsRef: { current: staticUseLanguageForTests() },
    currentLanguage: 'nb',
  };
}
