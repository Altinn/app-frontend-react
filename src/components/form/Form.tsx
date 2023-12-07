import React from 'react';

import Grid from '@material-ui/core/Grid';

import classes from 'src/components/form/Form.module.css';
import { MessageBanner } from 'src/components/form/MessageBanner';
import { ErrorReport } from 'src/components/message/ErrorReport';
import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { FrontendValidationSource } from 'src/features/validation';
import { useTaskErrors } from 'src/features/validation/validationProvider';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { extractBottomButtons, hasRequiredFields } from 'src/utils/formLayout';
import { useExprContext } from 'src/utils/layout/ExprContext';

export function Form() {
  const { currentPageId } = useNavigatePage();
  const nodes = useExprContext();
  const page = nodes?.all?.()?.[currentPageId];

  const { formErrors, taskErrors } = useTaskErrors();
  const hasErrors = Boolean(formErrors.length) || Boolean(taskErrors.length);
  const requiredFieldsMissing = formErrors.some(
    (error) => error.group === FrontendValidationSource.EmptyField && error.pageKey === currentPageId,
  );

  const [mainNodes, errorReportNodes] = React.useMemo(() => {
    if (!page) {
      return [[], []];
    }
    return hasErrors ? extractBottomButtons(page) : [page.children(), []];
  }, [page, hasErrors]);

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
        {mainNodes?.map((n) => (
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
      </Grid>
      <ReadyForPrint />
    </>
  );
}
