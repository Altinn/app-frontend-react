import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Action,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addProperty(
    new CG.prop(
      'actions',
      new CG.arr(
        new CG.union(
          new CG.union(
            new CG.obj(
              new CG.prop('name', new CG.const('$nextPage')),
              new CG.prop('type', new CG.const('FrontendAction')),
            ).exportAs('NextPageAction'),
            new CG.obj(
              new CG.prop('name', new CG.const('$previousPage')),
              new CG.prop('type', new CG.const('FrontendAction')),
            ).exportAs('PreviousPageAction'),
            new CG.obj(
              new CG.prop('name', new CG.const('$navigateToPage')),
              new CG.prop('type', new CG.const('FrontendAction')),
              new CG.prop('metadata', new CG.obj(new CG.prop('page', new CG.str()))),
            ).exportAs('NavigateToPageAction'),
          ).exportAs('FrontendAction'),
          new CG.obj(new CG.prop('name', new CG.str()), new CG.prop('type', new CG.const('UserAction'))).exportAs(
            'UserAction',
          ),
        ).exportAs('CustomAction'),
      ),
    ),
  )
  .addTextResource(new CG.trb({ name: 'label', title: 'label', description: 'The title of the button' }));
