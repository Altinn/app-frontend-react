import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { ComponentCategory } from 'src/layout/common';
import type { ComponentConfig } from 'src/codegen/ComponentConfig';

export const Generator = asUploaderComponent(
  CG.newComponent({
    category: ComponentCategory.Form,
    rendersWithLabel: true,
    capabilities: {
      renderInTable: false,
      renderInButtonGroup: false,
    },
  }),
);

export function asUploaderComponent(config: ComponentConfig) {
  return config
    .addDataModelBinding('simple')
    .addDataModelBinding('list')
    .addProperty({
      name: 'maxFileSizeInMB',
      title: 'Max file size (MB)',
      description: 'Sets the maximum file size allowed in megabytes',
      value: CG.int(),
    })
    .addProperty({
      name: 'maxNumberOfAttachments',
      title: 'Max number of attachments',
      description: 'Sets the maximum number of attachments allowed to upload',
      value: CG.int(),
    })
    .addProperty({
      name: 'minNumberOfAttachments',
      title: 'Min number of attachments',
      description: 'Sets the minimum number of attachments required to upload',
      value: CG.int(),
    })
    .addProperty({
      name: 'displayMode',
      title: 'Display mode',
      description: 'Sets the display mode of the file upload component',
      value: CG.union(CG.const('simple'), CG.const('list')),
    })
    .addProperty({
      name: 'hasCustomFileEndings',
      title: 'Has custom file endings',
      description: 'Boolean value indicating if the component has valid file endings',
      value: CG.bool(),
    })
    .addProperty({
      name: 'validFileEndings',
      title: 'Valid file endings',
      description: 'A separated string of valid file endings to upload. If not set all endings are accepted.',
      examples: ['.csv', '.doc', '.docx', '.gif', '.jpeg', '.pdf', '.txt'],
      value: CG.union(CG.str(), CG.arr(CG.str())).optional(),
    })
    .addProperty({
      name: 'alertOnDelete',
      title: 'Alert on delete',
      description: 'Boolean value indicating if warning popup should be displayed when attempting to delete an element',
      value: CG.expr(ExprVal.Boolean).optional(CG.false()),
    });
}
