import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import dot from 'dot-object';

import type { PropsFromGenericComponent } from '..';

import { FrontendValidationSource, ValidationMask } from 'src/features/validation';
import { LikertDef } from 'src/layout/Likert/config.def.generated';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { LikertSummary } from 'src/layout/Likert/Summary/LikertSummary';
import { getLikertRows, questionToAnswerBinding } from 'src/layout/Likert/useLikertRows';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { TextReference } from 'src/features/language/useLanguage';
import type { ComponentValidation, ValidationDataSources } from 'src/features/validation';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Likert extends LikertDef {
  directRender(): boolean {
    return true;
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Likert'>>(
    function LayoutComponentLikertRender(props, ref): JSX.Element | null {
      return (
        <LikertComponent
          {...props}
          ref={ref}
        />
      );
    },
  );

  renderSummary({
    onChangeClick,
    changeText,
    summaryNode,
    targetNode,
    overrides,
  }: SummaryRendererProps<'Likert'>): JSX.Element | null {
    return (
      <LikertSummary
        onChangeClick={onChangeClick}
        changeText={changeText}
        summaryNode={summaryNode}
        likertNode={targetNode}
        overrides={overrides}
      />
    );
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  getDisplayData(): string {
    return '';
  }

  /**
   * In a required Likert component, each unanswered question will be considered an error.
   */
  runEmptyFieldValidation(node: LayoutNode<'Likert'>, { formData }: ValidationDataSources): ComponentValidation[] {
    if (!node.item.required || !node.item.dataModelBindings) {
      return [];
    }

    const validations: ComponentValidation[] = [];
    const textResourceBindings = node.item.textResourceBindings;
    const rows = getLikertRows(dot.pick(node.item.dataModelBindings.questions, formData), node.item.filter);

    for (const row of rows || []) {
      const answerBinding = questionToAnswerBinding(node.item.dataModelBindings, row);
      const answer = answerBinding ? dot.pick(answerBinding, formData) : undefined;

      if (answer !== undefined && answer !== null) {
        continue;
      }

      const key = textResourceBindings?.requiredValidation
        ? textResourceBindings?.requiredValidation
        : 'form_filler.error_required';

      const fieldNameReference: TextReference = {
        key: textResourceBindings?.questions,
        makeLowerCase: true,
        dataModelPath: answerBinding,
      };

      validations.push({
        message: {
          key,
          params: [fieldNameReference],
          dataModelPath: answerBinding,
        },
        severity: 'error',
        componentId: node.item.id,
        source: FrontendValidationSource.EmptyField,
        category: ValidationMask.Required,
      });
    }

    return validations;
  }

  isDataModelBindingsRequired(): boolean {
    return true;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Likert'>): string[] {
    const bindings = ctx.node.item.dataModelBindings;
    const [questionsErr, questions] = this.validateDataModelBindingsAny(ctx, 'questions', ['array']);
    const [answerErr, answer] = this.validateDataModelBindingsAny(
      ctx,
      'answer',
      ['string', 'number', 'boolean'],
      true,
      'answer',
      (binding) => {
        // Insert a [0] at the end of the questions binding (if the answer binding is a sub-property of the
        // questions binding) to pretend the bindings include row indexes already (it doesn't at this point,
        // but useLikertRows() will figure it out)
        const questionsBinding = ctx.node.item.dataModelBindings.questions;
        if (questionsBinding && binding.startsWith(`${questionsBinding}.`)) {
          return binding.replace(`${questionsBinding}.`, `${questionsBinding}[0].`);
        }
        return binding;
      },
    );
    const errors: string[] = [...(questionsErr || []), ...(answerErr || [])];

    if (
      questions &&
      (!questions.items ||
        typeof questions.items !== 'object' ||
        Array.isArray(questions.items) ||
        questions.items.type !== 'object')
    ) {
      errors.push(`questions-datamodellbindingen peker mot en ukjent type i datamodellen (forventet type: object)`);
    }

    if (
      answer &&
      bindings &&
      bindings.answer &&
      bindings.questions &&
      !bindings.answer.startsWith(`${bindings.questions}.`)
    ) {
      errors.push(`answer-datamodellbindingen må peke på en egenskap inne i questions-datamodellbindingen`);
    }

    return errors;
  }
}
