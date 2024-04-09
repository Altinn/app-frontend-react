import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { AlertOnChangePlugin } from 'src/features/alertOnChange/AlertOnChangePlugin';
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
  functionality: {
    customExpressions: false,
  },
})
  .makeSelectionComponent()
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'))
  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()))
  .addPlugin(
    new AlertOnChangePlugin({
      propName: 'alertOnChange',
      title: 'Alert on change',
      description: 'Boolean value indicating if the component should alert on change',
    }),
  );
