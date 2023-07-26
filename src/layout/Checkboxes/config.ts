import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
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

  .addProperty(
    new CG.prop(
      'layout',
      new CG.known('LayoutStyle')
        .optional()
        .setTitle('Layout style')
        .setDescription('How the checkboxes should be laid out (rows, columns, etc.)'),
    ),
  );
