import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
  directRendering: true,
})
  .addProperty(
    new CG.prop(
      'target',
      new CG.obj(
        new CG.prop(
          'type',
          new CG.enum('page', 'layoutSet', 'component').optional({ default: 'component' }).setTitle('Mode'),
        ),
        new CG.prop('id', new CG.str().optional()),
        new CG.prop(
          'taskId',
          new CG.str()
            .optional()
            .setTitle('Task ID')
            .setDescription('Use this if you want to render something from another task.'),
        ),
      )
        .setDescription('Config for what should be rendered. If you set taskId, this property is optional.')
        .optional(),
    ),
  )
  .addProperty(new CG.prop('showPageInAccordion', new CG.bool().optional()))
  .addProperty(new CG.prop('isCompact', new CG.bool().optional()))
  .addProperty(
    new CG.prop(
      'hideEmptyFields',
      new CG.bool()
        .optional()
        .setDescription("Set this to true if you don't want to show fields that have not been filled out."),
    ),
  )
  .addProperty(new CG.prop('overrides', new CG.arr(CG.common('AnySummaryOverride')).optional()));
