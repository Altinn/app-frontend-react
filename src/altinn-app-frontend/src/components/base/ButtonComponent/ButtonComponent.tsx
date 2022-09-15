import React from 'react';

import { useAppDispatch, useAppSelector } from 'src/common/hooks';
import { SaveButton } from 'src/components/base/ButtonComponent/SaveButton';
import { SubmitButton } from 'src/components/base/ButtonComponent/SubmitButton';
import { FormDataActions } from 'src/features/form/data/formDataSlice';
import type { IComponentProps } from 'src/components';
import type { ILayoutCompButton } from 'src/features/form/layout';
import type { IAltinnWindow } from 'src/types';

export interface IButtonProvidedProps
  extends IComponentProps,
    ILayoutCompButton {
  id: string;
  disabled: boolean;
}

const btnGroupStyle = {
  marginTop: '3.6rem',
  marginBottom: '0',
};

const rowStyle = {
  marginLeft: '0',
};

export function ButtonComponent({ id, text, language }: IButtonProvidedProps) {
  const dispatch = useAppDispatch();
  const autoSave = useAppSelector(
    (state) => state.formLayout.uiConfig.autoSave,
  );
  const isSubmitting = useAppSelector((state) => state.formData.isSubmitting);
  const isSaving = useAppSelector((state) => state.formData.isSaving);
  const ignoreWarnings = useAppSelector(
    (state) => state.formData.ignoreWarnings,
  );

  const saveFormData = () => {
    dispatch(FormDataActions.submit({}));
  };

  const submitForm = () => {
    const { org, app, instanceId } = window as Window as IAltinnWindow;
    dispatch(
      FormDataActions.submit({
        url: `${window.location.origin}/${org}/${app}/api/${instanceId}`,
        apiMode: 'Complete',
        stopWithWarnings: !ignoreWarnings,
      }),
    );
  };
  const busyWithId = (isSaving && 'saveBtn') || (isSubmitting && id) || '';
  return (
    <div className='container pl-0'>
      <div
        className='a-btn-group'
        style={btnGroupStyle}
      >
        <div
          className='row'
          style={rowStyle}
        >
          {autoSave === false && ( // can this be removed from the component?
            <SaveButton
              onClick={saveFormData}
              id='saveBtn'
              busyWithId={busyWithId}
              language={language}
            >
              Lagre
            </SaveButton>
          )}
          <SubmitButton
            onClick={submitForm}
            id={id}
            language={language}
            busyWithId={busyWithId}
          >
            {text}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}
