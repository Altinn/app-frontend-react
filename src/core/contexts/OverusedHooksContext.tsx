import { createHookContext } from 'src/core/contexts/hookContext';
import { useProcessQueryActual } from 'src/features/instance/useProcessQuery';

const { Provider, hooks } = createHookContext({
  useProcessQuery: () => useProcessQueryActual(),
});

export const OverusedHooks = {
  Provider,
  useProcessQuery: hooks.useProcessQuery,
};
