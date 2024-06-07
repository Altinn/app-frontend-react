import { CG, Variant } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { CompCategory } from 'src/layout/common';

export const CHECKBOX_SUMMARY_PROPS = new CG.obj(
  new CG.prop(
    'hidden',
    new CG.bool()
      .optional()
      .setTitle('Hidden')
      .setDescription('Boolean value indicating if the component should be hidden in the summary'),
  ),
  new CG.prop(
    'displayType',
    new CG.enum('list', 'string')
      .optional()
      .setTitle('Display type')
      .setDescription('How data should be displayed for the radio in the summary'),
  ),
)
  .extends(CG.common('ISummaryOverridesCommon'))
  .optional()
  .setTitle('Summary properties')
  .setDescription('Properties for how to display the summary of the component');

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: false,
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
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'))
  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()))
  .addProperty(
    new CG.prop(
      'alertOnChange',
      new CG.expr(ExprVal.Boolean)
        .optional({ default: false })
        .setTitle('Alert on change')
        .setDescription('Boolean value indicating if the component should alert on uncheck'),
    ),
  )
  .addProperty(new CG.prop('summaryProps', CHECKBOX_SUMMARY_PROPS).onlyIn(Variant.Internal));
// We don't render the label in GenericComponent, but we still need the
// text resource bindings for rendering them on our own
Config.addTextResourcesForLabel().inner.extends(CG.common('LabeledComponentProps'));
