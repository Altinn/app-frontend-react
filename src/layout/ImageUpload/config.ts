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
      'cropArea',
      new CG.obj(
        new CG.prop(
          'type',
          new CG.enum('square', 'circle')
            .optional({ default: 'circle' })
            .setTitle('Shape')
            .setDescription('The shape of the cropping area'),
        ),
        new CG.prop(
          'width',
          new CG.num()
            .optional({ default: 300 })
            .setTitle('Width')
            .setDescription('Optional width of the cropping area'),
        ),
        new CG.prop(
          'height',
          new CG.num()
            .optional({ default: 300 })
            .setTitle('Height')
            .setDescription('Optional height of the cropping area'),
        ),
      )
        .optional({ default: { type: 'circle', width: 300, height: 300 } })
        .setTitle('Crop Area')
        .setDescription('Configuration of the cropping area'),
    ),
  )
  .addDataModelBinding(CG.common('IDataModelBindingsSimple').optional())
  .extends(CG.common('LabeledComponentProps'))
  .addSummaryOverrides();
