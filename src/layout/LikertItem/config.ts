import { CG, Variant } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
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
  .addProperty(
    new CG.prop(
      'showLabelsInTable',
      new CG.bool()
        .optional({ default: false })
        .setTitle('Show label when single option in table')
        .setDescription('Boolean value indicating if the label should be visible when only one option exists in table'),
    ),
  )
  .makeSelectionComponent()
  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()))
  .addProperty(
    new CG.prop('showAsCard', new CG.bool().optional()).onlyIn(
      // TODO: This should probably not be available on the Likert component (if it should, only on mobile?)
      // Marking it as internal only for now, in case it is needed for some reason.
      Variant.Internal,
    ),
  );
