import React from 'react';

import Grid from '@material-ui/core/Grid';

import classes from 'src/components/form/Form.module.css';
import { MessageBanner } from 'src/components/form/MessageBanner';
import { ErrorReport } from 'src/components/message/ErrorReport';
import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { extractBottomButtons, hasRequiredFields } from 'src/utils/formLayout';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { getFormHasErrors, missingFieldsInLayoutValidations } from 'src/utils/validation/validation';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { ITextResourceBindings } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const getCustomRequiredValidationMessagesFromNodes = (nodes: LayoutNode[], langTools: IUseLanguage) => {
  const requiredValidationTextResources: string[] = [];
  nodes.forEach((node) => {
    if (node.isRepGroup()) {
      const repGroupValidationTextResources = getCustomRequiredValidationMessagesFromNodes(node.children(), langTools);
      requiredValidationTextResources.push(...repGroupValidationTextResources);
    }
    const textResourceBindings = node.item.textResourceBindings as ITextResourceBindings;
    if (node.item.required && textResourceBindings?.requiredValidation) {
      requiredValidationTextResources.push(langTools.langAsString(textResourceBindings?.requiredValidation));
    }
  });
  return requiredValidationTextResources;
};

export function Form() {
  const nodes = useExprContext();
  const langTools = useLanguage();
  const validations = useAppSelector((state) => state.formValidations.validations);
  const hasErrors = useAppSelector((state) => getFormHasErrors(state.formValidations.validations));
  const page = nodes?.current();
  const pageKey = page?.top.myKey;

  const [mainNodes, errorReportNodes] = React.useMemo(() => {
    if (!page) {
      return [[], []];
    }
    return hasErrors ? extractBottomButtons(page) : [page.children(), []];
  }, [page, hasErrors]);

  const requiredFieldsMissing = React.useMemo(() => {
    if (validations && pageKey && validations[pageKey]) {
      return missingFieldsInLayoutValidations(
        validations[pageKey],
        getCustomRequiredValidationMessagesFromNodes(mainNodes, langTools),
        langTools,
      );
    }

    return false;
  }, [validations, pageKey, mainNodes, langTools]);

  if (!page) {
    return null;
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
        {mainNodes.map((n) => (
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
