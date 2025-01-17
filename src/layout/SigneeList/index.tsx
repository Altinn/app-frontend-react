import { forwardRef, type JSX } from 'react';
import React from 'react';

import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigneeListDef } from 'src/layout/SigneeList/config.def.generated';
import { SigneeListComponent } from 'src/layout/SigneeList/SigneeListComponent';
import { ProcessTaskType } from 'src/types';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { PropsFromGenericComponent } from 'src/layout';
import type { NodeValidationProps } from 'src/layout/layout';

export class SigneeList extends SigneeListDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SigneeList'>>(
    function SigneeListComponentRender(props, _): JSX.Element | null {
      return <SigneeListComponent {...props} />;
    },
  );

  renderLayoutValidators(_props: NodeValidationProps<'SigneeList'>): JSX.Element | null {
    const taskType = useTaskTypeFromBackend();
    const addError = NodesInternal.useAddError();
    const { langAsString } = useLanguage();

    if (taskType !== ProcessTaskType.Signing) {
      const error = langAsString('signing.wrong_task_error', ['SigneeList']);
      addError(error, _props.node);
      window.logErrorOnce(`Validation error for '${_props.node.id}': ${error}`);
    }

    return null;
  }
}
