import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { CompCategory } from 'src/layout/common';

export const DROPDOWN_SUMMARY_OVERRIDE_PROPS = new CG.obj()
  .extends(CG.common('ISummaryOverridesCommon'))
  .optional()
  .setTitle('Summary properties')
  .setDescription('Properties for how to display the summary of the component')
  .exportAs('DropdownSummaryOverrideProps');

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: true,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
  },
})
  .makeSelectionComponent()
  .addProperty(
    new CG.prop(
      'alertOnChange',
      new CG.expr(ExprVal.Boolean)
        .optional({ default: false })
        .setTitle('Alert on change')
        .setDescription('Boolean value indicating if the component should alert on change'),
    ),
  )
  .addProperty(
    new CG.prop(
      'placeholder',
      new CG.expr(ExprVal.String)
        .optional({ default: 'lol as' })
        .setTitle('Alert on change')
        .setDescription('Boolean value indicating if the component should alert on change'),
    ),
  )
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'));
