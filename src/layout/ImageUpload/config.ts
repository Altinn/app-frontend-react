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
      'viewport',
      new CG.enum('1:1', '4:3', '16:9', 'circle')
        .optional({ default: 'circle' })
        .setTitle('Viewport')
        .setDescription('The aspect ratio of the cropping area'),
    ),
  )
  .addSummaryOverrides();
