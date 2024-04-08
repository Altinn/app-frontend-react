import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  rendersWithLabel: LabelRendering.Off,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: true,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the accordion',
    }),
  )
  .addSimpleChildrenPlugin(
    'List of child component IDs to show inside the Accordion (limited to a few component types)',
  )
  .addProperty(new CG.prop('headingLevel', CG.common('HeadingLevel').optional()));
