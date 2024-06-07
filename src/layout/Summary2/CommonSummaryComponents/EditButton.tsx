import React from 'react';

import { Button } from '@digdir/designsystemet-react';
import { Edit } from '@navikt/ds-icons';

import { useNavigateToNode } from 'src/features/form/layout/NavigateToNode';
import { useSetReturnToView, useSetSummaryNodeOfOrigin } from 'src/features/form/layout/PageNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type EditButtonProps = {
  componentNode: LayoutNode;
  summaryComponentId: string;
} & React.HTMLAttributes<HTMLButtonElement>;

export function EditButton({ componentNode, summaryComponentId, className }: EditButtonProps) {
  const navigateTo = useNavigateToNode();
  const setReturnToView = useSetReturnToView();
  const setNodeOfOrigin = useSetSummaryNodeOfOrigin();
  const { currentPageId } = useNavigatePage();

  const onClick = async () => {
    if (!componentNode.top.top.myKey) {
      return;
    }

    navigateTo(componentNode, true);
    setReturnToView?.(currentPageId);
    setNodeOfOrigin?.(summaryComponentId);
  };
  return (
    <Button
      onClick={onClick}
      variant='tertiary'
      size='small'
      className={className}
    >
      <Lang id={'general.edit'} />
      <Edit
        fontSize='1rem'
        aria-hidden={true}
      />
    </Button>
  );
}
