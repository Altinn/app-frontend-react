import { CG, Variant } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { CompCategory } from 'src/layout/common';

export const RADIO_SUMMARY_PROPS = new CG.obj(
  new CG.prop(
    'hidden',
    new CG.bool()
      .optional()
      .setTitle('Hidden')
      .setDescription('Boolean value indicating if the component should be hidden in the summary'),
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
  },
})
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'))
  .makeSelectionComponent()
  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()))
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
      'showAsCard',
      new CG.bool()
        .optional()
        .setTitle('Show as card')
        .setDescription('Boolean value indicating if the options should be displayed as cards. Defaults to false.'),
    ),
  )
  .addProperty(new CG.prop('summaryProps', RADIO_SUMMARY_PROPS).onlyIn(Variant.Internal));

// We don't render the label in GenericComponent, but we still need the
// text resource bindings for rendering them on our own
Config.addTextResourcesForLabel().inner.extends(CG.common('LabeledComponentProps'));
