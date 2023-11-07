import React from 'react';

import { addValidationToField, FrontendValidationSource, initializeValidationField } from 'src/features/validation';
import { FileUploadComponent } from 'src/layout/FileUpload/FileUploadComponent';
import { AttachmentSummaryComponent } from 'src/layout/FileUpload/Summary/AttachmentSummaryComponent';
import { getUploaderSummaryData } from 'src/layout/FileUpload/Summary/summary';
import { FileUploadWithTagDef } from 'src/layout/FileUploadWithTag/config.def.generated';
import { AsciiUnitSeparator } from 'src/utils/attachment';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { attachmentIsMissingTag, attachmentsValid } from 'src/utils/validation/validation';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { IFormData } from 'src/features/formData';
import type { FieldValidations } from 'src/features/validation/types';
import type { ComponentValidation, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IValidationContext } from 'src/utils/validation/types';

export class FileUploadWithTag extends FileUploadWithTagDef implements ComponentValidation {
  render(props: PropsFromGenericComponent<'FileUploadWithTag'>): JSX.Element | null {
    return <FileUploadComponent {...props} />;
  }

  renderDefaultValidations(): boolean {
    return false;
  }

  getDisplayData(node: LayoutNode<'FileUploadWithTag'>, { formData, attachments }): string {
    return getUploaderSummaryData(node, formData, attachments)
      .map((a) => a.name)
      .join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'FileUploadWithTag'>): JSX.Element | null {
    return <AttachmentSummaryComponent targetNode={targetNode} />;
  }

  // This component does not have empty field validation, so has to override its inherited method
  runEmptyFieldValidation(): FieldValidations {
    return {};
  }

  runComponentValidation(
    node: LayoutNode<'FileUploadWithTag'>,
    { attachments, langTools }: IValidationContext,
    _overrideFormData?: IFormData,
  ): FieldValidations {
    const fieldValidations: FieldValidations = {};

    /**
     * Component id will be used as field value
     * TODO(Validation): Consider adding component level validations?
     */
    const field = node.item.id;

    /**
     * Initialize validation group for field,
     * this must be done for all fields that will be validated
     * so we remove existing validations in case they are fixed.
     */
    initializeValidationField(fieldValidations, field, FrontendValidationSource.Component);

    if (attachmentsValid(attachments, node.item)) {
      const missingTagAttachments = attachments[node.item.id]
        ?.filter((attachment) => attachmentIsMissingTag(attachment))
        .map((attachment) => attachment.id);

      if (missingTagAttachments?.length > 0) {
        missingTagAttachments.forEach((missingId) => {
          const message = `${
            missingId +
            AsciiUnitSeparator +
            langTools.langAsString('form_filler.file_uploader_validation_error_no_chosen_tag')
          } ${langTools.langAsString(node.item.textResourceBindings?.tagTitle).toLowerCase()}.`;

          addValidationToField(fieldValidations, {
            message,
            severity: 'errors',
            field,
            group: FrontendValidationSource.Component,
          });
        });
      }
    } else {
      const message = `${langTools.langAsString('form_filler.file_uploader_validation_error_file_number_1')} ${
        node.item.minNumberOfAttachments
      } ${langTools.langAsString('form_filler.file_uploader_validation_error_file_number_2')}`;

      addValidationToField(fieldValidations, {
        message,
        severity: 'errors',
        field,
        group: FrontendValidationSource.Component,
      });
    }
    return fieldValidations;
  }

  isDataModelBindingsRequired(node: LayoutNode<'FileUploadWithTag'>): boolean {
    // Data model bindings are only required when the component is defined inside a repeating group
    return !(node.parent instanceof LayoutPage) && node.parent.isType('Group') && node.parent.isRepGroup();
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'FileUploadWithTag'>): string[] {
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
