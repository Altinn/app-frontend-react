import React from 'react';

import Grid from '@material-ui/core/Grid';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { ErrorReport } from 'src/components/message/ErrorReport';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { MessageBanner } from 'src/features/form/components/MessageBanner';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { GroupContainer } from 'src/features/form/containers/GroupContainer';
import { GenericComponent } from 'src/layout/GenericComponent';
import { PanelGroupContainer } from 'src/layout/Panel/PanelGroupContainer';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import { extractBottomButtons, hasRequiredFields } from 'src/utils/formLayout';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { getFormHasErrors, missingFieldsInLayoutValidations } from 'src/utils/validation/validation';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export function renderLayoutComponent(node: LayoutNode) {
  if (node.item.type === 'Group') {
    const isRepeatingGroup = node.item.maxCount && node.item.maxCount > 1;
    if (isRepeatingGroup) {
      return (
        <GroupContainer
          id={node.item.id}
          key={node.item.id}
        />
      );
    }

    if (node.item.panel) {
      return (
        <PanelGroupContainer
          key={node.item.id}
          id={node.item.id}
        />
      );
    }

    // Treat as regular components
    return (
      <DisplayGroupContainer
        key={node.item.id}
        id={node.item.id}
        renderLayoutComponent={renderLayoutComponent}
      />
    );
  }

  if (node.item.type === 'Summary') {
    return (
      <SummaryComponent
        key={node.item.id}
        id={node.item.id}
      />
    );
  }

  return (
    <GenericComponent
      key={node.item.id}
      id={node.item.id}
    />
  );
}

export function Form() {
  const nodes = useExprContext();
  const language = useAppSelector((state) => state.language.language);
  const validations = useAppSelector((state) => state.formValidations.validations);
  const hasErrors = useAppSelector((state) => getFormHasErrors(state.formValidations.validations));
  const page = nodes?.current();
  const pageKey = page?.top.myKey;

  const requiredFieldsMissing = React.useMemo(() => {
    if (validations && pageKey && validations[pageKey] && language) {
      return missingFieldsInLayoutValidations(validations[pageKey], language);
    }

    return false;
  }, [pageKey, language, validations]);

  const [mainNodes, errorReportNodes] = React.useMemo(() => {
    if (!page) {
      return [[], []];
    }
    return hasErrors ? extractBottomButtons(page) : [page.children(), []];
  }, [page, hasErrors]);

  if (!language || !page) {
    return null;
  }

  return (
    <>
      {page && hasRequiredFields(page) && (
        <MessageBanner
          language={language}
          error={requiredFieldsMissing}
          messageKey={'form_filler.required_description'}
        />
      )}
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        {mainNodes.map((n) => renderLayoutComponent(n))}
        <Grid
          item={true}
          xs={12}
          aria-live='polite'
        >
          <ErrorReport nodes={errorReportNodes} />
        </Grid>
      </Grid>
      <ReadyForPrint />
    </>
  );
}
