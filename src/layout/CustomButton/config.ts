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
            new CG.obj(new CG.prop('name', new CG.const('$nextPage'))).exportAs('NextPageAction'),
            new CG.obj(new CG.prop('name', new CG.const('$previousPage'))).exportAs('PreviousPageAction'),
            new CG.obj(
              new CG.prop('name', new CG.const('$navigateToPage')),
              new CG.prop('metadata', new CG.obj(new CG.prop('page', new CG.str()))),
            ).exportAs('NavigateToPageAction'),
          ).exportAs('FrontendAction'),
          new CG.obj(new CG.prop('name', new CG.str())).exportAs('UserAction'),
        ).exportAs('CustomAction'),
      ),
    ),
  )
  .addTextResource(new CG.trb({ name: 'label', title: 'label', description: 'The title of the button' }));
