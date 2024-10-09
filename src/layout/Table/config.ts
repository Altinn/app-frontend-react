// import { CG } from 'src/codegen/CG';
// import { CompCategory } from 'src/layout/common';
//
// export const Config = new CG.component({
//   category: CompCategory.Presentation,
//   capabilities: {
//     renderInTable: false,
//     renderInButtonGroup: false,
//     renderInAccordion: false,
//     renderInAccordionGroup: false,
//     renderInCards: false,
//     renderInCardsMedia: false,
//     renderInTabs: true,
//   },
//   functionality: {
//     customExpressions: false,
//   },
// }).addTextResource(
//   new CG.trb({
//     name: 'title',
//     title: 'Title',
//     description: 'The title of the table',
//   }),
// );

import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
})
  .extends(CG.common('LabeledComponentProps'))
  .addProperty(new CG.prop('title', new CG.str()));
