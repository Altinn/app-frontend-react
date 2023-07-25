import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Form,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
  },
})
  .makeSelectionComponent()
  .addDataModelBinding('simple')

  // We don't render the label in GenericComponent, but we still need the
  // text resource bindings for rendering them on our own
  .addTextResourcesForLabel()

  .addProperty({
    name: 'layout',
    title: 'Layout style',
    description: 'How the checkboxes should be laid out (rows, columns, etc.)',
    value: CG.known('LayoutStyle').optional(),
  });
