import React from 'react';
import { Navigate } from 'react-router-dom';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useInstance } from 'src/hooks/queries/useInstance';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { WrappedButton } from 'src/layout/Button/WrappedButton';
import { mapFormData } from 'src/utils/databindings';
import type { IInstantiationButtonComponentProvidedProps } from 'src/layout/InstantiationButton/InstantiationButtonComponent';

type Props = Omit<React.PropsWithChildren<IInstantiationButtonComponentProvidedProps>, 'text'>;

export const InstantiationButton = ({ children, ...props }: Props) => {
  const dispatch = useAppDispatch();
  const { instantiateWithPrefillMutation } = useInstance();
  const { isSuccess, data, isLoading, isError, mutate: instantiateWithPrefill } = instantiateWithPrefillMutation;
  const formData = useAppSelector((state) => state.formData.formData);
  const party = useAppSelector((state) => state.party.selectedParty);

  const instantiate = () => {
    const prefill = mapFormData(formData, props.mapping);
    instantiateWithPrefill({
      prefill,
      instanceOwner: {
        partyId: party?.partyId.toString(),
      },
    });
  };
  const busyWithId = props.busyWithId || isLoading ? props.id : '';

  React.useEffect(() => {
    if (isSuccess && data) {
      dispatch(AttachmentActions.mapAttachments());
    }
  }, [isSuccess, data, dispatch]);

  React.useEffect(() => {
    if (isError) {
      throw new Error('something went wrong trying to start new instance');
    }
  }, [isError]);

  if (data?.id) {
    return <Navigate to={`/instance/${data.id}`} />;
  }

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
