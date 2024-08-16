import React from 'react';

import { Button } from '@digdir/designsystemet-react';
import { Edit } from '@navikt/ds-icons';

import { useSummaryStore } from 'src/core/contexts/summaryStoreContext';
import { useNavigateToNode } from 'src/features/form/layout/NavigateToNode';
import { useSetReturnToView, useSetSummaryNodeOfOrigin } from 'src/features/form/layout/PageNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { usePdfModeActive } from 'src/features/pdf/PDFWrapper';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import type { NavigationResult } from 'src/features/form/layout/NavigateToNode';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type EditButtonProps = {
  componentNode: LayoutNode;
  summaryComponentId: string;
  navigationOverride?: (() => Promise<NavigationResult> | void) | null;
} & React.HTMLAttributes<HTMLButtonElement>;

export function EditButton({
  componentNode,
  summaryComponentId,
  className,
  navigationOverride = null,
}: EditButtonProps) {
  const navigateTo = useNavigateToNode();
  const { langAsString } = useLanguage();
  const setReturnToView = useSetReturnToView();
  const setNodeOfOrigin = useSetSummaryNodeOfOrigin();
  const { currentPageId } = useNavigatePage();
  const pdfModeActive = usePdfModeActive();
  const isMobile = useIsMobile();

  const { overriddenTaskId } = useSummaryStore(({ overriddenTaskId }) => ({
    overriddenTaskId,
  }));

  if (pdfModeActive || (overriddenTaskId && overriddenTaskId?.length > 0)) {
    return null;
  }

  const accessibleTitle =
    componentNode?.item?.textResourceBindings && 'title' in componentNode.item.textResourceBindings
      ? langAsString(componentNode.item.textResourceBindings?.title)
      : '';
  const onChangeClick = async () => {
    if (!componentNode.top.top.myKey) {
      return;
    }

    if (navigationOverride) {
      navigationOverride();
    } else {
      navigateTo(componentNode, true);
    }

    setReturnToView?.(currentPageId);
    setNodeOfOrigin?.(summaryComponentId);
  };
  return (
    <Button
      onClick={onChangeClick}
      variant='tertiary'
      size='small'
      className={className}
    >
      {!isMobile && <Lang id={'general.edit'} />}
      <Edit
        fontSize='1rem'
        aria-hidden={true}
        title={`${langAsString('form_filler.summary_item_change')} ${accessibleTitle}`}
      />
    </Button>
  );
}
