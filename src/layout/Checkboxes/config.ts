import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCardGroup: false,
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
  );
// We don't render the label in GenericComponent, but we still need the
// text resource bindings for rendering them on our own
Config.addTextResourcesForLabel().inner.extends(CG.common('LabeledComponentProps'));
