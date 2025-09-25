import { CG } from 'src/codegen/CG';
import { AttachmentsPlugin } from 'src/features/attachments/AttachmentsPlugin';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Form,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInTabs: true,
    renderInCards: true,
    renderInCardsMedia: false,
  },
  functionality: {
    customExpressions: true,
  },
})
  .addPlugin(new AttachmentsPlugin())
  .extendTextResources(CG.common('TRBLabel'))
  .addProperty(
    new CG.prop(
      'cropShape',
      new CG.enum('square', 'circle')
        .optional({ default: 'circle' })
        .setTitle('Shape')
        .setDescription('The shape of the cropping area'),
    ),
  )
  .addProperty(
    new CG.prop(
      'cropWidth',
      new CG.num().optional({ default: 250 }).setTitle('Width').setDescription('Optional width of the cropping area'),
    ),
  )
  .addProperty(
    new CG.prop(
      'cropHeight',
      new CG.num().optional({ default: 250 }).setTitle('Height').setDescription('Optional height of the cropping area'),
    ),
  )
  .addProperty(
    new CG.prop(
      'validFileEndings',
      new CG.union(new CG.arr(new CG.str()))
        .optional()
        .setTitle('Valid image file endings')
        .setDescription(
          'A separated string array of valid image file endings to upload. If not set all endings are accepted.',
        )
        .addExample(['.jpeg', 'jpg', '.png', '.svg', '.webP', '.gif']),
    ),
  )
  .addDataModelBinding(CG.common('IDataModelBindingsSimple').optional())
  .extends(CG.common('LabeledComponentProps'))
  .addSummaryOverrides();
