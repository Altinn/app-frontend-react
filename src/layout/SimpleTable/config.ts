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
          new CG.prop(
            'component',
            new CG.union(
              new CG.obj(new CG.prop('type', new CG.const('Text')), new CG.prop('valuePath', new CG.str())),
              new CG.obj(
                new CG.prop('type', new CG.const('Link')),
                new CG.prop('hrefPath', new CG.str()),
                new CG.prop('textPath', new CG.str()),
              ),
            ).setUnionType('discriminated'),
          ),
        ).exportAs('ColumnConfig'),
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
      ).exportAs('DataConfig'),
    ),
  );
