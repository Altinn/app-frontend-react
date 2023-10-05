import React from 'react';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useInstantiation } from 'src/features/instantiate/InstantiationContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { WrappedButton } from 'src/layout/Button/WrappedButton';
import { mapFormData } from 'src/utils/databindings';
import type { IInstantiationButtonComponentProvidedProps } from 'src/layout/InstantiationButton/InstantiationButtonComponent';

type Props = Omit<React.PropsWithChildren<IInstantiationButtonComponentProvidedProps>, 'text'>;

export const InstantiationButton = ({ children, ...props }: Props) => {
  const dispatch = useAppDispatch();
  const instantiation = useInstantiation();
  const formData = useAppSelector((state) => state.formData.formData);
  const party = useAppSelector((state) => state.party.selectedParty);

  const instantiate = () => {
    const prefill = mapFormData(formData, props.mapping);
    instantiation.instantiateWithPrefill(props.node, {
      prefill,
      instanceOwner: {
        partyId: party?.partyId.toString(),
      },
    });
  };
  const busyWithId = instantiation.isLoading ? props.id : '';

  React.useEffect(() => {
    if (instantiation.lastResult) {
      dispatch(AttachmentActions.mapAttachments());
    }
  }, [instantiation.lastResult, dispatch]);

  React.useEffect(() => {
    if (instantiation.error) {
      throw new Error('Something went wrong trying to start new instance');
    }
  }, [instantiation.error]);

  return (
    <WrappedButton
      {...props}
      onClick={instantiate}
      busyWithId={busyWithId}
    >
      {children}
    </WrappedButton>
  );
};
