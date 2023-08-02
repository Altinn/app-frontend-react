import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Presentation,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the alert',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'description',
      title: 'Description',
      description: 'The description/body of the alert',
    }),
  )
  .addProperty(
    new CG.prop(
      'severity',
      new CG.enum('success', 'warning', 'danger', 'info')
        .setTitle('Alert severity')
        .setDescription('The severity of the alert')
        .exportAs('AlertSeverity'),
    ),
  );
