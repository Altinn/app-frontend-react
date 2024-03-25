import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: LabelRendering.FromGenericComponent,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'))
  .makeSelectionComponent();
