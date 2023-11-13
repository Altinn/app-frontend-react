import React from 'react';
import type { JSX } from 'react';

import { addValidation, FrontendValidationSource, initializeComponentValidations } from 'src/features/validation';
import { FileUploadDef } from 'src/layout/FileUpload/config.def.generated';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import { AttachmentSummaryComponent } from 'src/layout/FileUpload/Summary/AttachmentSummaryComponent';
import { getUploaderSummaryData } from 'src/layout/FileUpload/Summary/summary';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { attachmentsValid } from 'src/utils/validation/validation';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type { FormValidations } from 'src/features/validation/types';
import type { ComponentValidation, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationContext } from 'src/utils/validation/types';

export class FileUpload extends FileUploadDef implements ComponentValidation {
  render(props: PropsFromGenericComponent<'FileUpload'>): JSX.Element | null {
    return <FileUploadComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  getDisplayData(node: LayoutNode<'FileUpload'>, { formData, attachments }): string {
    return getUploaderSummaryData(node, formData, attachments)
      .map((a) => a.name)
      .join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'FileUpload'>): JSX.Element | null {
    return <AttachmentSummaryComponent targetNode={targetNode} />;
  }

  // This component does not have empty field validation, so has to override its inherited method
  runEmptyFieldValidation(): FormValidations {
    return {};
  }

  runComponentValidation(
    node: LayoutNode<'FileUpload'>,
    { attachments, langTools }: IValidationContext,
    _overrideFormData?: IFormData,
  ): FormValidations {
    const formValidations: FormValidations = {};

    /**
     * Initialize validation group for component,
     * this must be done so we remove existing validations in case they are fixed.
     */
    initializeComponentValidations(formValidations, node.item.id, FrontendValidationSource.Component);

    if (!attachmentsValid(attachments, node.item)) {
      const message = `${langTools.langAsString('form_filler.file_uploader_validation_error_file_number_1')} ${
        node.item.minNumberOfAttachments
      } ${langTools.langAsString('form_filler.file_uploader_validation_error_file_number_2')}`;

      addValidation(formValidations, {
        message,
        severity: 'errors',
        group: FrontendValidationSource.Component,
        componentId: node.item.id,
      });
    }

    return formValidations;
  }

  isDataModelBindingsRequired(node: LayoutNode<'FileUpload'>): boolean {
    // Data model bindings are only required when the component is defined inside a repeating group
    return !(node.parent instanceof LayoutPage) && node.parent.isType('Group') && node.parent.isRepGroup();
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'FileUpload'>): string[] {
    const { node } = ctx;
    const { dataModelBindings } = node.item;
    const isRequired = this.isDataModelBindingsRequired(node);
    const hasBinding = dataModelBindings && ('simpleBinding' in dataModelBindings || 'list' in dataModelBindings);

    if (!isRequired && !hasBinding) {
      return [];
    }
    if (isRequired && !hasBinding) {
      return [
        `En simpleBinding, eller list-datamodellbinding, er påkrevd for denne komponenten når den brukes ` +
          `i en repeterende gruppe, men dette mangler i layout-konfigurasjonen.`,
      ];
    }

    const simpleBinding =
      dataModelBindings && 'simpleBinding' in dataModelBindings ? dataModelBindings.simpleBinding : undefined;
    const listBinding = dataModelBindings && 'list' in dataModelBindings ? dataModelBindings.list : undefined;

    if (simpleBinding) {
      return this.validateDataModelBindingsSimple(ctx);
    }

    if (listBinding) {
      return this.validateDataModelBindingsList(ctx);
    }

    return [];
  }
}
