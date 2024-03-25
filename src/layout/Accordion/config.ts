import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/ComponentConfig';
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
})
  .setLayoutNodeType(
    new CG.import({
      import: 'AccordionNode',
      from: 'src/layout/Accordion/AccordionNode',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the accordion',
    }),
  )
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription('List of child component IDs to show inside the Accordion (limited to a few component types)'),
    ),
  )
  .addProperty(new CG.prop('headingLevel', CG.common('HeadingLevel').optional()));
