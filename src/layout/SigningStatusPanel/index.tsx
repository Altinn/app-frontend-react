import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningStatusPanelDef } from 'src/layout/SigningStatusPanel/config.def.generated';
import { SigningStatusPanelComponent } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import { ProcessTaskType } from 'src/types';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { PropsFromGenericComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';

export class SigningStatusPanel extends SigningStatusPanelDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SigningStatusPanel'>>(
    function SigningStatusPanelComponentRender(props, _): JSX.Element | null {
      return <SigningStatusPanelComponent {...props} />;
    },
  );

  renderLayoutValidators(_props: NodeValidationProps<'SigningStatusPanel'>): JSX.Element | null {
    const taskType = useTaskTypeFromBackend();
    const addError = NodesInternal.useAddError();
    const { langAsString } = useLanguage();

    if (taskType !== ProcessTaskType.Signing) {
      const error = langAsString('signing.wrong_task_error', ['SigningStatusPanel']);
      addError(error, _props.node);
      window.logErrorOnce(`Validation error for '${_props.node.id}': ${error}`);
    }

    return null;
  }
}
