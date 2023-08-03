import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  // We don't render the label in GenericComponent, but we still need the
  // text resource bindings for rendering them on our own
  .addTextResourcesForLabel()

  .addDataModelBinding('simple')
  .makeSelectionComponent()
  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()))
  .addProperty(
    new CG.prop(
      'showAsCard',
      new CG.bool()
        .optional()
        .setTitle('Show as card')
        .setDescription('Boolean value indicating if the options should be displayed as cards. Defaults to false.'),
    ),
  );
