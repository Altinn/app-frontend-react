import React from 'react';

import { useLaxProcessData } from 'src/features/instance/useProcess';
import { useProcessNext } from 'src/features/instance/useProcessNext';
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
  const { mode } = node.item;
  const { lang } = useLanguage();
  const props: IButtonProvidedProps = { ...componentProps, ...node.item, node };

  const currentTaskType = useLaxProcessData()?.currentTask?.altinnTaskType;
  const { actions, write } = useLaxProcessData()?.currentTask || {};
  const { canSubmit, busyWithId, message } = useCanSubmitForm();
  const { mutate: processNext } = useProcessNext(node.item.id);

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

  const submitTask = () => {
    if (!disabled) {
      if (currentTaskType === 'data') {
        processNext({});
      } else if (currentTaskType === 'confirmation') {
        processNext({ action: 'confirm' });
      }
    }
  };
  return (
    <div style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}>
      <SubmitButton
        nodeId={node.item.id}
        onClick={() => submitTask()}
        busyWithId={busyWithId}
        disabled={disabled}
        message={message}
      >
        {lang(node.item.textResourceBindings?.title)}
      </SubmitButton>
    </div>
  );
};
