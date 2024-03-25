import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/ComponentConfig';
import { ExprVal } from 'src/features/expressions/types';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: LabelRendering.InSelf,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
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
