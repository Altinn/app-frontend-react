import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { CompCategory } from 'src/layout/common';
import { GridRowsPlugin } from 'src/layout/Grid/GridRowsPlugin';

export const Config = new CG.component({
  category: CompCategory.Container,
  rendersWithLabel: LabelRendering.InSelf,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addPlugin(new GridRowsPlugin())
  .addProperty(new CG.prop('rows', CG.common('GridRows')));
