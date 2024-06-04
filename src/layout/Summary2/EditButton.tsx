import React from 'react';

import { Button } from '@digdir/designsystemet-react';

import { useNavigateToNode } from 'src/features/form/layout/NavigateToNode';
import { useSetReturnToView, useSetSummaryNodeOfOrigin } from 'src/features/form/layout/PageNavigationContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface EditButtonProps {
  componentNode: LayoutNode;
  summaryComponentId: string;
}

export function EditButton({ componentNode, summaryComponentId }: EditButtonProps) {
  const navigateTo = useNavigateToNode();
  const setReturnToView = useSetReturnToView();
  const setNodeOfOrigin = useSetSummaryNodeOfOrigin();
  const { currentPageId } = useNavigatePage();

  const onChangeClick = async () => {
    if (!componentNode.top.top.myKey) {
      return;
    }

    navigateTo(componentNode, true);
    setReturnToView?.(currentPageId);
    setNodeOfOrigin?.(summaryComponentId);
  };
  return <Button onClick={onChangeClick}>Edit</Button>;
}
