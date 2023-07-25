import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';
import { asUploaderComponent } from 'src/layout/FileUpload/config';

export const Generator = asUploaderComponent(
  CG.newComponent({
    category: ComponentCategory.Form,
    rendersWithLabel: true,
    capabilities: {
      renderInTable: false,
      renderInButtonGroup: false,
    },
  }),
)
  .addTextResource({
    name: 'tagTitle',
    title: 'Tag title',
    description: 'The title to show when selecting a tag for each uploaded file',
  })
  .makeSelectionComponent(true);
