import React from 'react';

import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useProcessData } from 'src/hooks/queries/useProcess';
import { useProcessNext } from 'src/hooks/queries/useProcessNext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useCanSubmitForm } from 'src/hooks/useCanSubmitForm';
import { useLanguage } from 'src/hooks/useLanguage';
import { getComponentFromMode } from 'src/layout/Button/getComponentFromMode';
import { SubmitButton } from 'src/layout/Button/SubmitButton';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';

export type IButtonReceivedProps = PropsFromGenericComponent<'Button'>;
export type IButtonProvidedProps =
  | (PropsFromGenericComponent<'Button'> & CompInternal<'Button'>)
  | (PropsFromGenericComponent<'InstantiationButton'> & CompInternal<'InstantiationButton'>);

export const ButtonComponent = ({ node, ...componentProps }: IButtonReceivedProps) => {
  const { id, mode } = node.item;
  const { lang } = useLanguage();
  const props: IButtonProvidedProps = { ...componentProps, ...node.item, node };

  const dispatch = useAppDispatch();
  const currentTaskType = useProcessData()?.currentTask?.altinnTaskType;
  const { actions, write } = useProcessData()?.currentTask || {};
  const { canSubmit, busyWithId, message } = useCanSubmitForm();
  const {} = useProcessNext(node);

  const disabled =
    !canSubmit || (currentTaskType === 'data' && !write) || (currentTaskType === 'confirmation' && !actions?.confirm);

  const parentIsPage = node.parent instanceof LayoutPage;

  if (mode && !(mode === 'save' || mode === 'submit')) {
    const GenericButton = getComponentFromMode(mode);
    if (!GenericButton) {
      return null;
    }

    return (
      <div style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}>
        <GenericButton {...props}>{lang(node.item.textResourceBindings?.title)}</GenericButton>
      </div>
    );
  }

  const submitTask = ({ componentId }: { componentId: string }) => {
    if (!disabled) {
      const { org, app, instanceId } = window;
      if (currentTaskType === 'data') {
        dispatch(
          FormDataActions.submit({
            url: `${window.location.origin}/${org}/${app}/api/${instanceId}`,
            componentId,
          }),
        );
      } else if (currentTaskType === 'confirmation') {
        dispatch(ProcessActions.complete({ componentId, action: 'confirm' }));
      }
    }
  };
  return (
    <div style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}>
      <SubmitButton
        onClick={() => submitTask({ componentId: id })}
        id={id}
        busyWithId={busyWithId}
        disabled={disabled}
        message={message}
      >
        {lang(node.item.textResourceBindings?.title)}
      </SubmitButton>
    </div>
  );
};
