import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { OptionsPlugin } from 'src/features/options/OptionsPlugin';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: LabelRendering.FromGenericComponent,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addPlugin(new OptionsPlugin({ supportsPreselection: true, type: 'single' }))
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'));
