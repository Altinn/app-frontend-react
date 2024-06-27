import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { OptionsPlugin } from 'src/features/options/OptionsPlugin';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  rendersWithLabel: LabelRendering.Off,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
    renderInTabs: false,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addDataModelBinding(CG.common('IDataModelBindingsOptionsSimple'))
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'Title of the Likert component/row',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'description',
      title: 'Description',
      description: 'Description of the Likert component/row',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'help',
      title: 'Help',
      description: 'Help text of the Likert component/row',
    }),
  )
  .addPlugin(new OptionsPlugin({ supportsPreselection: true, type: 'single' }))
  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()));
