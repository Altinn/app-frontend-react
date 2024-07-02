import React, { forwardRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import type { JSX } from 'react';

import { SubFormDef } from 'src/layout/SubForm/config.def.generated';
import { SubFormComponent } from 'src/layout/SubForm/SubFormComponent';
import {
  RedirectBackToMainForm,
  SubFormFirstPage,
  SubFormForm,
  SubFormWrapper,
} from 'src/layout/SubForm/SubFormWrapper';
import { TaskIdStoreProvider } from 'src/layout/Summary2/taskIdStore';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class SubForm extends SubFormDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SubForm'>>(
    function LayoutComponentSubformRender(props, _): JSX.Element | null {
      return <SubFormComponent {...props} />;
    },
  );

  subRouting(node: LayoutNode<'SubForm'>): JSX.Element | null {
    return (
      <TaskIdStoreProvider>
        <Routes>
          <Route
            path=':dataElementId/:subFormPage'
            element={
              <SubFormWrapper node={node}>
                <SubFormForm />
              </SubFormWrapper>
            }
          />
          <Route
            path=':dataElementId'
            element={
              <SubFormWrapper node={node}>
                <SubFormFirstPage />
              </SubFormWrapper>
            }
          />
          <Route
            path='*'
            element={<RedirectBackToMainForm />}
          />
        </Routes>
      </TaskIdStoreProvider>
    );
  }
}
