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
  category: CompCategory.Container,
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
  .addProperty(new CG.prop('title', new CG.str()))
  .addDataModelBinding(
    new CG.obj(
      new CG.prop(
        'data',
        new CG.dataModelBinding()
          .setTitle('Data')
          .setDescription(
            'Dot notation location for a repeating group structure (array of objects), where the data is stored',
          ),
      ),
    ),
  )
  .addProperty(
    new CG.prop(
      'columnConfig',
      new CG.arr(
        new CG.obj(
          new CG.prop('header', new CG.str()),
          new CG.prop('accessor', new CG.str().setTitle('Title').setDescription('Title of the tab')),
        ).exportAs('ColumnConfig'),
      ).optional(),
    ),
  );
