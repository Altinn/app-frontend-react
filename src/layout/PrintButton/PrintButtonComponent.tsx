import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export const PrintButtonComponent = ({ node }: PropsFromGenericComponent<'PrintButton'>) => {
  const { textResourceBindings } = useNodeItem(node);
  const parentIsPage = node.parent instanceof LayoutPage;

  return (
    <ComponentStructureWrapper node={node}>
      <Button
        style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}
        variant='secondary'
        color='first'
        onClick={window.print}
      >
        <Lang id={textResourceBindings?.title ?? 'general.print_button_text'} />
      </Button>
    </ComponentStructureWrapper>
  );
};
