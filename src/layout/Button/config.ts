import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Action,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title/text on the button',
    }),
  )
  .addProperty(
    new CG.prop(
      'mode',
      new CG.enum('submit', 'save', 'go-to-task', 'instantiate')
        .optional('submit')
        .setTitle('Mode')
        .setDescription('The mode of the button'),
    ),
  )
  .addProperty(
    new CG.prop(
      'taskId',
      new CG.str()
        .optional()
        .setTitle('Task ID')
        .setDescription('The ID of the task to go to (only used when mode is "go-to-task")'),
    ),
  )
  .addProperty(
    new CG.prop(
      'busyWithId',
      new CG.str()
        .optional()
        .setTitle('(do not use)')
        .setDescription(
          'Possibly an internally used flag to make the button look like its loading (only used when mode is "instantiate")',
        ),
    ),
  )
  .addProperty(
    new CG.prop(
      'mapping',
      new CG.known('IMapping')
        .optional()
        .setTitle('Mapping')
        .setDescription('The data mapping to use when instantiating a new task (only used when mode is "instantiate")'),
    ),
  );
