import { createStore } from 'zustand';

import { ContextNotProvided } from 'src/core/contexts/context';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useLayoutSchemaValidation } from 'src/features/devtools/layoutValidation/useLayoutSchemaValidation';
import { useCurrentLayoutSetId } from 'src/features/form/layoutSets/useCurrentLayoutSetId';
import { useIsDev } from 'src/hooks/useIsDev';
import { useCurrentView } from 'src/hooks/useNavigatePage';

interface Context {
  errors: unknown;
}

function initialCreateStore() {
  return createStore<Context>(() => ({
    errors: undefined,
  }));
}

const { useLaxSelector } = createZustandContext({
  name: 'LayoutValidation',
  required: true,
  initialCreateStore,
});

export const useLayoutValidation = () => {
  const out = useLaxSelector((state) => state.errors);
  return out === ContextNotProvided ? undefined : out;
};

export const useLayoutValidationForPage = () => {
  const layoutSetId = useCurrentLayoutSetId() || 'default';
  const currentView = useCurrentView();

  return useLaxSelector((state) => {
    const layoutSet = state.errors?.[layoutSetId];
    return layoutSet && currentView ? layoutSet[currentView] : undefined;
  });
};

export function Generator() {
  const isDev = useIsDev();
  const panelOpen = useDevToolsStore((s) => s.isOpen);
  const enabled = isDev || panelOpen;

  const _layoutSchemaValidations = useLayoutSchemaValidation(enabled);

  return null;
}
