import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubmitSigningButton({ node }: { node: LayoutNode<'SigningStatusPanel'> }) {
  const { next, busy } = useProcessNavigation() ?? {};
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();

  const { nodeId, textResourceBindings } = useNodeItem(node, (i) => ({
    nodeId: i.id,
    textResourceBindings: i.textResourceBindings,
  }));
  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (submitButtonRef.current) {
      submitButtonRef.current.disabled = true;
    }
    await next?.({ nodeId });
    queryClient.invalidateQueries({ queryKey: signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId).queryKey });

    if (submitButtonRef.current) {
      submitButtonRef.current.disabled = false;
    }
  }

  const submitButtonText = textResourceBindings?.submitButton ?? 'signing.submit_button';

  return (
    <Button
      onClick={handleSubmit}
      size='md'
      color='success'
      disabled={busy}
      isLoading={busy}
      ref={submitButtonRef}
    >
      <Lang id={submitButtonText} />
    </Button>
  );
}
