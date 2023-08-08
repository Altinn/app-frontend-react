import { CG, Variant } from 'src/codegen/CG';
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
  .makeSelectionComponent()
  .addDataModelBinding(CG.common('IDataModelBindingsSimple').optional({ onlyIn: Variant.Internal }))

  // We don't render the label in GenericComponent, but we still need the
  // text resource bindings for rendering them on our own
  .addTextResourcesForLabel()

  .addProperty(new CG.prop('layout', CG.common('LayoutStyle').optional()));
