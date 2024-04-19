import React from 'react';

import { Fieldset, ToggleGroup } from '@digdir/designsystemet-react';

import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useComponentRefs } from 'src/features/devtools/hooks/useComponentRefs';
import { useIsInFormContext } from 'src/features/form/FormContext';
import { Hidden, useNodes } from 'src/utils/layout/NodesContext';
import type { IDevToolsState } from 'src/features/devtools/data/types';

const pseudoHiddenCssFilter = 'contrast(0.75)';

export function DevHiddenFunctionality() {
  const isInForm = useIsInFormContext();
  if (!isInForm) {
    return null;
  }

  return <InnerDevHiddenFunctionality />;
}

function InnerDevHiddenFunctionality() {
  const state = useDevToolsStore((state) => state.hiddenComponents);
  const setShowHiddenComponents = useDevToolsStore((state) => state.actions.setShowHiddenComponents);

  return (
    <Fieldset legend='Skjulte komponenter'>
      <MarkHiddenComponents />
      <div>
        <ToggleGroup
          size='small'
          onChange={(selectedValue) => setShowHiddenComponents(selectedValue as IDevToolsState['hiddenComponents'])}
          value={state}
        >
          <ToggleGroup.Item value='hide'>Skjul</ToggleGroup.Item>
          <ToggleGroup.Item value='disabled'>Utgrået</ToggleGroup.Item>
          <ToggleGroup.Item value='show'>Vis</ToggleGroup.Item>
        </ToggleGroup>
      </div>
    </Fieldset>
  );
}

function MarkHiddenComponents() {
  const state = useDevToolsStore((state) => state.hiddenComponents);
  const hierarchy = useNodes();
  const isHiddenSelector = Hidden.useIsHiddenSelector();

  useComponentRefs({
    callback: (id, ref) => {
      const node = hierarchy?.findById(id);
      if (node) {
        if (ref.style.filter === pseudoHiddenCssFilter && state !== 'disabled') {
          ref.style.filter = '';
        } else if (state === 'disabled' && isHiddenSelector({ node, options: { respectDevTools: false } })) {
          ref.style.filter = pseudoHiddenCssFilter;
        }
      }
    },
    cleanupCallback: (_, ref) => {
      if (ref.style.filter === pseudoHiddenCssFilter) {
        ref.style.filter = '';
      }
    },
  });

  return null;
}
