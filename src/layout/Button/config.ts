import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent({
  category: ComponentCategory.Action,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: true,
  },
})
  .addTextResource({
    name: 'title',
    title: 'Title',
    description: 'The title/text on the button',
  })
  .addProperty({
    name: 'mode',
    title: 'Mode',
    description: 'The mode of the button',
    value: CG.union(CG.const('submit'), CG.const('save'), CG.const('go-to-task'), CG.const('instantiate')).optional(
      CG.const('submit'),
    ),
  })
  .addProperty({
    name: 'taskId',
    title: 'Task ID',
    description: 'The ID of the task to go to (only used when mode is "go-to-task")',
    value: CG.str().optional(),
  })
  .addProperty({
    name: 'busyWithId',
    title: '(do not use)',
    description:
      'Possibly an internally used flag to make the button look like its loading (only used when mode is "instantiate")',
    value: CG.str().optional(),
  })
  .addProperty({
    name: 'mapping',
    title: 'Mapping',
    description: 'The data mapping to use when instantiating a new task (only used when mode is "instantiate")',
    value: CG.import({
      symbol: 'IMapping',
      importFrom: 'src/types',
    }).optional(),
  });
