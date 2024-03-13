import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { LikertDef } from 'src/layout/Likert/config.def.generated';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { LikertSummary } from 'src/layout/Likert/Summary/LikertSummary';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { ComponentValidation } from 'src/features/validation';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Likert extends LikertDef {
  directRender(): boolean {
    return true;
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Likert'>>(
    function LayoutComponentLikertRender(props, _): JSX.Element | null {
      return <LikertComponent {...props} />;
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

  // This component does not have empty field validation, so has to override its inherited method
  runEmptyFieldValidation(): ComponentValidation[] {
    return [];
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
