import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubmitSigningButton({ node }: { node: LayoutNode<'SigningStatusPanel'> }) {
  const processNext = useProcessNext();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { instanceOwnerPartyId, instanceGuid, taskId } = useParams();

  const { textResourceBindings } = useNodeItem(node, (i) => ({
    textResourceBindings: i.textResourceBindings,
  }));
  const queryClient = useQueryClient();
  const isAnyProcessing = useIsMutating() > 0;

  const { mutate: handleSubmit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (submitButtonRef.current) {
        submitButtonRef.current.disabled = true;
      }
      await processNext();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signeeListQuery(instanceOwnerPartyId, instanceGuid, taskId).queryKey });
    },
    onSettled: () => {
      if (submitButtonRef.current) {
        submitButtonRef.current.disabled = false;
      }
    },
  });

  const submitButtonText = textResourceBindings?.submitButton ?? 'signing.submit_button';

  return (
    <Button
      onClick={() => handleSubmit()}
      size='md'
      color='success'
      disabled={isAnyProcessing}
      isLoading={isSubmitting}
      ref={submitButtonRef}
    >
      <Lang id={submitButtonText} />
    </Button>
  );
}
