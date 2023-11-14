import React from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import classes from 'src/components/form/Form.module.css';
import { MessageBanner } from 'src/components/form/MessageBanner';
import { ErrorReport } from 'src/components/message/ErrorReport';
import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { getFieldName } from 'src/utils/formComponentUtils';
import { extractBottomButtons, hasRequiredFields } from 'src/utils/formLayout';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { getFormHasErrors, missingFieldsInLayoutValidations } from 'src/utils/validation/validation';

export function Form() {
  const nodes = useExprContext();
  const langTools = useLanguage();
  const { currentPageId, navigateToStart, isValidPageId } = useNavigatePage();
  const validations = useAppSelector((state) => state.formValidations.validations);
  const page = nodes?.current();
  const pageKey = page?.top.myKey;

  const requiredFieldsMissing = React.useMemo(() => {
    if (validations && pageKey && validations[pageKey]) {
      const requiredValidationTextResources: string[] = [];
      page.flat(true).forEach((node) => {
        const trb = node.item.textResourceBindings;
        const fieldName = getFieldName(trb, langTools);
        if ('required' in node.item && node.item.required && trb && 'requiredValidation' in trb) {
          requiredValidationTextResources.push(langTools.langAsString(trb.requiredValidation, [fieldName]));
        }
      });

      return missingFieldsInLayoutValidations(validations[pageKey], requiredValidationTextResources, langTools);
    }

    return false;
  }, [validations, pageKey, page, langTools]);

  if (!page) {
    return null;
  }

  if (!currentPageId || !isValidPageId(currentPageId)) {
    navigateToStart();
  }

  return (
    <>
      {page && hasRequiredFields(page) && (
        <MessageBanner
          error={requiredFieldsMissing}
          messageKey={'form_filler.required_description'}
        />
      )}
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        <Routes>
          <Route
            path=':pageKey'
            element={<LayoutRoutePage />}
          />
        </Routes>
      </Grid>
      <ReadyForPrint />
    </>
  );
}

export function LayoutRoutePage() {
  const match = useMatch('/instance/:partyId/:instanceGuid/:pageKey');
  const nodes = useExprContext();
  const layoutPage = match?.params.pageKey ? nodes?.all?.()?.[match.params.pageKey] : undefined;

  const hasErrors = useAppSelector((state) => getFormHasErrors(state.formValidations.validations));

  const [_, errorReportNodes] = React.useMemo(() => {
    if (!layoutPage) {
      return [[], []];
    }
    return hasErrors ? extractBottomButtons(layoutPage) : [layoutPage.children(), []];
  }, [layoutPage, hasErrors]);

  return (
    <>
      {layoutPage?.children().map((n) => (
        <GenericComponent
          key={n.item.id}
          node={n}
        />
      ))}
      <Grid
        item={true}
        xs={12}
        aria-live='polite'
        className={classes.errorReport}
      >
        <ErrorReport nodes={errorReportNodes} />
      </Grid>
    </>
  );
}
