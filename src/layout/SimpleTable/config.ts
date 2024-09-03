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
  .addProperty(new CG.prop('title', new CG.str()))
  .addProperty(
    new CG.prop(
      'columns',
      new CG.arr(
        new CG.obj(
          new CG.prop('id', new CG.str()),
          new CG.prop('title', new CG.str()),
          new CG.prop('type', new CG.str()),
          new CG.prop('path', new CG.str()),
        ),
      ),
    ),
  )
  .addProperty(
    new CG.prop(
      'data',
      new CG.obj(
        new CG.prop('type', new CG.const('externalApi')),
        new CG.prop('id', new CG.str()),
        new CG.prop('path', new CG.str()),
      ),
    ),
  );
